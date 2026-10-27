/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/v1";

const emptyForm = {
  courseId: "",
  semesterId: "",
  academicYearId: "",
  totalAmount: "",
};

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function FeeStructureManagement() {
  const [form, setForm] = useState(emptyForm);
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("jwtToken");

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const text = await response.text();
    let result = null;

    if (text.trim()) {
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`Invalid server response (HTTP ${response.status}).`);
      }
    }

    if (!response.ok) {
      throw new Error(
        result?.message || `Request failed (HTTP ${response.status}).`
      );
    }

    return result;
  }

  async function loadStructures() {
    setLoading(true);
    setError("");

    try {
      const result = await request("/admin/fee-structure/all");
      const records = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.data)
        ? result.data.data
        : null;

      if (!records) {
        throw new Error(
          "The fee structure list endpoint did not return an array."
        );
      }

      setStructures(records);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStructures();
    // Load once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
    setError("");
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const courseId = Number(form.courseId);
    const semesterId = Number(form.semesterId);
    const academicYearId = Number(form.academicYearId);
    const totalAmount = Number(form.totalAmount);

    if (
      !Number.isInteger(courseId) ||
      courseId <= 0 ||
      !Number.isInteger(semesterId) ||
      semesterId <= 0 ||
      !Number.isInteger(academicYearId) ||
      academicYearId <= 0
    ) {
      setError("Enter valid positive IDs for course, semester, and academic year.");
      return;
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      setError("Fee amount must be greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const result = await request("/admin/fee-structure/add", {
        method: "POST",
        body: JSON.stringify({
          course: { id: courseId },
          semester: { id: semesterId },
          academicYear: { id: academicYearId },
          totalAmount,
        }),
      });

      setMessage(result?.message || "Fee structure added successfully.");
      setForm(emptyForm);
      await loadStructures();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredStructures = structures.filter((item) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return true;

    return [
      item.course?.name,
      item.semester?.semesterNumber,
      item.academicYear?.year,
      item.academicYear?.name,
      item.id,
    ].some((value) => String(value ?? "").toLowerCase().includes(searchText));
  });

  return (
    <div className="container-fluid px-0">
      <style>{`
        .fee-admin-card {
          border: 1px solid #edf0f5;
          border-radius: 15px;
          box-shadow: 0 3px 12px rgba(30,41,59,.035);
        }
        .fee-admin-input {
          border-radius: 10px;
          padding: 11px 13px;
        }
        .fee-admin-label {
          font-weight: 600;
          font-size: .9rem;
          margin-bottom: 7px;
        }
      `}</style>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="small text-muted mb-1">
            Administration / Finance
          </div>
          <h2 className="fw-bold mb-1">Fee Structure Management</h2>
          <p className="text-muted mb-0">
            Configure course and semester fees for each academic year.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadStructures}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2" />
          Refresh
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card fee-admin-card h-100">
            <div className="card-body d-flex align-items-center gap-3 p-4">
              <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-3">
                <i className="bi bi-receipt fs-4" />
              </div>
              <div>
                <div className="text-muted small">Fee Structures</div>
                <h3 className="fw-bold mb-0">
                  {loading ? "—" : structures.length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card fee-admin-card h-100">
            <div className="card-body d-flex align-items-center gap-3 p-4">
              <div className="rounded-3 bg-success bg-opacity-10 text-success p-3">
                <i className="bi bi-currency-rupee fs-4" />
              </div>
              <div>
                <div className="text-muted small">Average Fee</div>
                <h3 className="fw-bold mb-0">
                  {loading || structures.length === 0
                    ? money(0)
                    : money(
                        structures.reduce(
                          (sum, item) => sum + Number(item.totalAmount || 0),
                          0
                        ) / structures.length
                      )}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card fee-admin-card h-100">
            <div className="card-body d-flex align-items-center gap-3 p-4">
              <div className="rounded-3 bg-warning bg-opacity-10 text-warning p-3">
                <i className="bi bi-mortarboard fs-4" />
              </div>
              <div>
                <div className="text-muted small">Course Coverage</div>
                <h3 className="fw-bold mb-0">
                  {loading
                    ? "—"
                    : new Set(
                        structures.map((item) => item.course?.id).filter(Boolean)
                      ).size}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card fee-admin-card mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center gap-2 mb-4">
            <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-2">
              <i className="bi bi-plus-circle fs-5" />
            </div>
            <div>
              <h5 className="fw-bold mb-0">Add Fee Structure</h5>
              <small className="text-muted">
                Set the fee amount for a course, semester, and academic year.
              </small>
            </div>
          </div>

          {message && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle me-2" />
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-circle me-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fee-admin-label" htmlFor="courseId">
                  Course ID
                </label>
                <input
                  id="courseId"
                  className="form-control fee-admin-input"
                  type="number"
                  min="1"
                  name="courseId"
                  value={form.courseId}
                  onChange={updateField}
                  placeholder="e.g. 1"
                  required
                />
                <div className="form-text">Use an existing course ID.</div>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fee-admin-label" htmlFor="semesterId">
                  Semester ID
                </label>
                <input
                  id="semesterId"
                  className="form-control fee-admin-input"
                  type="number"
                  min="1"
                  name="semesterId"
                  value={form.semesterId}
                  onChange={updateField}
                  placeholder="e.g. 1"
                  required
                />
                <div className="form-text">Use an existing semester ID.</div>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fee-admin-label" htmlFor="academicYearId">
                  Academic Year ID
                </label>
                <input
                  id="academicYearId"
                  className="form-control fee-admin-input"
                  type="number"
                  min="1"
                  name="academicYearId"
                  value={form.academicYearId}
                  onChange={updateField}
                  placeholder="e.g. 1"
                  required
                />
                <div className="form-text">
                  Use an existing academic year ID.
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fee-admin-label" htmlFor="totalAmount">
                  Total Fee Amount (₹)
                </label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    id="totalAmount"
                    className="form-control fee-admin-input"
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="totalAmount"
                    value={form.totalAmount}
                    onChange={updateField}
                    placeholder="e.g. 50000"
                    required
                  />
                </div>
                {Number(form.totalAmount) > 0 && (
                  <div className="form-text text-primary fw-semibold">
                    Preview: {money(form.totalAmount)}
                  </div>
                )}
              </div>

              <div className="col-12 d-flex justify-content-end">
                <button
                  className="btn btn-light border me-2"
                  type="button"
                  onClick={() => {
                    setForm(emptyForm);
                    setError("");
                    setMessage("");
                  }}
                  disabled={saving}
                >
                  Clear
                </button>
                <button
                  className="btn btn-primary px-4"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-lg me-2" />
                      Add Fee Structure
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card fee-admin-card">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h5 className="fw-bold mb-1">Existing Fee Structures</h5>
              <p className="text-muted small mb-0">
                Review configured course fees.
              </p>
            </div>

            <div className="input-group" style={{ maxWidth: 320 }}>
              <span className="input-group-text bg-white">
                <i className="bi bi-search" />
              </span>
              <input
                className="form-control"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search course or semester..."
                aria-label="Search fee structures"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="text-muted mt-3">Loading fee structures...</p>
            </div>
          ) : structures.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-receipt display-5 text-secondary" />
              <h6 className="fw-bold mt-3">No fee structures found</h6>
              <p className="text-muted mb-0">
                Add your first fee structure using the form above.
              </p>
            </div>
          ) : filteredStructures.length === 0 ? (
            <div className="alert alert-light border mb-0">
              No fee structures match your search.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Academic Year</th>
                    <th className="text-end">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStructures.map((item, index) => (
                    <tr key={item.id ?? index}>
                      <td>{item.id ?? "—"}</td>
                      <td className="fw-semibold">
                        {item.course?.name || "—"}
                      </td>
                      <td>
                        {item.semester?.semesterNumber != null
                          ? `Semester ${item.semester.semesterNumber}`
                          : item.semester?.name || "—"}
                      </td>
                      <td>
                        {item.academicYear?.year ||
                          item.academicYear?.name ||
                          "—"}
                      </td>
                      <td className="text-end fw-bold">
                        {money(item.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}