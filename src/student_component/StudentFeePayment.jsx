
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";

const API = "http://localhost:8080/api/v1/student/payments";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value || 0));

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existing.addEventListener("error", () => resolve(false), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function StudentFeePayment() {
  const [fees, setFees] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const request = async (path, options = {}) => {
    const token = localStorage.getItem("jwtToken");

    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.detail ||
        `Request failed (${response.status})`
      );
    }

    return data;
  };

  const refresh = async () => {
    const [feeData, paymentData] = await Promise.all([
      request("/fees"),
      request("/history"),
    ]);

    setFees(feeData);
    setHistory(paymentData);
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const [feeData, paymentData] = await Promise.all([
          request("/fees"),
          request("/history"),
        ]);

        if (active) {
          setFees(feeData);
          setHistory(paymentData);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, []);

  const payFee = async (fee) => {
    setError("");
    setMessage("");
    setPayingId(fee.id);

    try {
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        throw new Error("Razorpay Checkout could not load.");
      }

      const order = await request(
        `/create-order/${fee.id}`,
        { method: "POST" }
      );

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "MyCampus",
        description: `Student fee #${fee.id}`,
        prefill: {
          name: order.studentName,
        },
        theme: {
          color: "#0d6efd",
        },
        handler: async (response) => {
          try {
            const result = await request("/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_signature:
                  response.razorpay_signature,
              }),
            });

            setMessage(
              result.message || "Payment verified successfully!"
            );

            await refresh();
          } catch (err) {
            setError(
              `Payment confirmation pending: ${err.message}. ` +
              "Do not pay again until the transaction is checked."
            );
          } finally {
            setPayingId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPayingId(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setError(
          response.error?.description ||
          "Payment failed. Please try again."
        );
        setPayingId(null);
      });

      razorpay.open();
    } catch (err) {
      setError(err.message);
      setPayingId(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      <h3 className="fw-bold mb-4">
        <i className="bi bi-credit-card me-2" />
        Student Fee Payment
      </h3>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      {loading ? (
        <p>Loading your fees...</p>
      ) : (
        <>
          <div className="card shadow-sm mb-4">
            <div className="card-header fw-semibold">
              My Fee Details
            </div>

            <div className="card-body table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Fee ID</th>
                    <th>Total</th>
                    <th>Discount</th>
                    <th>Late Fee</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {fees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No fees assigned
                      </td>
                    </tr>
                  ) : (
                    fees.map((fee) => (
                      <tr key={fee.id}>
                        <td>{fee.id}</td>
                        <td>{money(fee.totalAmount)}</td>
                        <td>{money(fee.discount)}</td>
                        <td>{money(fee.lateFee)}</td>
                        <td>{money(fee.amountPaid)}</td>
                        <td className="fw-semibold">
                          {money(fee.balance)}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              fee.status === "PAID"
                                ? "bg-success"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {fee.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={
                              payingId !== null ||
                              Number(fee.balance) <= 0
                            }
                            onClick={() => payFee(fee)}
                          >
                            {payingId === fee.id
                              ? "Processing..."
                              : Number(fee.balance) <= 0
                                ? "Paid"
                                : "Pay Now"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header fw-semibold">
              Payment History
            </div>

            <div className="card-body table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Fee ID</th>
                    <th>Payment ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Paid At</th>
                  </tr>
                </thead>

                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No verified payments yet
                      </td>
                    </tr>
                  ) : (
                    history.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.feeId}</td>
                        <td className="text-break">
                          {payment.paymentId}
                        </td>
                        <td>{money(payment.amount)}</td>
                        <td>
                          <span className="badge bg-success">
                            {payment.status}
                          </span>
                        </td>
                        <td>
                          {payment.paidAt?.replace("T", " ")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
