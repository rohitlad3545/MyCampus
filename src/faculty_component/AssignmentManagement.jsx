
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AssignmentManagement() {
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        subjectId: ""
    });

    const token = localStorage.getItem("jwtToken");
    const facultyId = localStorage.getItem("id");

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

    useEffect(() => {
        getAssignments();
        getSubjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // GET ASSIGNMENTS
    async function getAssignments() {
        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/faculty/assignment/all",
                {
                    method: "GET",
                    headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setAssignments(responseObject.data || []);
            } else {
                toast.error(
                    responseObject.message || "Unable to load assignments"
                );
            }
        } catch (error) {
            console.error("Assignment loading error:", error);
            toast.error("Unable to load assignments");
        }
    }

    // GET SUBJECTS ASSIGNED TO LOGGED-IN FACULTY
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

            const responseObject = await response.json();

            if (response.ok) {
                setSubjects(
                    Array.isArray(responseObject.data)
                        ? responseObject.data
                        : []
                );
            } else {
                setSubjects([]);
                toast.error(
                    responseObject.message || "Unable to load subjects"
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

    // OPEN ADD FORM
    function openAddForm() {
        setEditMode(false);
        setEditId(null);

        setFormData({
            title: "",
            description: "",
            dueDate: "",
            subjectId: ""
        });

        setShowForm(true);
    }

    // OPEN EDIT FORM
    function openEditForm(assignment) {
        setEditMode(true);
        setEditId(assignment.id);

        setFormData({
            title: assignment.title || "",
            description: assignment.description || "",
            dueDate: assignment.dueDate || "",
            subjectId: assignment.subject?.id
                ? String(assignment.subject.id)
                : ""
        });

        setShowForm(true);
    }

    // ADD OR UPDATE ASSIGNMENT
    async function saveAssignment(event) {
        event.preventDefault();

        if (!facultyId) {
            toast.error("Faculty ID not found. Please log in again.");
            return;
        }

        if (!formData.subjectId) {
            toast.error("Please select a subject.");
            return;
        }

        const assignmentData = {
            title: formData.title.trim(),
            description: formData.description,
            dueDate: formData.dueDate || null,
            subject: {
                id: Number(formData.subjectId)
            },
            faculty: {
                id: Number(facultyId)
            }
        };

        setSaving(true);

        try {
            let url =
                "http://localhost:8080/api/v1/faculty/assignment/add";

            let method = "POST";

            if (editMode) {
                url =
                    `http://localhost:8080/api/v1/faculty/assignment/update/${editId}`;
                method = "PUT";
            }

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(assignmentData)
            });

            const responseObject = await response.json();

            if (response.ok) {
                toast.success(
                    responseObject.message || "Assignment saved successfully"
                );

                setShowForm(false);

                setFormData({
                    title: "",
                    description: "",
                    dueDate: "",
                    subjectId: ""
                });

                await getAssignments();
            } else {
                toast.error(
                    responseObject.message || "Unable to save assignment"
                );
            }
        } catch (error) {
            console.error("Save assignment error:", error);
            toast.error("Something went wrong while saving the assignment");
        } finally {
            setSaving(false);
        }
    }

    // DELETE ASSIGNMENT
    async function deleteAssignment(id) {
        if (
            !window.confirm(
                "Are you sure you want to delete this assignment?"
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/faculty/assignment/delete/${id}`,
                {
                    method: "DELETE",
                    headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                toast.success(
                    responseObject.message || "Assignment deleted successfully"
                );

                await getAssignments();
            } else {
                toast.error(
                    responseObject.message || "Unable to delete assignment"
                );
            }
        } catch (error) {
            console.error("Delete assignment error:", error);
            toast.error("Something went wrong while deleting the assignment");
        }
    }

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 className="mb-1">Assignment Management</h2>
                    <p className="text-muted mb-0">
                        Create and manage assignments for your subjects.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={openAddForm}
                >
                    + Add Assignment
                </button>
            </div>

            {showForm && (
                <div className="card shadow-sm p-4 mb-4">
                    <h4 className="mb-4">
                        {editMode ? "Update Assignment" : "Add Assignment"}
                    </h4>

                    <form onSubmit={saveAssignment}>
                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                className="form-control"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter assignment title"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter assignment instructions"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Due Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Subject</label>

                            <select
                                className="form-select"
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleChange}
                                required
                                disabled={loadingSubjects || subjects.length === 0}
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
                                        {subject.code ? ` - ${subject.code}` : ""}
                                    </option>
                                ))}
                            </select>

                            {!loadingSubjects && subjects.length === 0 && (
                                <div className="form-text text-danger">
                                    No subjects were returned for your faculty
                                    account. Verify the faculty assignment and
                                    subject API.
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-success me-2"
                            disabled={saving || loadingSubjects || subjects.length === 0}
                        >
                            {saving
                                ? "Saving..."
                                : editMode
                                    ? "Update Assignment"
                                    : "Save Assignment"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowForm(false)}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            <div className="card shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">Your Assignments</h5>
                </div>

                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Due Date</th>
                                    <th>Subject</th>
                                    <th style={{ minWidth: "150px" }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {assignments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center text-muted py-4"
                                        >
                                            No assignments found
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.map((assignment) => (
                                        <tr key={assignment.id}>
                                            <td>{assignment.id}</td>
                                            <td>{assignment.title}</td>
                                            <td>
                                                {assignment.description || "-"}
                                            </td>
                                            <td>{assignment.dueDate || "-"}</td>
                                            <td>
                                                {assignment.subject?.name || "-"}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() =>
                                                        openEditForm(assignment)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        deleteAssignment(
                                                            assignment.id
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
            </div>
        </div>
    );
}
