/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AcademicYearManagement() {

    const [academicYears, setAcademicYears] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        year: "",
        active: false
    });

    const token = localStorage.getItem("jwtToken");

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    useEffect(() => {
        getAcademicYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function getAcademicYears() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/admin/academic-year/all",
                {
                    method: "GET",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setAcademicYears(responseObject.data || []);
            } else {
                toast.error(responseObject.message);
            }

        } catch (error) {
            toast.error("Unable to load academic years");
        }
    }

    function handleChange(event) {

        const { name, value, type, checked } = event.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    }

    function openAddForm() {

        setEditMode(false);
        setEditId(null);

        setFormData({
            year: "",
            active: false
        });

        setShowForm(true);
    }

    function openEditForm(academicYear) {

        setEditMode(true);
        setEditId(academicYear.id);

        setFormData({
            year: academicYear.year || "",
            active: academicYear.active || false
        });

        setShowForm(true);
    }

    async function saveAcademicYear(event) {

        event.preventDefault();

        const academicYearData = {
            year: formData.year,
            active: formData.active
        };

        try {

            let url =
                "http://localhost:8080/api/v1/admin/academic-year/add";

            let method = "POST";

            if (editMode) {

                url =
                    `http://localhost:8080/api/v1/admin/academic-year/update/${editId}`;

                method = "PUT";
            }

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(academicYearData)
            });

            const responseObject = await response.json();

            if (response.ok) {

                toast.success(responseObject.message);

                setShowForm(false);

                getAcademicYears();

            } else {

                toast.error(responseObject.message);
            }

        } catch (error) {

            toast.error("Something went wrong");
        }
    }

    async function deleteAcademicYear(id) {

        if (!window.confirm(
            "Are you sure you want to delete this academic year?"
        )) {
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:8080/api/v1/admin/academic-year/delete/${id}`,
                {
                    method: "DELETE",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {

                toast.success(responseObject.message);

                getAcademicYears();

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

                <h2>Academic Year Management</h2>

                <button
                    className="btn btn-primary"
                    onClick={openAddForm}
                >
                    Add Academic Year
                </button>

            </div>

            {showForm && (

                <div className="card p-4 mb-4">

                    <h4>
                        {editMode
                            ? "Update Academic Year"
                            : "Add Academic Year"}
                    </h4>

                    <form onSubmit={saveAcademicYear}>

                        <div className="mb-3">

                            <label className="form-label">
                                Academic Year
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                name="year"
                                placeholder="2026-27"
                                value={formData.year}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="form-check mb-3">

                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="active"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                            />

                            <label
                                className="form-check-label"
                                htmlFor="active"
                            >
                                Active
                            </label>

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
                            <th>Academic Year</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {academicYears.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="4"
                                    className="text-center"
                                >
                                    No academic years found
                                </td>
                            </tr>

                        ) : (

                            academicYears.map((academicYear) => (

                                <tr key={academicYear.id}>

                                    <td>{academicYear.id}</td>

                                    <td>{academicYear.year}</td>

                                    <td>
                                        {academicYear.active
                                            ? "Active"
                                            : "Inactive"}
                                    </td>

                                    <td>

                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() =>
                                                openEditForm(
                                                    academicYear
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                deleteAcademicYear(
                                                    academicYear.id
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