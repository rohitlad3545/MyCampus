/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/v1";

export default function StudentProfile() {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const studentId = localStorage.getItem("id");
        const token = localStorage.getItem("jwtToken");

        if (!studentId || !token) {
            setError("Please log in again to view your profile.");
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadProfile() {
            try {
                const response = await fetch(
                    `${API}/student/profile/${studentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to load student profile."
                    );
                }

                setStudent(result.data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Unable to load profile.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => controller.abort();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="mt-3 text-secondary">
                    Loading your profile...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                <i className="bi bi-exclamation-circle me-2" />
                {error}
            </div>
        );
    }

    if (!student) {
        return (
            <div className="alert alert-warning">
                Student profile not found.
            </div>
        );
    }

    const details = [
        { label: "Full Name", value: student.name, icon: "bi-person" },
        { label: "Roll Number", value: student.rollNo, icon: "bi-card-text" },
        { label: "Email", value: student.email, icon: "bi-envelope" },
        { label: "Phone", value: student.phone, icon: "bi-telephone" },
        { label: "Address", value: student.address, icon: "bi-geo-alt" },
        {
            label: "Department",
            value: student.department?.name,
            icon: "bi-building"
        },
        {
            label: "Course",
            value: student.course?.name,
            icon: "bi-mortarboard"
        },
        {
            label: "Semester",
            value: student.semester?.semesterNumber
                ? `Semester ${student.semester.semesterNumber}`
                : null,
            icon: "bi-calendar3"
        },
        {
            label: "Academic Year",
            value: student.semester?.academicYear,
            icon: "bi-calendar-event"
        }
    ];

    return (
        <div className="container-fluid py-3">
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                <span className="text-primary fw-bold small">
                    STUDENT PORTAL
                </span>
                <h2 className="fw-bold mt-2 mb-1">My Profile</h2>
                <p className="text-secondary mb-0">
                    Your personal and academic information.
                </p>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div
                    className="p-4 text-white"
                    style={{
                        background: "linear-gradient(120deg, #145de0, #4285f4)"
                    }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="rounded-circle bg-white text-primary
                                       d-flex align-items-center justify-content-center"
                            style={{
                                width: 76,
                                height: 76,
                                fontSize: 32,
                                flexShrink: 0
                            }}
                        >
                            <i className="bi bi-person-fill" />
                        </div>

                        <div>
                            <h3 className="fw-bold mb-1">
                                {student.name || "Student"}
                            </h3>
                            <div>
                                Roll No: {student.rollNo || "Not assigned"}
                            </div>
                            <span className="badge bg-light text-primary mt-2">
                                STUDENT
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card-body p-4">
                    <h5 className="fw-bold mb-4">
                        <i className="bi bi-person-lines-fill text-primary me-2" />
                        Personal & Academic Details
                    </h5>

                    <div className="row g-4">
                        {details.map((item) => (
                            <div className="col-12 col-md-6 col-xl-4" key={item.label}>
                                <div className="border rounded-3 p-3 h-100">
                                    <div className="text-secondary small mb-2">
                                        <i className={`bi ${item.icon} me-2`} />
                                        {item.label}
                                    </div>
                                    <div className="fw-semibold text-break">
                                        {item.value !== null &&
                                        item.value !== undefined &&
                                        item.value !== ""
                                            ? item.value
                                            : "Not available"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="alert alert-info mt-4 mb-0">
                        <i className="bi bi-info-circle me-2" />
                        If any field says “Not available,” check whether that
                        value is assigned to this student in your database.
                    </div>
                </div>
            </div>
        </div>
    );
}