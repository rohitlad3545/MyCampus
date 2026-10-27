import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/v1";

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const controller = new AbortController();

    async function fetchExams() {
      try {
        if (!token) {
          throw new Error("Please log in again to view exams.");
        }

        const response = await fetch(`${API}/student/exams/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        const text = await response.text();
        let result = null;

        if (text.trim()) {
          try {
            result = JSON.parse(text);
          } catch {
            throw new Error(
              `Invalid server response (HTTP ${response.status}).`
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              `Failed to load exams (HTTP ${response.status}).`
          );
        }

        if (!result) {
          throw new Error("The exams API returned an empty response.");
        }

        const records = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.data)
          ? result.data.data
          : null;

        if (!records) {
          throw new Error(
            result.message || "The API did not return an exams list."
          );
        }

        setExams(records);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load exams.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchExams();

    return () => controller.abort();
  }, []);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString();
  };

  const getExamStatus = (date) => {
    if (!date) return "Date not announced";

    const examDate = new Date(date);
    if (Number.isNaN(examDate.getTime())) return "Date not announced";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    if (examDate < today) return "Completed";
    if (examDate.getTime() === today.getTime()) return "Today";
    return "Upcoming";
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Exams</h2>
          <p className="text-muted mb-0">
            View your examination schedule and dates.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Total Exams</p>
              <h3 className="fw-bold mb-0">
                {loading ? "—" : exams.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Upcoming Exams</p>
              <h3 className="fw-bold text-primary mb-0">
                {loading
                  ? "—"
                  : exams.filter(
                      (exam) =>
                        getExamStatus(exam.date) === "Upcoming" ||
                        getExamStatus(exam.date) === "Today"
                    ).length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Completed Exams</p>
              <h3 className="fw-bold text-success mb-0">
                {loading
                  ? "—"
                  : exams.filter(
                      (exam) => getExamStatus(exam.date) === "Completed"
                    ).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-3 p-md-4">
          <h5 className="fw-bold mb-3">Examination Schedule</h5>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="text-muted mt-3">Loading exams...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <strong>Unable to load exams</strong>
              <div className="mt-1">{error}</div>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar2-event display-4 text-secondary"></i>
              <h5 className="mt-3">No exams scheduled</h5>
              <p className="text-muted mb-0">
                Your exam schedule will appear here when published.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Exam Name</th>
                    <th>Exam Type</th>
                    <th>Date</th>
                    <th>Semester</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((exam, index) => {
                    const status = getExamStatus(exam.date);

                    const badgeClass =
                      status === "Completed"
                        ? "bg-success"
                        : status === "Today"
                        ? "bg-warning text-dark"
                        : status === "Upcoming"
                        ? "bg-primary"
                        : "bg-secondary";

                    return (
                      <tr key={exam.id ?? index}>
                        <td>{index + 1}</td>
                        <td className="fw-semibold">
                          {exam.name || "Unnamed exam"}
                        </td>
                        <td>{exam.examType || "—"}</td>
                        <td>{formatDate(exam.date)}</td>
                        <td>
                          {exam.semester?.semesterNumber ??
                            exam.semester?.name ??
                            "—"}
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>
                            {status}
                          </span>
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
    </div>
  );
}