/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function DepartmentManagement() {

    const [departments, setDepartments] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editMode, setEditMode] = useState(false);

    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });


    // ==========================================
    // GET TOKEN
    // ==========================================

    const getToken = () => {

        return localStorage.getItem("jwtToken");

    };


    // ==========================================
    // GET ALL DEPARTMENTS
    // ==========================================

    async function getDepartments() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/admin/department/all",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${getToken()}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


            const responseObject =
                await response.json();


            if (response.ok) {

                setDepartments(
                    responseObject.data || []
                );

            } else {

                toast.error(
                    responseObject.message ||
                    "Unable to fetch departments"
                );

            }

        } catch (error) {

            console.error(
                "Get departments error:",
                error
            );

            toast.error(
                "Server error"
            );

        }

    }


    // ==========================================
    // LOAD DEPARTMENTS
    // ==========================================

    useEffect(() => {

        getDepartments();

        // eslint-disable-next-line react-hooks/exhaustive-deps

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // ==========================================
    // INPUT CHANGE
    // ==========================================

    function handleChange(event) {

        const {
            name,
            value
        } = event.target;


        setFormData({

            ...formData,

            [name]: value

        });

    }


    // ==========================================
    // ADD / UPDATE DEPARTMENT
    // ==========================================

    async function handleSubmit(event) {

        event.preventDefault();


        try {

            let url = "";

            let method = "";


            if (editMode) {

                url =
                    `http://localhost:8080/api/v1/admin/department/update/${editId}`;

                method = "PUT";

            } else {

                url =
                    "http://localhost:8080/api/v1/admin/department/add";

                method = "POST";

            }


            const response = await fetch(
                url,
                {
                    method: method,

                    headers: {

                        "Authorization":
                            `Bearer ${getToken()}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(formData)
                }
            );


            const responseObject =
                await response.json();


            if (response.ok) {

                toast.success(
                    responseObject.message ||
                    "Department saved successfully"
                );


                resetForm();

                getDepartments();

            } else {

                toast.error(
                    responseObject.message ||
                    "Operation failed"
                );

            }

        } catch (error) {

            console.error(
                "Department save error:",
                error
            );

            toast.error(
                "Server error"
            );

        }

    }


    // ==========================================
    // EDIT DEPARTMENT
    // ==========================================

    function handleEdit(department) {

        setEditMode(true);

        setEditId(department.id);


        setFormData({

            name:
                department.name || "",

            description:
                department.description || ""

        });


        setShowForm(true);

    }


    // ==========================================
    // DELETE DEPARTMENT
    // ==========================================

    async function handleDelete(id) {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this department?"
            );


        if (!confirmDelete) {

            return;

        }


        try {

            const response = await fetch(

                `http://localhost:8080/api/v1/admin/department/delete/${id}`,

                {
                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${getToken()}`
                    }
                }

            );


            const responseObject =
                await response.json();


            if (response.ok) {

                toast.success(
                    responseObject.message ||
                    "Department deleted successfully"
                );


                getDepartments();

            } else {

                toast.error(
                    responseObject.message ||
                    "Unable to delete department"
                );

            }

        } catch (error) {

            console.error(
                "Delete department error:",
                error
            );

            toast.error(
                "Server error"
            );

        }

    }


    // ==========================================
    // RESET FORM
    // ==========================================

    function resetForm() {

        setFormData({

            name: "",
            description: ""

        });


        setEditMode(false);

        setEditId(null);

        setShowForm(false);

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="container mt-4">


            {/* HEADER */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>
                    Department Management
                </h2>


                <button
                    className="btn btn-primary"

                    onClick={() => {

                        resetForm();

                        setShowForm(true);

                    }}
                >
                    + Add Department
                </button>

            </div>


            {/* ADD / EDIT FORM */}

            {showForm && (

                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h4 className="mb-3">

                            {
                                editMode
                                    ? "Update Department"
                                    : "Add Department"
                            }

                        </h4>


                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="row">


                                {/* NAME */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Department Name
                                    </label>

                                    <input
                                        type="text"

                                        className="form-control"

                                        name="name"

                                        value={
                                            formData.name
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        placeholder="Enter department name"

                                        required
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div className="col-md-12 mb-3">

                                    <label className="form-label">
                                        Description
                                    </label>

                                    <textarea
                                        className="form-control"

                                        rows="3"

                                        name="description"

                                        value={
                                            formData.description
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        placeholder="Enter department description"
                                    />

                                </div>

                            </div>


                            {/* SAVE */}

                            <button
                                type="submit"
                                className="btn btn-success me-2"
                            >

                                {
                                    editMode
                                        ? "Update Department"
                                        : "Add Department"
                                }

                            </button>


                            {/* CANCEL */}

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


            {/* DEPARTMENT TABLE */}

            <div className="card shadow-sm">

                <div className="card-body">

                    <h4 className="mb-3">
                        Departments
                    </h4>


                    <div className="table-responsive">

                        <table className="table table-bordered table-hover">

                            <thead className="table-primary">

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {
                                    departments.length === 0

                                        ?

                                        <tr>

                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                No departments found
                                            </td>

                                        </tr>

                                        :

                                        departments.map(
                                            (department) => (

                                                <tr
                                                    key={
                                                        department.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            department.id
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            department.name ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            department.description ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>

                                                        {/* EDIT */}

                                                        <button
                                                            className="btn btn-warning btn-sm me-2"

                                                            onClick={() =>
                                                                handleEdit(
                                                                    department
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        {/* DELETE */}

                                                        <button
                                                            className="btn btn-danger btn-sm"

                                                            onClick={() =>
                                                                handleDelete(
                                                                    department.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                }

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );

}