/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function SemesterManagement() {

    const [semesters, setSemesters] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        semesterNumber: "",
        academicYear: ""
    });

    const token = localStorage.getItem("jwtToken");

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    useEffect(() => {
        getSemesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function getSemesters() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/admin/semester/all",
                {
                    method: "GET",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setSemesters(responseObject.data || []);
            } else {
                toast.error(responseObject.message);
            }

        } catch (error) {
            toast.error("Unable to load semesters");
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
            semesterNumber: "",
            academicYear: ""
        });

        setShowForm(true);
    }

    function openEditForm(semester) {

        setEditMode(true);
        setEditId(semester.id);

        setFormData({
            semesterNumber: semester.semesterNumber,
            academicYear: semester.academicYear
        });

        setShowForm(true);
    }

    async function saveSemester(event) {

        event.preventDefault();

        const semesterData = {
            semesterNumber: Number(formData.semesterNumber),
            academicYear: formData.academicYear
        };

        try {

            let url =
                "http://localhost:8080/api/v1/admin/semester/add";

            let method = "POST";

            if (editMode) {

                url =
                    `http://localhost:8080/api/v1/admin/semester/update/${editId}`;

                method = "PUT";
            }

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(semesterData)
            });

            const responseObject = await response.json();

            if (response.ok) {

                toast.success(responseObject.message);

                setShowForm(false);

                getSemesters();

            } else {

                toast.error(responseObject.message);
            }

        } catch (error) {

            toast.error("Something went wrong");
        }
    }

    async function deleteSemester(id) {

        if (!window.confirm(
            "Are you sure you want to delete this semester?"
        )) {
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:8080/api/v1/admin/semester/delete/${id}`,
                {
                    method: "DELETE",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {

                toast.success(responseObject.message);

                getSemesters();

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

                <h2>Semester Management</h2>

                <button
                    className="btn btn-primary"
                    onClick={openAddForm}
                >
                    Add Semester
                </button>

            </div>

            {showForm && (

                <div className="card p-4 mb-4">

                    <h4>
                        {editMode
                            ? "Update Semester"
                            : "Add Semester"}
                    </h4>

                    <form onSubmit={saveSemester}>

                        <div className="mb-3">

                            <label className="form-label">
                                Semester Number
                            </label>

                            <input
                                type="number"
                                className="form-control"
                                name="semesterNumber"
                                value={formData.semesterNumber}
                                onChange={handleChange}
                                min="1"
                                max="12"
                                required
                            />

                        </div>

                        <div className="mb-3">

                            <label className="form-label">
                                Academic Year
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                name="academicYear"
                                placeholder="2026-27"
                                value={formData.academicYear}
                                onChange={handleChange}
                                required
                            />

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
                            <th>Semester Number</th>
                            <th>Academic Year</th>
                            <th>Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {semesters.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="4"
                                    className="text-center"
                                >
                                    No semesters found
                                </td>
                            </tr>

                        ) : (

                            semesters.map((semester) => (

                                <tr key={semester.id}>

                                    <td>{semester.id}</td>

                                    <td>
                                        Semester {semester.semesterNumber}
                                    </td>

                                    <td>
                                        {semester.academicYear}
                                    </td>

                                    <td>

                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() =>
                                                openEditForm(semester)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                deleteSemester(
                                                    semester.id
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