/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function FacultyManagement() {

    const [faculty, setFaculty] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editMode, setEditMode] = useState(false);

    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({

        name: "",
        employeeId: "",
        phone: "",
        email: "",
        designation: ""

    });


    // ==========================================
    // GET TOKEN
    // ==========================================

    const getToken = () => {

        return localStorage.getItem("jwtToken");

    };


    // ==========================================
    // GET ALL FACULTY
    // ==========================================

    async function getFaculty() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/admin/faculty/all",
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

                setFaculty(
                    responseObject.data || []
                );

            } else {

                toast.error(
                    responseObject.message ||
                    "Unable to fetch faculty"
                );

            }

        } catch (error) {

            console.error(error);

            toast.error(
                "Server error"
            );

        }

    }


    // ==========================================
    // LOAD FACULTY
    // ==========================================

    useEffect(() => {

        getFaculty();

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
    // ADD / UPDATE FACULTY
    // ==========================================

    async function handleSubmit(event) {

        event.preventDefault();


        try {

            let url = "";

            let method = "";


            if (editMode) {

                url =
                    `http://localhost:8080/api/v1/admin/faculty/update/${editId}`;

                method = "PUT";

            } else {

                url =
                    "http://localhost:8080/api/v1/admin/faculty/add";

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

                    "Faculty saved successfully"

                );


                resetForm();

                getFaculty();

            } else {

                toast.error(

                    responseObject.message ||

                    "Operation failed"

                );

            }

        } catch (error) {

            console.error(error);

            toast.error(
                "Server error"
            );

        }

    }


    // ==========================================
    // EDIT
    // ==========================================

    function handleEdit(facultyData) {

        setEditMode(true);

        setEditId(facultyData.id);


        setFormData({

            name:
                facultyData.name || "",

            employeeId:
                facultyData.employeeId || "",

            phone:
                facultyData.phone || "",

            email:
                facultyData.email || "",

            designation:
                facultyData.designation || ""

        });


        setShowForm(true);

    }


    // ==========================================
    // DELETE
    // ==========================================

    async function handleDelete(id) {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this faculty?"
            );


        if (!confirmDelete) {

            return;

        }


        try {

            const response = await fetch(

                `http://localhost:8080/api/v1/admin/faculty/delete/${id}`,

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

                    "Faculty deleted successfully"

                );


                getFaculty();

            } else {

                toast.error(

                    responseObject.message ||

                    "Unable to delete faculty"

                );

            }

        } catch (error) {

            console.error(error);

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
            employeeId: "",
            phone: "",
            email: "",
            designation: ""

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
                    Faculty Management
                </h2>


                <button
                    className="btn btn-primary"

                    onClick={() => {

                        resetForm();

                        setShowForm(true);

                    }}
                >
                    + Add Faculty
                </button>

            </div>


            {/* ADD / EDIT FORM */}

            {showForm && (

                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h4 className="mb-3">

                            {
                                editMode
                                    ? "Update Faculty"
                                    : "Add Faculty"
                            }

                        </h4>


                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="row">


                                {/* NAME */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Name
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

                                        required
                                    />

                                </div>


                                {/* EMPLOYEE ID */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Employee ID
                                    </label>

                                    <input
                                        type="text"

                                        className="form-control"

                                        name="employeeId"

                                        value={
                                            formData.employeeId
                                        }

                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* PHONE */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Phone
                                    </label>

                                    <input
                                        type="text"

                                        className="form-control"

                                        name="phone"

                                        value={
                                            formData.phone
                                        }

                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* EMAIL */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"

                                        className="form-control"

                                        name="email"

                                        value={
                                            formData.email
                                        }

                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                {/* DESIGNATION */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Designation
                                    </label>

                                    <input
                                        type="text"

                                        className="form-control"

                                        name="designation"

                                        value={
                                            formData.designation
                                        }

                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="btn btn-success me-2"
                            >

                                {
                                    editMode
                                        ? "Update Faculty"
                                        : "Add Faculty"
                                }

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


            {/* FACULTY TABLE */}

            <div className="card shadow-sm">

                <div className="card-body">

                    <h4 className="mb-3">
                        Faculty
                    </h4>


                    <div className="table-responsive">

                        <table className="table table-bordered table-hover">

                            <thead className="table-primary">

                                <tr>

                                    <th>ID</th>

                                    <th>Name</th>

                                    <th>Employee ID</th>

                                    <th>Email</th>

                                    <th>Phone</th>

                                    <th>Designation</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>


                            <tbody>

                                {
                                    faculty.length === 0

                                        ?

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="text-center"
                                            >
                                                No faculty found
                                            </td>

                                        </tr>

                                        :

                                        faculty.map(
                                            (facultyData) => (

                                                <tr
                                                    key={
                                                        facultyData.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            facultyData.id
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            facultyData.name ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            facultyData.employeeId ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            facultyData.email ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            facultyData.phone ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            facultyData.designation ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>

                                                        <button
                                                            className="btn btn-warning btn-sm me-2"

                                                            onClick={() =>
                                                                handleEdit(
                                                                    facultyData
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            className="btn btn-danger btn-sm"

                                                            onClick={() =>
                                                                handleDelete(
                                                                    facultyData.id
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