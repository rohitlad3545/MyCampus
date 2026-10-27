
/* eslint-disable react-hooks/set-state-in-effect */

// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function FacultyDashboard() {

    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("jwtToken");

    useEffect(() => {
        getUpcomingExams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function getUpcomingExams() {
        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:8080/api/v1/faculty/exam/upcoming",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to load exams"
                );
            }

            setExams(
                Array.isArray(result.data) ? result.data : []
            );

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Unable to load exams");
        } finally {
            setLoading(false);
        }
    }

    const today = new Date().toISOString().split("T")[0];

    const todaysExams = exams.filter(
        exam => exam.date === today
    );

    const upcomingExams = exams
        .filter(exam => exam.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));

    const stats = [
        {
            title: "Today's Exams",
            value: todaysExams.length,
            icon: "bi-calendar-event",
            color: "#2563eb",
            background: "#eff6ff"
        },
        {
            title: "Upcoming Exams",
            value: upcomingExams.length,
            icon: "bi-journal-check",
            color: "#7c3aed",
            background: "#f5f3ff"
        },
        {
            title: "Assignments",
            value: "—",
            icon: "bi-file-earmark-text",
            color: "#059669",
            background: "#ecfdf5"
        },
        {
            title: "Attendance",
            value: "—",
            icon: "bi-calendar2-check",
            color: "#d97706",
            background: "#fffbeb"
        }
    ];

    const actions = [
        {
            title: "Assignments",
            description: "Create and manage assignments",
            icon: "bi-file-earmark-text",
            link: "/faculty/assignments",
            color: "#2563eb"
        },
        {
            title: "Attendance",
            description: "Record student attendance",
            icon: "bi-calendar2-check",
            link: "/faculty/attendance",
            color: "#059669"
        },
        {
            title: "My Subjects",
            description: "View your assigned subjects",
            icon: "bi-journal-bookmark",
            link: "/faculty/subjects",
            color: "#7c3aed"
        }
    ];

    function formatDate(date) {
        if (!date) return "-";

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    return (
        <div
            className="container-fluid px-3 px-lg-5 py-4"
            style={{
                background: "#f8fafc",
                minHeight: "calc(100vh - 60px)"
            }}
        >
            {/* HEADER */}

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        Faculty Dashboard
                    </h2>

                    <p className="text-secondary mb-0">
                        Welcome to MyCampus Faculty Portal
                    </p>
                </div>

                <button
                    className="btn btn-white border shadow-sm"
                    onClick={getUpcomingExams}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                </button>
            </div>

            {/* WELCOME BANNER */}

            <div
                className="card border-0 shadow-sm mb-4 overflow-hidden"
                style={{
                    borderRadius: "16px",
                    background: "linear-gradient(120deg, #172554, #2563eb)"
                }}
            >
                <div className="card-body p-4 p-lg-5 text-white">
                    <div className="row align-items-center g-3">
                        <div className="col-md-8">
                            <span className="badge bg-light text-primary mb-3">
                                FACULTY PORTAL
                            </span>

                            <h3 className="fw-bold">
                                Your classroom, organized.
                            </h3>

                            <p className="text-white-50 mb-0">
                                Manage assignments, record attendance,
                                view your subjects, and stay updated
                                with upcoming examinations.
                            </p>
                        </div>

                        <div className="col-md-4 text-md-end">
                            <i
                                className="bi bi-mortarboard"
                                style={{
                                    fontSize: "90px",
                                    opacity: 0.75
                                }}
                            ></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATISTICS */}

            <div className="row g-3 mb-4">
                {stats.map((stat) => (
                    <div
                        className="col-12 col-sm-6 col-xl-3"
                        key={stat.title}
                    >
                        <div
                            className="card border-0 shadow-sm h-100"
                            style={{ borderRadius: "14px" }}
                        >
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="text-secondary">
                                        {stat.title}
                                    </span>

                                    <div
                                        className="rounded-3 p-3"
                                        style={{
                                            color: stat.color,
                                            background: stat.background
                                        }}
                                    >
                                        <i className={`bi ${stat.icon} fs-4`}></i>
                                    </div>
                                </div>

                                <h2 className="fw-bold mb-0">
                                    {stat.value}
                                </h2>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* EXAMS */}

            <div
                className="card border-0 shadow-sm mb-4"
                style={{ borderRadius: "16px" }}
            >
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h4 className="fw-bold mb-1">
                                Upcoming Examinations
                            </h4>

                            <p className="text-secondary mb-0">
                                Examination schedules published by your HOD
                            </p>
                        </div>

                        <span className="badge bg-primary rounded-pill">
                            {upcomingExams.length} upcoming
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary"></div>
                            <p className="text-secondary mt-2 mb-0">
                                Loading examinations...
                            </p>
                        </div>
                    ) : upcomingExams.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-calendar-x fs-1 text-secondary"></i>
                            <p className="mt-2 mb-0">
                                No upcoming examinations.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Examination</th>
                                        <th>Type</th>
                                        <th>Semester</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {upcomingExams.map((exam) => (
                                        <tr key={exam.id}>
                                            <td className="fw-semibold">
                                                {exam.name || "Examination"}
                                            </td>

                                            <td>
                                                {exam.examType || "-"}
                                            </td>

                                            <td>
                                                {exam.semester?.semesterNumber
                                                    ? `Semester ${exam.semester.semesterNumber}`
                                                    : "-"}
                                            </td>

                                            <td>
                                                {formatDate(exam.date)}
                                            </td>

                                            <td>
                                                <span className="badge bg-info-subtle text-info-emphasis">
                                                    Scheduled
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="alert alert-light border mt-3 mb-0">
                        <i className="bi bi-info-circle me-2 text-primary"></i>
                        Examination dates are view-only for faculty.
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="mb-4">
                <h4 className="fw-bold mb-1">
                    Quick Actions
                </h4>

                <p className="text-secondary mb-3">
                    Jump directly to your daily tasks.
                </p>

                <div className="row g-3">
                    {actions.map((action) => (
                        <div
                            className="col-12 col-md-4"
                            key={action.title}
                        >
                            <Link
                                to={action.link}
                                className="text-decoration-none text-dark"
                            >
                                <div
                                    className="card border-0 shadow-sm h-100"
                                    style={{ borderRadius: "14px" }}
                                >
                                    <div className="card-body p-4">
                                        <div
                                            className="rounded-3 p-3 d-inline-block mb-3"
                                            style={{
                                                color: action.color,
                                                background: `${action.color}15`
                                            }}
                                        >
                                            <i className={`bi ${action.icon} fs-3`}></i>
                                        </div>

                                        <h5 className="fw-bold">
                                            {action.title}
                                        </h5>

                                        <p className="text-secondary mb-3">
                                            {action.description}
                                        </p>

                                        <span
                                            className="fw-semibold"
                                            style={{ color: action.color }}
                                        >
                                            Open module
                                            <i className="bi bi-arrow-right ms-2"></i>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* INFORMATION */}

            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100"
                         style={{ borderRadius: "14px" }}>
                        <div className="card-body p-4">
                            <i className="bi bi-bell fs-3 text-primary"></i>

                            <h5 className="fw-bold mt-3">
                                Announcements
                            </h5>

                            <p className="text-secondary mb-0">
                                No announcements are connected yet.
                                This section can display notices from
                                your college once the announcement API
                                is implemented.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100"
                         style={{ borderRadius: "14px" }}>
                        <div className="card-body p-4">
                            <i className="bi bi-clipboard-check fs-3 text-success"></i>

                            <h5 className="fw-bold mt-3">
                                Teaching Workspace
                            </h5>

                            <p className="text-secondary mb-0">
                                Your assignment, attendance, and subject
                                modules are available from Quick Actions.
                                Results and notification summaries can be
                                connected when their APIs are ready.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
