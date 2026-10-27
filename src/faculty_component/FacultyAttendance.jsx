/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function FacultyAttendance() {
    const [attendanceList, setAttendanceList] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        studentId: "",
        subjectId: "",
        date: "",
        status: ""
    });

    const token = localStorage.getItem("jwtToken");
    const facultyId = localStorage.getItem("id");

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

    useEffect(() => {
        getAttendance();
        getStudents();
        getSubjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // GET ATTENDANCE RECORDS
    async function getAttendance() {
        if (!facultyId || !token) return;

        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/faculty/attendance/all/${facultyId}`,
                {
                    method: "GET",
                    headers
                }
            );

            const result = await response.json();

            if (response.ok) {
                setAttendanceList(
                    Array.isArray(result.data) ? result.data : []
                );
            } else {
                toast.error(
                    result.message || "Unable to load attendance"
                );
            }
        } catch (error) {
            console.error("Attendance loading error:", error);
            toast.error("Unable to load attendance");
        }
    }

    // GET STUDENTS FROM FACULTY DEPARTMENT
    async function getStudents() {
        if (!facultyId || !token) {
            toast.error("Faculty login details not found. Please log in again.");
            return;
        }

        setLoadingStudents(true);

        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/faculty/student/all/${facultyId}`,
                {
                    method: "GET",
                    headers
                }
            );

            const result = await response.json();

            if (response.ok) {
                setStudents(
                    Array.isArray(result.data) ? result.data : []
                );

                if (!result.data || result.data.length === 0) {
                    toast.info("No students found in your department.");
                }
            } else {
                setStudents([]);
                toast.error(
                    result.message || "Unable to load students"
                );
            }
        } catch (error) {
            console.error("Student loading error:", error);
            setStudents([]);
            toast.error("Unable to load students");
        } finally {
            setLoadingStudents(false);
        }
    }

    // GET SUBJECTS ASSIGNED TO THIS FACULTY MEMBER
    async function getSubjects() {
        if (!facultyId || !token) {
            toast.error("Faculty login details not found. Please log in again.");
            return;
        }

        setLoadingSubjects(true);

        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/faculty/subjects/${facultyId}`,
                {
                    method: "GET",
                    headers
                }
            );

            const result = await response.json();

            if (response.ok) {
                setSubjects(
                    Array.isArray(result.data) ? result.data : []
                );
            } else {
                setSubjects([]);
                toast.error(
                    result.message || "Unable to load subjects"
                );
            }
        } catch (error) {
            console.error("Subject loading error:", error);
            setSubjects([]);
            toast.error("Unable to load subjects");
        } finally {
            setLoadingSubjects(false);
        }
    }

    // HANDLE FORM INPUTS
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    // SAVE ATTENDANCE
    async function saveAttendance(event) {
        event.preventDefault();

        if (!facultyId || !token) {
            toast.error("Please log in again.");
            return;
        }

        if (!formData.studentId) {
            toast.error("Please select a student.");
            return;
        }

        if (!formData.subjectId) {
            toast.error("Please select a subject.");
            return;
        }

        const attendanceData = {
            student: {
                id: Number(formData.studentId)
            },
            subject: {
                id: Number(formData.subjectId)
            },
            faculty: {
                id: Number(facultyId)
            },
            date: formData.date,
            status: formData.status
        };

        setSaving(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/faculty/attendance/add",
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify(attendanceData)
                }
            );

            const result = await response.json();

            if (response.ok) {
                toast.success(
                    result.message || "Attendance marked successfully"
                );

                setFormData({
                    studentId: "",
                    subjectId: "",
                    date: "",
                    status: ""
                });

                await getAttendance();
            } else {
                toast.error(
                    result.message || "Unable to mark attendance"
                );
            }
        } catch (error) {
            console.error("Save attendance error:", error);
            toast.error("Something went wrong while saving attendance");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="container mt-4 mb-5">
            <div className="mb-4">
                <h2>Attendance Management</h2>
                <p className="text-muted">
                    Mark and review attendance for your classes.
                </p>
            </div>

            {/* MARK ATTENDANCE FORM */}
            <div className="card shadow-sm p-4 mb-4">
                <h4 className="mb-3">Mark Attendance</h4>

                <form onSubmit={saveAttendance}>
                    {/* STUDENT DROPDOWN */}
                    <div className="mb-3">
                        <label className="form-label">Student</label>

                        <select
                            className="form-select"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                            required
                            disabled={
                                loadingStudents || students.length === 0
                            }
                        >
                            <option value="">
                                {loadingStudents
                                    ? "Loading students..."
                                    : students.length === 0
                                        ? "No students available"
                                        : "Select Student"}
                            </option>

                            {students.map((student) => (
                                <option
                                    key={student.id}
                                    value={student.id}
                                >
                                    {student.name} - {student.rollNo}
                                </option>
                            ))}
                        </select>

                        {!loadingStudents && students.length === 0 && (
                            <small className="text-danger">
                                No students found. Check your faculty
                                department and student endpoint.
                            </small>
                        )}
                    </div>

                    {/* SUBJECT DROPDOWN */}
                    <div className="mb-3">
                        <label className="form-label">Subject</label>

                        <select
                            className="form-select"
                            name="subjectId"
                            value={formData.subjectId}
                            onChange={handleChange}
                            required
                            disabled={
                                loadingSubjects || subjects.length === 0
                            }
                        >
                            <option value="">
                                {loadingSubjects
                                    ? "Loading subjects..."
                                    : subjects.length === 0
                                        ? "No subjects assigned"
                                        : "Select Subject"}
                            </option>

                            {subjects.map((subject) => (
                                <option
                                    key={subject.id}
                                    value={subject.id}
                                >
                                    {subject.name}
                                    {subject.code
                                        ? ` - ${subject.code}`
                                        : ""}
                                </option>
                            ))}
                        </select>

                        {!loadingSubjects && subjects.length === 0 && (
                            <small className="text-danger">
                                No subjects assigned to this faculty member.
                            </small>
                        )}
                    </div>

                    {/* DATE */}
                    <div className="mb-3">
                        <label className="form-label">Date</label>

                        <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* STATUS */}
                    <div className="mb-3">
                        <label className="form-label">Status</label>

                        <select
                            className="form-select"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Status</option>
                            <option value="PRESENT">PRESENT</option>
                            <option value="ABSENT">ABSENT</option>
                            <option value="LATE">LATE</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                            saving ||
                            loadingStudents ||
                            loadingSubjects ||
                            students.length === 0 ||
                            subjects.length === 0
                        }
                    >
                        {saving ? "Saving..." : "Mark Attendance"}
                    </button>
                </form>
            </div>

            {/* ATTENDANCE RECORDS TABLE */}
            <div className="card shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">Attendance Records</h5>
                </div>

                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Student</th>
                                    <th>Roll No</th>
                                    <th>Subject</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {attendanceList.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center text-muted py-4"
                                        >
                                            No attendance records found
                                        </td>
                                    </tr>
                                ) : (
                                    attendanceList.map((attendance) => (
                                        <tr key={attendance.id}>
                                            <td>{attendance.id}</td>
                                            <td>
                                                {attendance.student?.name || "-"}
                                            </td>
                                            <td>
                                                {attendance.student?.rollNo || "-"}
                                            </td>
                                            <td>
                                                {attendance.subject?.name || "-"}
                                            </td>
                                            <td>{attendance.date || "-"}</td>
                                            <td>{attendance.status || "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
