import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";

const links = [
  { label: "Dashboard", path: "/admin", icon: "bi-grid-1x2" },
  { label: "Students", path: "/admin/students", icon: "bi-people" },
  { label: "Faculty", path: "/admin/faculty", icon: "bi-person-badge" },
  { label: "Departments", path: "/admin/departments", icon: "bi-building" },
  { label: "Courses", path: "/admin/courses", icon: "bi-mortarboard" },
  { label: "Subjects", path: "/admin/subjects", icon: "bi-journal-bookmark" },
  { label: "Semesters", path: "/admin/semesters", icon: "bi-calendar3" },
  {
    label: "Academic Years",
    path: "/admin/academic-years",
    icon: "bi-calendar-range",
  },
  { label: "Exams", path: "/admin/exams", icon: "bi-pencil-square" },
  {
    label: "Attendance",
    path: "/admin/attendance",
    icon: "bi-calendar-check",
  },
  {
    label: "Fee Structures",
    path: "/admin/fee-structures",
    icon: "bi-cash-stack",
  },
];

export default function AdminNavbar() {
  const navigate = useNavigate();

  const logout = () => {
    ["userData", "jwtToken", "role", "id"].forEach((key) => {
      localStorage.removeItem(key);
    });

    navigate("/login");
  };

  return (
    <div className="admin-app">
      <style>{`
        .admin-app {
          width: 100%;
          min-height: 100vh;
          background: #f5f7fb;
          color: #1e293b;
        }

        /* Single top navbar */
        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          gap: 20px;
          width: 100%;
          min-height: 60px;
          padding: 8px 18px;
          background: #fff;
          border-bottom: 1px solid #e8edf5;
        }

        /* Brand */
        .admin-brand {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
          color: #172554;
          text-decoration: none;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -.5px;
          white-space: nowrap;
        }

        .admin-brand span {
          color: #0d6efd;
        }

        .admin-brand:hover {
          color: #172554;
        }

        /* Navigation links share the same row */
        .admin-nav {
          display: flex;
          align-items: center;
          flex: 1 1 auto;
          min-width: 0;
          gap: 3px;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .admin-nav::-webkit-scrollbar {
          height: 4px;
        }

        .admin-nav::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .admin-nav-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          gap: 6px;
          padding: 10px 9px;
          color: #536178;
          border-radius: 9px;
          text-decoration: none;
          font-size: .81rem;
          font-weight: 500;
          white-space: nowrap;
          transition: background .18s ease, color .18s ease;
        }

        .admin-nav-link:hover {
          color: #0d6efd;
          background: #f1f6ff;
        }

        .admin-nav-link.active {
          color: #0d6efd;
          background: #eaf2ff;
          font-weight: 700;
        }

        .admin-nav-link i {
          font-size: .95rem;
        }

        /* Admin dropdown stays at the right */
        .admin-user-dropdown {
          flex-shrink: 0;
          margin-left: auto;
        }

        .admin-user-dropdown .dropdown-menu {
          z-index: 1060;
        }

        /* Full-width page content */
        .admin-main {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          min-height: calc(100vh - 60px);
          margin: 0;
          padding: 0;
          background: #f5f7fb;
          overflow-x: clip;
          box-sizing: border-box;
        }

        .admin-main > * {
          min-width: 0;
          max-width: 100%;
        }

        /* Medium screens */
        @media (max-width: 1200px) {
          .admin-topbar {
            gap: 10px;
            padding: 8px 12px;
          }

          .admin-brand {
            font-size: 1.1rem;
          }

          .admin-nav-link {
            padding: 9px 7px;
            font-size: .76rem;
            gap: 5px;
          }
        }

        /* Small screens: keep one row and scroll navigation */
        @media (max-width: 767.98px) {
          .admin-topbar {
            gap: 8px;
            padding: 8px 10px;
          }

          .admin-brand {
            font-size: 1rem;
          }

          .admin-brand i {
            margin-right: 4px !important;
          }

          .admin-nav {
            gap: 2px;
          }

          .admin-nav-link {
            padding: 9px 7px;
            font-size: .75rem;
          }

          .admin-nav-link i {
            font-size: .9rem;
          }

          .admin-user-dropdown .btn {
            padding: 7px 9px;
            font-size: .8rem;
          }
        }
      `}</style>

      {/* One-row navbar */}
      <header className="admin-topbar">
        {/* MyCampus logo */}
            <Link to="/" className="admin-brand">
        <i className="bi bi-mortarboard-fill me-2 text-primary" />
        My<span>Campus</span>
        </Link>

        {/* Admin navigation options */}
        <nav className="admin-nav" aria-label="Admin navigation">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/admin"}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <i className={`bi ${link.icon}`} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Admin dropdown */}
        <div className="dropdown admin-user-dropdown">
          <button
            className="btn btn-light rounded-pill dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            type="button"
          >
            <i className="bi bi-person-circle me-2" />
            Admin
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow border-0">
            <li>
              <Link className="dropdown-item" to="/">
                <i className="bi bi-house me-2" />
                Common Home Page
              </Link>
            </li>

            <li>
              <Link className="dropdown-item" to="/admin">
                <i className="bi bi-grid me-2" />
                Admin Dashboard
              </Link>
            </li>

            <li>
              <hr className="dropdown-divider" />
            </li>

            <li>
              <button
                className="dropdown-item text-danger"
                type="button"
                onClick={logout}
              >
                <i className="bi bi-box-arrow-right me-2" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </header>

      {/* Page content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}