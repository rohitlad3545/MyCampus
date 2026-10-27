import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function StudentNavbar() {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const closeNavbar = () => setExpanded(false);

    const logout = () => {
        ["userData", "jwtToken", "role", "id"].forEach((key) => {
            localStorage.removeItem(key);
        });

        closeNavbar();
        navigate("/login");
    };

    const links = [
        { name: "Dashboard", path: "/student", end: true, icon: "bi-grid-1x2" },
        { name: "Profile", path: "/student/profile", icon: "bi-person-circle" },
        { name: "Attendance", path: "/student/attendance", icon: "bi-calendar-check" },
        { name: "Assignments", path: "/student/assignments", icon: "bi-journal-text" },
        { name: "Results", path: "/student/results", icon: "bi-award" },
        { name: "Exams", path: "/student/exams", icon: "bi-pencil-square" },
        { name: "Timetable", path: "/student/timetable", icon: "bi-calendar3" },
        { name: "Announcements", path: "/student/announcements", icon: "bi-megaphone" },
        { name: "Fee Payment", path: "/student/fees", icon: "bi-cash-stack" }
    ];

    return (
        <>
            <style>{`
                .student-navbar {
                    background: linear-gradient(110deg, #1747b5, #2563eb);
                    position: sticky;
                    top: 0;
                    z-index: 1030;
                }

                .student-brand {
                    color: #fff !important;
                    text-decoration: none;
                    font-size: 1.2rem;
                    letter-spacing: -.3px;
                    white-space: nowrap;
                }

                .student-brand:hover {
                    opacity: .9;
                }

                .student-brand .brand-highlight {
                    color: #bfdbfe;
                }

                .student-navbar .nav-link {
                    color: rgba(255,255,255,.88);
                    transition: background .2s ease, color .2s ease;
                    font-size: .9rem;
                }

                .student-navbar .nav-link:hover {
                    color: #fff;
                    background: rgba(255,255,255,.12);
                }

                .student-navbar .nav-link.active {
                    color: #1747b5 !important;
                    background: #fff;
                    font-weight: 600;
                }

                .student-home-link {
                    color: #fff;
                    text-decoration: none;
                    font-size: .85rem;
                    white-space: nowrap;
                }

                .student-home-link:hover {
                    color: #dbeafe;
                }

                @media (max-width: 1199.98px) {
                    .student-navbar .navbar-collapse {
                        padding: 12px 0 16px;
                        max-height: calc(100vh - 75px);
                        overflow-y: auto;
                    }

                    .student-navbar .navbar-nav {
                        align-items: stretch !important;
                    }

                    .student-navbar .nav-link {
                        padding: 10px 12px !important;
                    }

                    .student-navbar .logout-item {
                        margin-top: 8px;
                    }
                }
            `}</style>

            <nav className="navbar navbar-expand-xl navbar-dark student-navbar shadow-sm">
                <div className="container-fluid px-3 px-lg-4">

                    {/* MyCampus opens the common public landing page */}
                    <div className="d-flex align-items-center gap-3">
                                        <Link to="/" className="admin-brand">
                    <i className="bi bi-mortarboard-fill me-2 text-primary" />
                    My<span>Campus</span>
                    </Link>

                        <span className="badge rounded-pill bg-light text-primary">
                            Student
                        </span>
                    </div>

                    <div className="d-flex align-items-center gap-3 ms-auto me-3 d-xl-none">
                        <Link
                            to="/"
                            className="student-home-link"
                            onClick={closeNavbar}
                        >
                            <i className="bi bi-house-door me-1" />
                            Home
                        </Link>
                    </div>

                    <button
                        className="navbar-toggler"
                        type="button"
                        aria-label="Toggle navigation"
                        aria-expanded={expanded}
                        onClick={() => setExpanded((previous) => !previous)}
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`}>
                        <ul className="navbar-nav ms-auto align-items-xl-center gap-xl-1">
                            {links.map((link) => (
                                <li className="nav-item" key={link.name}>
                                    <NavLink
                                        to={link.path}
                                        end={link.end}
                                        onClick={closeNavbar}
                                        className={({ isActive }) =>
                                            `nav-link rounded px-3 ${
                                                isActive ? "active" : ""
                                            }`
                                        }
                                    >
                                        <i className={`bi ${link.icon} me-2`} />
                                        {link.name}
                                    </NavLink>
                                </li>
                            ))}

                            <li className="nav-item ms-xl-2 mt-2 mt-xl-0 logout-item">
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm px-3"
                                    onClick={logout}
                                >
                                    <i className="bi bi-box-arrow-right me-1" />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}