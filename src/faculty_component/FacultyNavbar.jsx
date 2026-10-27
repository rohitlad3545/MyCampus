/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LoggedInUserContext } from "../project_context/LoggedInUserContext";

export default function FacultyNavbar() {
    const { userData, setUserData } = useContext(LoggedInUserContext);

    const navigateTo = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const closeNavbar = () => setExpanded(false);

    function logout() {
        ["userData", "jwtToken", "role", "id"].forEach((key) => {
            localStorage.removeItem(key);
        });

        setUserData(null);
        closeNavbar();
        navigateTo("/login");
    }

    const links = [
        {
            name: "Dashboard",
            path: "/faculty",
            icon: "bi-grid-1x2",
            end: true,
        },
        {
            name: "Assignments",
            path: "/faculty/assignments",
            icon: "bi-journal-text",
        },
        {
            name: "Attendance",
            path: "/faculty/attendance",
            icon: "bi-calendar-check",
        },
    ];

    return (
        <>
            <style>{`
                .faculty-navbar {
                    position: sticky;
                    top: 0;
                    z-index: 1030;
                    background: linear-gradient(110deg, #1747b5, #2563eb);
                }

                .faculty-brand {
                    color: #fff !important;
                    font-size: 1.3rem;
                    font-weight: 800;
                    letter-spacing: -.4px;
                    text-decoration: none;
                    white-space: nowrap;
                }

                .faculty-brand:hover {
                    opacity: .9;
                }

                .faculty-brand span {
                    color: #bfdbfe;
                }

                .faculty-navbar .nav-link {
                    color: rgba(255,255,255,.88);
                    padding: 10px 14px;
                    border-radius: 9px;
                    transition: background .2s ease, color .2s ease;
                }

                .faculty-navbar .nav-link:hover {
                    background: rgba(255,255,255,.12);
                    color: #fff;
                }

                .faculty-navbar .nav-link.active {
                    background: #fff;
                    color: #1747b5 !important;
                    font-weight: 600;
                }

                .faculty-home-link {
                    color: #fff;
                    text-decoration: none;
                    font-size: .9rem;
                }

                .faculty-home-link:hover {
                    color: #dbeafe;
                }

                @media (max-width: 991.98px) {
                    .faculty-navbar .navbar-collapse {
                        padding: 12px 0 16px;
                        max-height: calc(100vh - 75px);
                        overflow-y: auto;
                    }

                    .faculty-navbar .nav-link {
                        margin-bottom: 4px;
                    }
                }
            `}</style>

            <nav className="navbar navbar-expand-lg navbar-dark faculty-navbar shadow-sm">
                <div className="container-fluid px-3 px-lg-4">

                    {/* Clicking the brand opens the common landing page */}

                    <Link
                    to="/"
                    className="navbar-brand"
                    onClick={() => setOpen(false)}
                    >
                    <i className="bi bi-mortarboard-fill me-2 text-primary" />
                    MyCampus
                    </Link>
                 

                    <div className="d-flex align-items-center gap-3 ms-auto me-3 d-lg-none">
                        <Link
                            to="/"
                            className="faculty-home-link"
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
                        <ul className="navbar-nav me-auto ms-lg-4 my-2 my-lg-0">
                            {links.map((link) => (
                                <li className="nav-item" key={link.path}>
                                    <NavLink
                                        to={link.path}
                                        end={link.end}
                                        onClick={closeNavbar}
                                        className={({ isActive }) =>
                                            `nav-link ${
                                                isActive ? "active" : ""
                                            }`
                                        }
                                    >
                                        <i className={`bi ${link.icon} me-2`} />
                                        {link.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>

                        <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 mt-3 mt-lg-0">
                            <Link
                                to="/"
                                className="faculty-home-link d-none d-lg-inline"
                                onClick={closeNavbar}
                            >
                                <i className="bi bi-house-door me-1" />
                                Public Home
                            </Link>

                            {userData && (
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm px-3"
                                    onClick={logout}
                                >
                                    <i className="bi bi-box-arrow-right me-2" />
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}