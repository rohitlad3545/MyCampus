import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/v1";

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const studentId = localStorage.getItem("id");
    const token = localStorage.getItem("jwtToken");
    const controller = new AbortController();

    async function fetchResults() {
      try {
        if (!studentId || !token) {
          throw new Error("Please log in again to view your results.");
        }

        const response = await fetch(
          `${API}/student/results/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

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
              `Failed to load results (HTTP ${response.status}).`
          );
        }

        if (!result) {
          throw new Error("The results API returned an empty response.");
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
            result.message || "The API did not return a results list."
          );
        }

        setResults(records);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load results.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchResults();

    return () => controller.abort();
  }, []);

  const average = results.length
    ? (
        results.reduce(
          (sum, item) => sum + (Number(item.marks) || 0),
          0
        ) / results.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Results</h2>
          <p className="text-muted mb-0">
            Review your examination marks and grades.
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
              <p className="text-muted mb-2">Published Results</p>
              <h3 className="fw-bold mb-0">
                {loading ? "—" : results.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Average Marks</p>
              <h3 className="fw-bold text-primary mb-0">
                {loading ? "—" : average}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Subjects with Results</p>
              <h3 className="fw-bold text-success mb-0">
                {loading
                  ? "—"
                  : new Set(
                      results.map(
                        (item) => item.subject?.id ?? item.subjectName
                      )
                    ).size}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-3 p-md-4">
          <h5 className="fw-bold mb-3">Result Records</h5>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="text-muted mt-3">Loading results...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <strong>Unable to load results</strong>
              <div className="mt-1">{error}</div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-check display-4 text-secondary"></i>
              <h5 className="mt-3">No results available</h5>
              <p className="text-muted mb-0">
                Your results will appear here once they are published.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Exam</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Grade Point</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item, index) => (
                    <tr key={item.id ?? index}>
                      <td>{index + 1}</td>
                      <td>
                        {item.subject?.name || item.subjectName || "—"}
                      </td>
                      <td>
                        {item.exam?.name || item.examName || "—"}
                      </td>
                      <td>{item.marks ?? "—"}</td>
                      <td>
                        <span className="badge bg-primary">
                          {item.grade || "—"}
                        </span>
                      </td>
                      <td>{item.gradePoint ?? "—"}</td>
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