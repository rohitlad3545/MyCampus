/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const API = "http://localhost:8080/api/v1/admin";

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const emptyForm = {
        name: "",
        rollNo: "",
        phone: "",
        email: "",
        address: "",
        departmentId: "",
        courseId: ""
    };

    const [formData, setFormData] = useState(emptyForm);

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        "Content-Type": "application/json"
    });


    const getUsername = (student) =>
        student?.user?.username ??
        student?.user?.userName ??
        student?.username ??
        student?.userName ??
        "-";

    async function getStudents() {
        try {
            const response = await fetch(`${API}/student/all`, {
                method: "GET",
                headers: getHeaders()
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message || "Unable to fetch students");
                return;
            }

            setStudents(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Server error while fetching students");
        }
    }

    async function getDepartments() {
        try {
            const response = await fetch(`${API}/department/all`, {
                headers: getHeaders()
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message || "Unable to fetch departments");
                return;
            }

            setDepartments(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Error fetching departments:", error);
            toast.error("Server error while fetching departments");
        }
    }

    async function getCourses() {
        try {
            const response = await fetch(`${API}/course/all`, {
                headers: getHeaders()
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message || "Unable to fetch courses");
                return;
            }

            setCourses(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Server error while fetching courses");
        }
    }

    useEffect(() => {
        getStudents();
        getDepartments();
        getCourses();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => {
            if (name === "departmentId") {
                return {
                    ...previous,
                    departmentId: value,
                    courseId: ""
                };
            }

            return {
                ...previous,
                [name]: value
            };
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const url = editMode
                ? `${API}/student/update/${editId}`
                : `${API}/student/add`;

            const method = editMode ? "PUT" : "POST";

            const studentData = {
                name: formData.name,
                rollNo: formData.rollNo,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                department: {
                    id: Number(formData.departmentId)
                },
                course: {
                    id: Number(formData.courseId)
                }
            };

            const response = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(studentData)
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message || "Unable to save student");
                return;
            }

            toast.success(result.message || "Student saved successfully");

            resetForm();
            await getStudents();
        } catch (error) {
            console.error("Error saving student:", error);
            toast.error("Server error while saving student");
        }
    }

    function handleEdit(student) {
        setEditMode(true);
        setEditId(student.id);

        setFormData({
            name: student.name || "",
            rollNo: student.rollNo || "",
            phone: student.phone || "",
            email: student.email || "",
            address: student.address || "",
            departmentId: student.department?.id?.toString() || "",
            courseId: student.course?.id?.toString() || ""
        });

        setShowForm(true);
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this student?")) {
            return;
        }

        try {
            const response = await fetch(`${API}/student/delete/${id}`, {
                method: "DELETE",
                headers: getHeaders()
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message || "Unable to delete student");
                return;
            }

            toast.success(result.message || "Student deleted successfully");
            await getStudents();
        } catch (error) {
            console.error("Error deleting student:", error);
            toast.error("Server error while deleting student");
        }
    }

    function resetForm() {
        setFormData({ ...emptyForm });
        setEditMode(false);
        setEditId(null);
        setShowForm(false);
    }

    const filteredCourses = courses.filter(
        (course) =>
            Number(course.department?.id) ===
            Number(formData.departmentId)
    );

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Student Management</h2>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    + Add Student
                </button>
            </div>

            {showForm && (
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h4 className="mb-3">
                            {editMode ? "Update Student" : "Add Student"}
                        </h4>

                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Roll Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="rollNo"
                                        value={formData.rollNo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Department</label>
                                    <select
                                        className="form-select"
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((department) => (
                                            <option
                                                key={department.id}
                                                value={department.id}
                                            >
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Course</label>
                                    <select
                                        className="form-select"
                                        name="courseId"
                                        value={formData.courseId}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.departmentId}
                                    >
                                        <option value="">
                                            {formData.departmentId
                                                ? "Select Course"
                                                : "Select Department First"}
                                        </option>

                                        {filteredCourses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.name}
                                                {course.code ? ` (${course.code})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-12 mb-3">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-success me-2">
                                {editMode ? "Update Student" : "Add Student"}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="card shadow-sm">
                <div className="card-body">
                    <h4 className="mb-3">Students</h4>

                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-primary">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Roll No</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Department</th>
                                    <th>Course</th>
                                    <th>Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="text-center">
                                            No students found
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student.id} >
                                            <td>{student.id}</td>
                                            <td>{student.name || "-"}</td>
                                            <td>{getUsername(student)}</td>
                                            <td>{student.rollNo || "-"}</td>
                                            <td>{student.email || "-"}</td>
                                            <td>{student.phone || "-"}</td>
                                            <td>{student.department?.name || "-"}</td>
                                            <td>{student.course?.name || "-"}</td>
                                            <td>{student.address || "-"}</td>
                                            <td className="text-nowrap">
                                                <button
                                                    type="button"
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() => handleEdit(student)}
                                                >
                                                    Update
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(student.id)}
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
            </div>
        </div>
    );
}
