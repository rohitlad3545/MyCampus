/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    students: 0,
    faculty: 0,
    departments: 0,
    courses: 0,
    subjects: 0,
    feeStructures: 0,
  });

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCount(endpoint) {
    const response = await fetch(
      `http://localhost:8080/api/v1/admin/${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load ${endpoint}: HTTP ${response.status}`
      );
    }

    const result = await response.json();

    const data = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.data?.data)
      ? result.data.data
      : Array.isArray(result)
      ? result
      : [];

    return data.length;
  }

  async function loadDashboard() {
    setLoading(true);

    try {
      const [
        students,
        faculty,
        departments,
        courses,
        subjects,
        feeStructures,
      ] = await Promise.all([
        fetchCount("student/all"),
        fetchCount("faculty/all"),
        fetchCount("department/all"),
        fetchCount("course/all"),
        fetchCount("subject/all"),
        fetchCount("fee-structure/all").catch((error) => {
          console.warn(
            "Fee structure count unavailable:",
            error.message
          );
          return null;
        }),
      ]);

      setCounts({
        students,
        faculty,
        departments,
        courses,
        subjects,
        feeStructures,
      });
    } catch (error) {
      console.error("Dashboard loading error:", error);
      toast.error("Unable to load some dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }

  const statistics = [
    {
      title: "Students",
      count: counts.students,
      icon: "bi-people-fill",
      color: "#2563eb",
      background: "#eff6ff",
      link: "/admin/students",
    },
    {
      title: "Faculty",
      count: counts.faculty,
      icon: "bi-person-workspace",
      color: "#059669",
      background: "#ecfdf5",
      link: "/admin/faculty",
    },
    {
      title: "Departments",
      count: counts.departments,
      icon: "bi-building",
      color: "#7c3aed",
      background: "#f5f3ff",
      link: "/admin/departments",
    },
    {
      title: "Courses",
      count: counts.courses,
      icon: "bi-mortarboard-fill",
      color: "#d97706",
      background: "#fffbeb",
      link: "/admin/courses",
    },
    {
      title: "Subjects",
      count: counts.subjects,
      icon: "bi-journal-bookmark-fill",
      color: "#0891b2",
      background: "#ecfeff",
      link: "/admin/subjects",
    },
    {
      title: "Fee Structures",
      count: counts.feeStructures,
      icon: "bi-cash-stack",
      color: "#db2777",
      background: "#fdf2f8",
      link: "/admin/fee-structures",
    },
  ];

  const management = [
    {
      title: "Students",
      description: "Manage student records",
      icon: "bi-people",
      link: "/admin/students",
    },
    {
      title: "Faculty",
      description: "Manage faculty members",
      icon: "bi-person-workspace",
      link: "/admin/faculty",
    },
    {
      title: "Departments",
      description: "Manage departments",
      icon: "bi-building",
      link: "/admin/departments",
    },
    {
      title: "Courses",
      description: "Manage courses",
      icon: "bi-mortarboard",
      link: "/admin/courses",
    },
    {
      title: "Subjects & Faculty",
      description: "Assign faculty to subjects",
      icon: "bi-journal-bookmark",
      link: "/admin/subjects",
    },
    {
      title: "Semesters",
      description: "Manage semesters",
      icon: "bi-calendar3",
      link: "/admin/semesters",
    },
    {
      title: "Academic Years",
      description: "Manage academic years",
      icon: "bi-calendar-range",
      link: "/admin/academic-years",
    },
    {
      title: "Exams",
      description: "Manage examination records",
      icon: "bi-pencil-square",
      link: "/admin/exams",
    },
    {
      title: "Attendance",
      description: "View attendance records",
      icon: "bi-calendar-check",
      link: "/admin/attendance",
    },
    {
      title: "Fee Structures",
      description: "Configure course and semester fees",
      icon: "bi-cash-stack",
      link: "/admin/fee-structures",
    },
  ];

  return (
    <div className="admin-dashboard-container">
      <style>{`
        .admin-dashboard-container {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          min-height: calc(100vh - 52px);
          padding: 28px 28px 0;
          background: #f8fafc;
          box-sizing: border-box;
          overflow-x: clip;
        }

        .admin-dashboard-container *,
        .admin-dashboard-container *::before,
        .admin-dashboard-container *::after {
          box-sizing: border-box;
        }

        .admin-dashboard-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
        }

        .admin-dashboard-title {
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          overflow-wrap: anywhere;
        }

        .admin-stat-card {
          height: 100%;
          min-width: 0;
          border-radius: 14px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.09) !important;
        }

        .admin-stat-card .card-body {
          min-width: 0;
        }

        .admin-stat-label {
          overflow-wrap: anywhere;
          font-size: 0.9rem;
        }

        .admin-stat-count {
          font-size: clamp(1.5rem, 2vw, 2rem);
        }

        .admin-management-link {
          display: block;
          width: 100%;
          height: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          background: #fff;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .admin-management-link:hover {
          background: #f8fbff;
          border-color: #93b4ff;
          transform: translateY(-2px);
        }

        .admin-management-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .admin-management-text {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .admin-refresh {
          border-radius: 9px;
          padding: 10px 18px;
          white-space: nowrap;
        }

        .admin-feature-card {
          border-radius: 16px;
        }

        .admin-feature-button {
          white-space: normal;
        }

        .admin-dashboard-footer {
          text-align: center;
          color: #64748b;
          font-size: 0.8rem;
          padding: 24px 8px;
        }

        @media (min-width: 1400px) {
          .admin-dashboard-container {
            padding-left: 32px;
            padding-right: 32px;
          }
        }

        @media (max-width: 991.98px) {
          .admin-dashboard-container {
            padding: 22px 20px 0;
          }
        }

        @media (max-width: 767.98px) {
          .admin-dashboard-container {
            padding: 18px 14px 0;
          }

          .admin-dashboard-header {
            align-items: flex-start;
            margin-bottom: 22px;
          }

          .admin-refresh {
            padding: 9px 14px;
          }

          .admin-feature-card .card-body {
            padding: 24px !important;
          }

          .admin-feature-button {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 400px) {
          .admin-dashboard-container {
            padding-left: 10px;
            padding-right: 10px;
          }

          .admin-dashboard-header {
            gap: 12px;
          }

          .admin-stat-card .card-body {
            padding: 18px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .admin-stat-card,
          .admin-management-link {
            transition: none;
          }

          .admin-stat-card:hover,
          .admin-management-link:hover {
            transform: none;
          }
        }
      `}</style>

      {/* Dashboard Header */}
      <div className="admin-dashboard-header">
        <div>
          <div className="small text-primary fw-semibold mb-1">
            MYCAMPUS ADMINISTRATION
          </div>

          <h2 className="admin-dashboard-title fw-bold mb-1">
            Admin Dashboard
          </h2>

          <p className="text-secondary mb-0">
            Welcome back! Manage your college from one place.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary admin-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          <i
            className={`bi ${
              loading ? "bi-arrow-repeat" : "bi-arrow-clockwise"
            } me-2`}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        {statistics.map((item) => (
          <div
            className="col-12 col-sm-6 col-xl-4 col-xxl-2"
            key={item.title}
          >
            <Link
              to={item.link}
              className="text-decoration-none"
              aria-label={`View ${item.title}`}
            >
              <div className="card border-0 shadow-sm admin-stat-card">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div
                      className="rounded-3 p-3"
                      style={{
                        background: item.background,
                        color: item.color,
                      }}
                    >
                      <i className={`bi ${item.icon} fs-4`} />
                    </div>

                    <i className="bi bi-arrow-up-right text-secondary" />
                  </div>

                  <div className="text-secondary mb-1 admin-stat-label">
                    {item.title}
                  </div>

                  <h2 className="fw-bold mb-0 text-dark admin-stat-count">
                    {item.count === null ? "—" : item.count}
                  </h2>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Academic Management */}
      <div
        className="card border-0 shadow-sm mb-4 overflow-hidden admin-feature-card"
        style={{
          background: "linear-gradient(120deg, #172554, #1d4ed8)",
        }}
      >
        <div className="card-body p-4 p-lg-5 text-white">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-8">
              <span className="badge bg-light text-primary mb-3">
                ACADEMIC MANAGEMENT
              </span>

              <h3 className="fw-bold mb-2">
                Subject &amp; Faculty Allocation
              </h3>

              <p className="mb-0 text-white-50">
                Organize subjects by course and semester, and assign the
                appropriate faculty members.
              </p>
            </div>

            <div className="col-12 col-lg-4 text-lg-end">
              <Link
                to="/admin/subjects"
                className="btn btn-light btn-lg text-primary fw-semibold admin-feature-button"
              >
                Manage Subjects
                <i className="bi bi-arrow-right ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Management */}
      <div
        className="card border-0 shadow-sm mb-4 overflow-hidden admin-feature-card"
        style={{
          background: "linear-gradient(120deg, #831843, #db2777)",
        }}
      >
        <div className="card-body p-4 p-lg-5 text-white">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-8">
              <span className="badge bg-light text-danger mb-3">
                FINANCE MANAGEMENT
              </span>

              <h3 className="fw-bold mb-2">
                Fee Structures &amp; Student Fees
              </h3>

              <p className="text-white-50 mb-0">
                Configure course fees, semester charges, and academic-year fee
                structures from one place.
              </p>
            </div>

            <div className="col-12 col-lg-4 text-lg-end">
              <Link
                to="/admin/fee-structures"
                className="btn btn-light btn-lg text-danger fw-semibold admin-feature-button"
              >
                Manage Fees
                <i className="bi bi-arrow-right ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Management Center */}
      <div
        className="card border-0 shadow-sm"
        style={{ borderRadius: "16px" }}
      >
        <div className="card-body p-3 p-md-4">
          <div className="mb-4">
            <h4 className="fw-bold mb-1">Management Center</h4>

            <p className="text-secondary mb-0">
              Select a module to manage your college data.
            </p>
          </div>

          <div className="row g-3">
            {management.map((item) => (
              <div
                className="col-12 col-sm-6 col-lg-4"
                key={item.title}
              >
                <Link
                  to={item.link}
                  className="text-decoration-none text-dark"
                >
                  <div className="admin-management-link">
                    <div className="d-flex align-items-center gap-3">
                      <div className="admin-management-icon bg-primary bg-opacity-10 text-primary">
                        <i className={`bi ${item.icon} fs-4`} />
                      </div>

                      <div className="flex-grow-1 admin-management-text">
                        <h6 className="fw-bold mb-1">{item.title}</h6>

                        <small className="text-secondary">
                          {item.description}
                        </small>
                      </div>

                      <i className="bi bi-chevron-right text-secondary" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="admin-dashboard-footer">
        © {new Date().getFullYear()} MyCampus College Management Portal
      </footer>
    </div>
  );
}