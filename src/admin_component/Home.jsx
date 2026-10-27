/* eslint-disable no-unused-vars */

import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-vh-100 bg-light">
            {/* Public Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                <div className="container">
                    <Link to="/" className="navbar-brand fw-bold fs-4">
                        <i className="bi bi-mortarboard-fill me-2" />
                        MyCampus
                    </Link>

                    <div className="ms-auto d-flex gap-2">
                        <Link to="/login" className="btn btn-outline-light">
                            Login
                        </Link>
                        <Link to="/register" className="btn btn-light text-primary">
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container py-5">
                <div className="row align-items-center min-vh-50 g-4 py-5">
                    <div className="col-lg-7">
                        <span className="badge bg-primary-subtle text-primary mb-3 p-2">
                            Welcome to MyCampus
                        </span>

                        <h1 className="display-4 fw-bold text-dark">
                            Your Future Starts Here
                        </h1>

                        <p className="lead text-secondary my-4">
                            A smarter way to manage academics, attendance,
                            assignments, examinations, and campus life—all
                            in one place.
                        </p>

                        <Link to="/login" className="btn btn-primary btn-lg me-3">
                            Get Started
                            <i className="bi bi-arrow-right ms-2" />
                        </Link>

                        <Link to="/register" className="btn btn-outline-primary btn-lg">
                            Join MyCampus
                        </Link>
                    </div>

                    <div className="col-lg-5">
                        <div className="bg-white rounded-4 shadow p-4 p-lg-5 text-center">
                            <i className="bi bi-mortarboard-fill text-primary"
                               style={{ fontSize: "7rem" }} />

                            <h3 className="fw-bold mt-3">Learn. Grow. Succeed.</h3>
                            <p className="text-secondary mb-0">
                                Your campus, connected.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-white py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold">Everything You Need in One Place</h2>
                        <p className="text-secondary">
                            Simple tools for a better campus experience.
                        </p>
                    </div>

                    <div className="row g-4">
                        {[
                            {
                                icon: "bi-book",
                                title: "Academic Management",
                                text: "Access courses, subjects, and academic information.",
                            },
                            {
                                icon: "bi-calendar-check",
                                title: "Attendance Tracking",
                                text: "Manage and review attendance records efficiently.",
                            },
                            {
                                icon: "bi-journal-text",
                                title: "Assignments & Exams",
                                text: "Keep track of assignments and examinations.",
                            },
                            {
                                icon: "bi-people",
                                title: "Connected Campus",
                                text: "Bring students, faculty, and administrators together.",
                            },
                        ].map((feature) => (
                            <div className="col-md-6 col-lg-3" key={feature.title}>
                                <div className="card h-100 border-0 shadow-sm rounded-4 p-3">
                                    <div className="card-body">
                                        <i className={`bi ${feature.icon} fs-1 text-primary`} />
                                        <h5 className="fw-bold mt-3">{feature.title}</h5>
                                        <p className="text-secondary mb-0">
                                            {feature.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-dark text-white text-center py-4">
                <p className="mb-0">
                    © {new Date().getFullYear()} MyCampus College Management Portal
                </p>
            </footer>
        </div>
    );
}
