/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AttendanceManagement() {

    const [attendanceList, setAttendanceList] = useState([]);

    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [facultyList, setFacultyList] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        studentId: "",
        subjectId: "",
        facultyId: "",
        date: "",
        status: ""
    });

    const token = localStorage.getItem("jwtToken");

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    useEffect(() => {
        getAttendance();
        getStudents();
        getSubjects();
        getFaculty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function getAttendance() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/admin/attendance/all",
                {
                    method: "GET",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setAttendanceList(responseObject.data || []);
            } else {
                toast.error(responseObject.message);
            }

        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    async function getStudents() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/admin/student/all",
                {
                    method: "GET",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setStudents(responseObject.data || []);
            }

        } catch (error) {
            toast.error("Unable to load students");
        }
    }

    async function getSubjects() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/admin/subject/all",
                {
                    method: "GET",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setSubjects(responseObject.data || []);
            }

        } catch (error) {
            toast.error("Unable to load subjects");
        }
    }

    async function getFaculty() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/admin/faculty/all",
                {
                    method: "GET",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setFacultyList(responseObject.data || []);
            }

        } catch (error) {
            toast.error("Unable to load faculty");
        }
    }

    function handleChange(event) {

        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    function openAddForm() {

        setEditMode(false);
        setEditId(null);

        setFormData({
            studentId: "",
            subjectId: "",
            facultyId: "",
            date: "",
            status: ""
        });

        setShowForm(true);
    }

    function openEditForm(attendance) {

        setEditMode(true);
        setEditId(attendance.id);

        setFormData({
            studentId: attendance.student?.id || "",
            subjectId: attendance.subject?.id || "",
            facultyId: attendance.faculty?.id || "",
            date: attendance.date || "",
            status: attendance.status || ""
        });

        setShowForm(true);
    }

    async function saveAttendance(event) {

        event.preventDefault();

        const attendanceData = {
            student: {
                id: Number(formData.studentId)
            },
            subject: {
                id: Number(formData.subjectId)
            },
            date: formData.date,
            status: formData.status
        };

        if (formData.facultyId) {
            attendanceData.faculty = {
                id: Number(formData.facultyId)
            };
        }

        try {

            let url = "http://localhost:8080/api/v1/admin/attendance/add";
            let method = "POST";

            if (editMode) {
                url =
                    `http://localhost:8080/api/v1/admin/attendance/update/${editId}`;
                method = "PUT";
            }

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(attendanceData)
            });

            const responseObject = await response.json();

            if (response.ok) {

                toast.success(responseObject.message);

                setShowForm(false);

                getAttendance();

            } else {

                toast.error(responseObject.message);
            }

        } catch (error) {

            toast.error("Something went wrong");
        }
    }

    async function deleteAttendance(id) {

        if (!window.confirm("Are you sure you want to delete this attendance?")) {
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:8080/api/v1/admin/attendance/delete/${id}`,
                {
                    method: "DELETE",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {

                toast.success(responseObject.message);

                getAttendance();

            } else {

                toast.error(responseObject.message);
            }

        } catch (error) {

            toast.error("Something went wrong");
        }
    }

    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2>Attendance Management</h2>

                <button
                    className="btn btn-primary"
                    onClick={openAddForm}
                >
                    Add Attendance
                </button>

            </div>

            {showForm && (

                <div className="card p-4 mb-4">

                    <h4>
                        {editMode
                            ? "Update Attendance"
                            : "Add Attendance"}
                    </h4>

                    <form onSubmit={saveAttendance}>

                        <div className="mb-3">

                            <label className="form-label">
                                Student
                            </label>

                            <select
                                className="form-select"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select Student
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

                        </div>

                        <div className="mb-3">

                            <label className="form-label">
                                Subject
                            </label>

                            <select
                                className="form-select"
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select Subject
                                </option>

                                {subjects.map((subject) => (

                                    <option
                                        key={subject.id}
                                        value={subject.id}
                                    >
                                        {subject.name} - {subject.code}
                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="mb-3">

                            <label className="form-label">
                                Faculty
                            </label>

                            <select
                                className="form-select"
                                name="facultyId"
                                value={formData.facultyId}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select Faculty
                                </option>

                                {facultyList.map((faculty) => (

                                    <option
                                        key={faculty.id}
                                        value={faculty.id}
                                    >
                                        {faculty.name}
                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="mb-3">

                            <label className="form-label">
                                Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="mb-3">

                            <label className="form-label">
                                Status
                            </label>

                            <select
                                className="form-select"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select Status
                                </option>

                                <option value="PRESENT">
                                    PRESENT
                                </option>

                                <option value="ABSENT">
                                    ABSENT
                                </option>

                                <option value="LATE">
                                    LATE
                                </option>

                            </select>

                        </div>

                        <button
                            type="submit"
                            className="btn btn-success me-2"
                        >
                            {editMode ? "Update" : "Save"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>

                    </form>

                </div>
            )}

            <div className="table-responsive">

                <table className="table table-bordered table-striped">

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Student</th>
                            <th>Roll No</th>
                            <th>Subject</th>
                            <th>Faculty</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {attendanceList.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="8"
                                    className="text-center"
                                >
                                    No attendance records found
                                </td>
                            </tr>

                        ) : (

                            attendanceList.map((attendance) => (

                                <tr key={attendance.id}>

                                    <td>{attendance.id}</td>

                                    <td>
                                        {attendance.student?.name}
                                    </td>

                                    <td>
                                        {attendance.student?.rollNo}
                                    </td>

                                    <td>
                                        {attendance.subject?.name}
                                    </td>

                                    <td>
                                        {attendance.faculty?.name || "-"}
                                    </td>

                                    <td>
                                        {attendance.date}
                                    </td>

                                    <td>
                                        {attendance.status}
                                    </td>

                                    <td>

                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() =>
                                                openEditForm(attendance)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                deleteAttendance(
                                                    attendance.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}