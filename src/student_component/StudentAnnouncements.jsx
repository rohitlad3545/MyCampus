import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/v1";

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const controller = new AbortController();

    async function fetchAnnouncements() {
      try {
        if (!token) {
          throw new Error("Please log in again to view announcements.");
        }

        const response = await fetch(
          `${API}/student/announcements/all`,
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
              `Failed to load announcements (HTTP ${response.status}).`
          );
        }

        if (!result) {
          throw new Error(
            "The announcements API returned an empty response."
          );
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
            result.message ||
              "The API did not return an announcements list."
          );
        }

        setAnnouncements(records);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load announcements.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAnnouncements();

    return () => controller.abort();
  }, []);

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString();
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Announcements</h2>
          <p className="text-muted mb-0">
            Stay updated with college notices and announcements.
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

      {loading ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="text-muted mt-3 mb-0">
              Loading announcements...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <strong>Unable to load announcements</strong>
          <div className="mt-1">{error}</div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-megaphone display-4 text-secondary"></i>
            <h5 className="mt-3">No announcements available</h5>
            <p className="text-muted mb-0">
              New college announcements will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {announcements.map((item, index) => (
            <div className="col-12" key={item.id ?? index}>
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex gap-3">
                    <div
                      className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 48, height: 48 }}
                    >
                      <i className="bi bi-megaphone fs-5"></i>
                    </div>

                    <div className="flex-grow-1">
                      <h5 className="fw-bold mb-2">
                        {item.title || "College Announcement"}
                      </h5>

                      <p className="text-secondary mb-3">
                        {item.description || "No description provided."}
                      </p>

                      <div className="d-flex flex-wrap gap-3 text-muted small">
                        <span>
                          <i className="bi bi-calendar3 me-1"></i>
                          {formatDate(item.createdAt)}
                        </span>

                        {item.createdBy?.username && (
                          <span>
                            <i className="bi bi-person me-1"></i>
                            {item.createdBy.username}
                          </span>
                        )}

                        {item.department?.name && (
                          <span>
                            <i className="bi bi-building me-1"></i>
                            {item.department.name}
                          </span>
                        )}

                        {item.course?.name && (
                          <span>
                            <i className="bi bi-book me-1"></i>
                            {item.course.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}