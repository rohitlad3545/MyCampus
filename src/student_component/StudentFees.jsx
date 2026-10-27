/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";

const API = "http://localhost:8080/api/v1/student/payments";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN");
};

async function loadRazorpayScript() {
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function readResponse(response) {
  const text = await response.text();
  let data = {};

  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Invalid server response (HTTP ${response.status}).`);
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (HTTP ${response.status}).`
    );
  }

  return data;
}

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [selectedFee, setSelectedFee] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const token = localStorage.getItem("jwtToken");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token || ""}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    [token]
  );

  const fetchFees = useCallback(async () => {
    if (!token) {
      setError("Please log in again to view your fees.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/fees`, {
        headers: authHeaders,
      });
      const result = await readResponse(response);

      const records = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
        ? result.data
        : null;

      if (!records) {
        throw new Error("The server did not return a fee list.");
      }

      setFees(records);
    } catch (err) {
      setError(err.message || "Unable to load fees.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, token]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const getBalance = (fee) =>
    Math.max(0, Number(fee.balance) || 0);

  const totalAmount = fees.reduce(
    (sum, fee) => sum + (Number(fee.totalAmount) || 0),
    0
  );

  const totalPaid = fees.reduce(
    (sum, fee) => sum + (Number(fee.amountPaid) || 0),
    0
  );

  const totalBalance = fees.reduce(
    (sum, fee) => sum + getBalance(fee),
    0
  );

  const openPayment = (fee) => {
    setSelectedFee(fee);
    setPaymentError("");
  };

  const closePayment = () => {
    if (processing) return;
    setSelectedFee(null);
    setPaymentError("");
  };

  const handlePayment = async () => {
    if (!selectedFee || processing) return;

    setProcessing(true);
    setPaymentError("");

    try {
      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error(
          "Unable to load Razorpay Checkout. Check your internet connection."
        );
      }

      // Create the order on the backend. Never create trusted orders in React.
      const orderResponse = await fetch(
        `${API}/create-order/${selectedFee.id}`,
        {
          method: "POST",
          headers: authHeaders,
        }
      );

      const order = await readResponse(orderResponse);

      if (!order.orderId || !order.keyId || !Number(order.amount)) {
        throw new Error("The server returned incomplete Razorpay order details.");
      }

      const options = {
        key: order.keyId,
        amount: Number(order.amount),
        currency: order.currency || "INR",
        name: "MyCampus",
        description: "College fee payment",
        order_id: order.orderId,
        prefill: {
          name: order.studentName || "",
        },
        notes: {
          feeId: String(selectedFee.id),
        },
        theme: {
          color: "#0d6efd",
        },

        handler: async (response) => {
          try {
            setPaymentError("");

            // The backend must verify the signature and payment status.
            const verifyResponse = await fetch(`${API}/verify`, {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verification = await readResponse(verifyResponse);

            if (
              verification.success === false ||
              verification.verified === false ||
              verification.status === "FAILED"
            ) {
              throw new Error(
                verification.message || "Payment verification failed."
              );
            }

            // Only show a receipt after the backend accepts verification.
            setReceipt({
              transactionId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: Number(order.amount) / 100,
              date: new Date().toLocaleString("en-IN"),
              feeId: selectedFee.id,
              course:
                selectedFee.feeStructure?.course?.name || "College fee",
              semester:
                selectedFee.feeStructure?.semester?.semesterNumber,
              status: "Payment verified",
            });

            setSelectedFee(null);
            await fetchFees();
          } catch (err) {
            setPaymentError(
              `${err.message || "Payment verification failed."} If money was deducted, check your payment status before trying again.`
            );
          } finally {
            setProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (event) => {
        setPaymentError(
          event.error?.description ||
            "Payment failed. Please check the payment status before retrying."
        );
        setProcessing(false);
      });

      checkout.open();
      // Checkout's handler or dismiss callback completes the UI flow.
    } catch (err) {
      setPaymentError(err.message || "Unable to start payment.");
      setProcessing(false);
    }
  };

  const receiptTitle = "Razorpay Payment Receipt";

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Fees</h2>
          <p className="text-muted mb-0">
            Review your fee assignments, payments, and outstanding balance.
          </p>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={fetchFees}
          disabled={loading || processing}
        >
          <i className="bi bi-arrow-clockwise me-2" />
          Refresh
        </button>
      </div>

      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Fees",
            value: totalAmount,
            icon: "bi-wallet2",
            color: "primary",
          },
          {
            label: "Amount Paid",
            value: totalPaid,
            icon: "bi-check-circle",
            color: "success",
          },
          {
            label: "Outstanding Balance",
            value: totalBalance,
            icon: "bi-exclamation-circle",
            color: "danger",
          },
        ].map((card) => (
          <div className="col-12 col-md-4" key={card.label}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body d-flex align-items-center gap-3 p-4">
                <div
                  className={`rounded-3 p-3 bg-${card.color} bg-opacity-10 text-${card.color}`}
                >
                  <i className={`bi ${card.icon} fs-4`} />
                </div>
                <div>
                  <div className="text-muted small">{card.label}</div>
                  <h4 className={`fw-bold text-${card.color} mb-0`}>
                    {loading ? "—" : money(card.value)}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-3 p-md-4">
          <h5 className="fw-bold mb-3">Fee Records</h5>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="text-muted mt-3">Loading fee records...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : fees.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-receipt display-4 text-secondary" />
              <h5 className="mt-3">No fee records available</h5>
              <p className="text-muted mb-0">
                Your assigned fees will appear here once added by the college.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Fee Structure</th>
                    <th>Due Date</th>
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
                  {fees.map((fee, index) => {
                    const balance = getBalance(fee);
                    const status =
                      balance === 0
                        ? "PAID"
                        : Number(fee.amountPaid || 0) > 0
                        ? "PARTIAL"
                        : fee.status || "PENDING";

                    return (
                      <tr key={fee.id ?? index}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="fw-semibold">
                            {fee.feeStructure?.course?.name || "Course"}
                          </div>
                          <small className="text-muted">
                            {fee.feeStructure?.semester?.semesterNumber != null
                              ? `Semester ${fee.feeStructure.semester.semesterNumber}`
                              : "College fee"}
                          </small>
                        </td>
                        <td>{formatDate(fee.dueDate)}</td>
                        <td>{money(fee.totalAmount)}</td>
                        <td>{money(fee.discount)}</td>
                        <td>{money(fee.lateFee)}</td>
                        <td className="text-success">
                          {money(fee.amountPaid)}
                        </td>
                        <td className="fw-bold">{money(balance)}</td>
                        <td>
                          <span
                            className={`badge ${
                              status === "PAID"
                                ? "bg-success"
                                : status === "PARTIAL"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td>
                          {balance > 0 ? (
                            <button
                              className="btn btn-primary btn-sm text-nowrap"
                              onClick={() => openPayment(fee)}
                            >
                              <i className="bi bi-credit-card me-1" />
                              Pay Now
                            </button>
                          ) : (
                            <span className="text-success small">
                              <i className="bi bi-check-circle me-1" />
                              Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedFee && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            zIndex: 1050,
            background: "rgba(15,23,42,.6)",
            overflowY: "auto",
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePayment();
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4"
            style={{ width: "100%", maxWidth: 500 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
          >
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h4 className="fw-bold mb-1" id="payment-title">
                  Pay College Fees
                </h4>
                <p className="text-muted small mb-0">
                  Secure checkout powered by Razorpay.
                </p>
              </div>
              <button
                className="btn-close"
                aria-label="Close"
                onClick={closePayment}
                disabled={processing}
              />
            </div>

            <div className="rounded-3 p-3 mb-4 bg-primary bg-opacity-10">
              <div className="small text-muted">Outstanding balance</div>
              <h3 className="fw-bold text-danger my-1">
                {money(getBalance(selectedFee))}
              </h3>
              <div className="small">
                {selectedFee.feeStructure?.course?.name || "College fee"}
                {selectedFee.feeStructure?.semester?.semesterNumber != null
                  ? ` · Semester ${selectedFee.feeStructure.semester.semesterNumber}`
                  : ""}
              </div>
            </div>

            {paymentError && (
              <div className="alert alert-danger py-2">{paymentError}</div>
            )}

            <div className="alert alert-info small">
              You will pay the full outstanding balance. The payment will be
              recorded only after your server verifies it.
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={closePayment}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePayment}
                disabled={processing || getBalance(selectedFee) <= 0}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock me-2" />
                    Pay {money(getBalance(selectedFee))}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {receipt && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            zIndex: 1060,
            background: "rgba(15,23,42,.6)",
            overflowY: "auto",
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4"
            style={{ width: "100%", maxWidth: 500 }}
          >
            <div className="text-center mb-4">
              <div className="text-success display-4">
                <i className="bi bi-check-circle-fill" />
              </div>
              <h4 className="fw-bold">Payment verified</h4>
              <p className="text-muted">
                Your server accepted the payment verification response.
              </p>
            </div>

            <div className="border rounded-3 p-3">
              <div className="text-center border-bottom pb-3 mb-3">
                <h5 className="fw-bold mb-1">MyCampus</h5>
                <div className="small text-muted">{receiptTitle}</div>
              </div>

              <div className="text-center mb-3">
                <div className="small text-muted">Amount</div>
                <h2 className="fw-bold text-success">
                  {money(receipt.amount)}
                </h2>
              </div>

              {[
                ["Payment ID", receipt.transactionId],
                ["Order ID", receipt.orderId],
                ["Date", receipt.date],
                ["Fee record", receipt.feeId],
                ["Course", receipt.course],
                [
                  "Semester",
                  receipt.semester != null ? receipt.semester : "—",
                ],
                ["Status", receipt.status],
              ].map(([label, value]) => (
                <div
                  className="d-flex justify-content-between gap-3 py-2 border-bottom"
                  key={label}
                >
                  <span className="text-muted small">{label}</span>
                  <span className="small fw-semibold text-end text-break">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                className="btn btn-outline-secondary"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-2" />
                Print
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setReceipt(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
