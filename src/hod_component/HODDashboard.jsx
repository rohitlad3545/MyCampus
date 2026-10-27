/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:8080/api/v1";

const quickActions = [
  {
    title: "Manage Students",
    description: "View and manage department students",
    path: "/hod/students",
    icon: "bi-people-fill",
    color: "blue",
  },
  {
    title: "Manage Faculty",
    description: "Manage department faculty members",
    path: "/hod/faculty",
    icon: "bi-person-workspace",
    color: "green",
  },
  {
    title: "Manage Subjects",
    description: "Review department subjects",
    path: "/hod/subjects",
    icon: "bi-book-half",
    color: "purple",
  },
  {
    title: "Manage Exams",
    description: "Review and organize examinations",
    path: "/hod/exams",
    icon: "bi-journal-check",
    color: "orange",
  },
  {
    title: "Announcements",
    description: "Publish department updates",
    path: "/hod/announcements",
    icon: "bi-megaphone-fill",
    color: "pink",
  },
  {
    title: "Manage Timetable",
    description: "View and manage weekly class schedules",
    path: "/hod/timetable",
    icon: "bi-calendar-week-fill",
    color: "cyan",
  },
];

function extractData(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.data?.content)) return body.data.content;

  return [];
}

async function apiRequest(path, token, signal) {
  const response = await fetch(`${API}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal,
  });

  const text = await response.text();
  let body = null;

  if (text.trim()) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error(
        `${path}: Access denied (403). Check your Spring Security permissions.`
      );
    }

    throw new Error(
      body?.message || `${path}: Request failed (${response.status}).`
    );
  }

  return body;
}

function getExamDate(exam) {
  return (
    exam.examDate ||
    exam.date ||
    exam.startDate ||
    exam.exam?.examDate ||
    ""
  );
}

function getExamName(exam) {
  return (
    exam.title ||
    exam.examName ||
    exam.name ||
    exam.exam?.title ||
    exam.exam?.name ||
    "Examination"
  );
}

function getSubjectName(exam) {
  return (
    exam.subject?.name ||
    exam.subjectName ||
    exam.subject?.subjectName ||
    exam.exam?.subject?.name ||
    "—"
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HODDashboard() {
  const [hod, setHod] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [failures, setFailures] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboard = useCallback(async (signal) => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setError("Your login session was not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setFailures([]);

    try {
      const profileBody = await apiRequest(
        "/hod/student/me",
        token,
        signal
      );

      if (signal.aborted) return;

      const profile =
        profileBody?.data?.data ||
        profileBody?.data ||
        profileBody?.hod ||
        profileBody;

      const hodId = profile?.id ?? profile?.hodId;

      if (hodId == null) {
        throw new Error(
          "The HOD profile response did not contain an ID. Check /api/v1/hod/student/me."
        );
      }

      setHod(profile);

      const requests = [
        {
          name: "students",
          path: `/hod/student/all/${hodId}`,
          setter: setStudents,
        },
        {
          name: "faculty",
          path: `/hod/faculty/all/${hodId}`,
          setter: setFaculty,
        },
        {
          name: "subjects",
          path: `/hod/subject/all/${hodId}`,
          setter: setSubjects,
        },
        {
          name: "exams",
          path: "/hod/exam/all",
          setter: setExams,
        },
      ];

      const results = await Promise.allSettled(
        requests.map((request) =>
          apiRequest(request.path, token, signal)
        )
      );

      if (signal.aborted) return;

      const failed = [];

      results.forEach((result, index) => {
        const request = requests[index];

        if (result.status === "fulfilled") {
          request.setter(extractData(result.value));
        } else {
          failed.push({
            name: request.name,
            message:
              result.reason?.message || "Unable to load data.",
          });
        }
      });

      setFailures(failed);

      if (failed.length > 0) {
        setError(
          "Some dashboard information could not be loaded. See the details below."
        );
      }
    } catch (err) {
      if (!signal.aborted) {
        setError(err.message || "Unable to load the HOD dashboard.");
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadDashboard(controller.signal);

    return () => controller.abort();
  }, [loadDashboard, refreshKey]);

  const upcomingExams = exams
    .filter((exam) => {
      const value = getExamDate(exam);
      if (!value) return false;

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return date >= today;
    })
    .sort(
      (a, b) =>
        new Date(getExamDate(a)) - new Date(getExamDate(b))
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Department Students",
      value: students.length,
      icon: "bi-people-fill",
      color: "blue",
      note: "Students in department",
      path: "/hod/students",
      key: "students",
    },
    {
      label: "Faculty Members",
      value: faculty.length,
      icon: "bi-person-workspace",
      color: "green",
      note: "Department teaching staff",
      path: "/hod/faculty",
      key: "faculty",
    },
    {
      label: "Subjects",
      value: subjects.length,
      icon: "bi-book-half",
      color: "purple",
      note: "Available subjects",
      path: "/hod/subjects",
      key: "subjects",
    },
    {
      label: "Examinations",
      value: exams.length,
      icon: "bi-journal-check",
      color: "orange",
      note: "Total scheduled exams",
      path: "/hod/exams",
      key: "exams",
    },
  ];

  return (
    <div className="container-fluid hod-dashboard">
      <style>{`
        .hod-dashboard {
          --hod-primary: #2563eb;
          --hod-text: #172b4d;
          --hod-muted: #718096;
          color: var(--hod-text);
          background: #f7f9fc;
          padding: 20px;
          min-height: 100%;
        }

        .hod-dashboard .hod-eyebrow {
          color: var(--hod-primary);
          font-size: .75rem;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .hod-dashboard .hod-stat-card,
        .hod-dashboard .hod-action-card,
        .hod-dashboard .hod-panel {
          background: #fff;
          border: 1px solid #edf1f7;
          border-radius: 17px;
          box-shadow: 0 5px 18px rgba(26,55,100,.055);
        }

        .hod-dashboard .hod-stat-card {
          padding: 21px;
          height: 100%;
          transition: transform .2s, box-shadow .2s;
        }

        .hod-dashboard .hod-stat-card:hover,
        .hod-dashboard .hod-action-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 26px rgba(26,55,100,.10);
        }

        .hod-dashboard .hod-icon {
          width: 48px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .hod-dashboard .hod-blue {
          color: #2563eb;
          background: #eaf1ff;
        }

        .hod-dashboard .hod-green {
          color: #119455;
          background: #e3f8ec;
        }

        .hod-dashboard .hod-purple {
          color: #8438d8;
          background: #f2e8ff;
        }

        .hod-dashboard .hod-orange {
          color: #e8751a;
          background: #fff0e2;
        }

        .hod-dashboard .hod-pink {
          color: #d82e7d;
          background: #ffe8f1;
        }

        .hod-dashboard .hod-cyan {
          color: #0785a8;
          background: #e2f8ff;
        }

        .hod-dashboard .hod-stat-number {
          font-size: 2rem;
          font-weight: 850;
          letter-spacing: -.8px;
          line-height: 1.2;
        }

        .hod-dashboard .hod-muted {
          color: var(--hod-muted);
        }

        .hod-dashboard .hod-action-card {
          display: flex;
          align-items: center;
          gap: 15px;
          height: 100%;
          padding: 19px;
          color: inherit;
          text-decoration: none;
          transition: transform .2s, box-shadow .2s;
        }

        .hod-dashboard .hod-action-title {
          font-weight: 750;
          margin-bottom: 5px;
          font-size: .96rem;
        }

        .hod-dashboard .hod-action-description {
          font-size: .81rem;
          color: var(--hod-muted);
          line-height: 1.5;
          margin: 0;
        }

        .hod-dashboard .hod-action-arrow {
          margin-left: auto;
          color: #8b9bb3;
          flex-shrink: 0;
        }

        .hod-dashboard .hod-panel-heading {
          padding: 21px 22px;
          border-bottom: 1px solid #edf1f7;
        }

        .hod-dashboard .table > :not(caption) > * > * {
          padding: 14px 18px;
        }

        .hod-dashboard .table thead th {
          background: #f7f9fc;
          color: #63718a;
          font-size: .76rem;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .5px;
          white-space: nowrap;
        }

        @media (max-width: 575px) {
          .hod-dashboard { padding: 13px; }
          .hod-dashboard .hod-stat-card { padding: 15px; }
          .hod-dashboard .hod-stat-number { font-size: 1.6rem; }
          .hod-dashboard .hod-panel-heading { padding: 17px; }
        }
      `}</style>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="hod-eyebrow mb-2">
            Department Administration
          </div>
          <h2 className="fw-bold mb-1">HOD Dashboard</h2>
          <p className="hod-muted mb-0">
            Manage your department, coordinate academic activities,
            and keep everything on track.
          </p>

          {hod?.name && (
            <div className="small text-secondary mt-2">
              Welcome, {hod.name}
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn btn-outline-primary rounded-3 px-3"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2" />
          {loading ? "Loading..." : "Refresh Dashboard"}
        </button>
      </div>

      {error && (
        <div className="alert alert-warning border-0 rounded-4 mb-4">
          <strong>
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {error}
          </strong>

          {failures.length > 0 && (
            <ul className="small mt-2 mb-0">
              {failures.map((failure) => (
                <li key={failure.name}>
                  <strong>{failure.name.toUpperCase()}:</strong>{" "}
                  {failure.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="row g-3 mb-4">
        {stats.map((stat) => {
          const failed = failures.some(
            (item) => item.name === stat.key
          );

          return (
            <div
              className="col-12 col-sm-6 col-xl-3"
              key={stat.key}
            >
              <Link
                to={stat.path}
                className="text-decoration-none text-reset"
              >
                <div className="hod-stat-card">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div>
                      <div className="hod-muted small fw-semibold mb-2">
                        {stat.label}
                      </div>
                      <div className="hod-stat-number">
                        {loading
                          ? "—"
                          : failed
                            ? "N/A"
                            : stat.value}
                      </div>
                    </div>

                    <div className={`hod-icon hod-${stat.color}`}>
                      <i className={`bi ${stat.icon}`} />
                    </div>
                  </div>

                  <div className="hod-muted small mt-3">
                    {failed
                      ? "Unable to load this statistic"
                      : stat.note}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <section className="mb-4">
        <div className="mb-3">
          <h5 className="fw-bold mb-1">Quick Actions</h5>
          <p className="hod-muted small mb-0">
            Jump directly to a department management module.
          </p>
        </div>

        <div className="row g-3">
          {quickActions.map((action) => (
            <div
              className="col-12 col-md-6 col-xl-4"
              key={action.path}
            >
              <Link
                to={action.path}
                className="hod-action-card"
              >
                <div className={`hod-icon hod-${action.color}`}>
                  <i className={`bi ${action.icon}`} />
                </div>

                <div>
                  <div className="hod-action-title">
                    {action.title}
                  </div>
                  <p className="hod-action-description">
                    {action.description}
                  </p>
                </div>

                <i className="bi bi-chevron-right hod-action-arrow" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="hod-panel overflow-hidden mb-4">
        <div className="hod-panel-heading d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold mb-1">
              Upcoming Examinations
            </h5>
            <p className="hod-muted small mb-0">
              The next scheduled examinations for your department.
            </p>
          </div>

          <Link
            to="/hod/exams"
            className="btn btn-outline-primary btn-sm rounded-3 px-3"
          >
            View All <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              aria-label="Loading examinations"
            />
            <p className="hod-muted small mt-3 mb-0">
              Loading department data...
            </p>
          </div>
        ) : failures.some((item) => item.name === "exams") ? (
          <div className="text-center py-5 px-3">
            <h6 className="fw-bold">
              Examinations could not be loaded
            </h6>
            <p className="hod-muted small">
              Check the exams endpoint and permissions.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              Try Again
            </button>
          </div>
        ) : upcomingExams.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div className="hod-icon hod-blue mx-auto mb-3">
              <i className="bi bi-calendar-check" />
            </div>
            <h6 className="fw-bold">
              No upcoming examinations
            </h6>
            <p className="hod-muted small mb-3">
              Upcoming exams will appear here when scheduled.
            </p>
            <Link
              to="/hod/exams"
              className="btn btn-primary btn-sm rounded-3 px-3"
            >
              Manage Exams
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Examination</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingExams.map((exam, index) => (
                  <tr key={exam.id ?? exam.examId ?? index}>
                    <td className="fw-semibold">
                      {getExamName(exam)}
                    </td>
                    <td>{getSubjectName(exam)}</td>
                    <td className="text-nowrap">
                      <i className="bi bi-calendar3 text-primary me-2" />
                      {formatDate(getExamDate(exam))}
                    </td>
                    <td>{exam.startTime || exam.time || "—"}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                        Upcoming
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 bg-primary bg-opacity-10 h-100">
            <div className="d-flex gap-3 align-items-start">
              <div className="hod-icon hod-blue">
                <i className="bi bi-megaphone-fill" />
              </div>
              <div>
                <h6 className="fw-bold mb-1">
                  Keep Everyone Informed
                </h6>
                <p className="text-secondary small mb-2">
                  Publish department notices and important academic updates.
                </p>
                <Link
                  to="/hod/announcements"
                  className="fw-semibold small"
                >
                  Manage Announcements
                  <i className="bi bi-arrow-right ms-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 bg-success bg-opacity-10 h-100">
            <div className="d-flex gap-3 align-items-start">
              <div className="hod-icon hod-green">
                <i className="bi bi-calendar-week-fill" />
              </div>
              <div>
                <h6 className="fw-bold mb-1">
                  Coordinate Class Schedules
                </h6>
                <p className="text-secondary small mb-2">
                  Organize timetable changes and department class schedules.
                </p>
                <Link
                  to="/hod/timetable"
                  className="fw-semibold small"
                >
                  Manage Timetable
                  <i className="bi bi-arrow-right ms-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
