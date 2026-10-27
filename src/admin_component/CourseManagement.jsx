/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CourseManagement() {

    const [courses, setCourses] = useState([]);

    const [departments, setDepartments] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editMode, setEditMode] = useState(false);

    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({

        name: "",
        code: "",
        duration: "",
        departmentId: ""

    });


    // ==========================================
    // GET TOKEN
    // ==========================================

    const getToken = () => {

        return localStorage.getItem("jwtToken");

    };


    // ==========================================
    // GET ALL COURSES
    // ==========================================

    async function getCourses() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/admin/course/all",
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

                setCourses(
                    responseObject.data || []
                );

            } else {

                toast.error(
                    responseObject.message ||
                    "Unable to fetch courses"
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

            console.error(error);

            toast.error(
                "Server error"
            );

        }

    }


    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {

        getCourses();

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
    // ADD / UPDATE COURSE
    // ==========================================

    async function handleSubmit(event) {

        event.preventDefault();


        try {

            let url = "";

            let method = "";


            if (editMode) {

                url =
                    `http://localhost:8080/api/v1/admin/course/update/${editId}`;

                method = "PUT";

            } else {

                url =
                    "http://localhost:8080/api/v1/admin/course/add";

                method = "POST";

            }


            const courseData = {

                name: formData.name,

                code: formData.code,

                duration: Number(formData.duration),

                department: {
                    id: Number(formData.departmentId)
                }

            };


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
                        JSON.stringify(courseData)

                }

            );


            const responseObject =
                await response.json();


            if (response.ok) {

                toast.success(

                    responseObject.message ||

                    "Course saved successfully"

                );


                resetForm();

                getCourses();

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
    // EDIT COURSE
    // ==========================================

    function handleEdit(course) {

        setEditMode(true);

        setEditId(course.id);


        setFormData({

            name:
                course.name || "",

            code:
                course.code || "",

            duration:
                course.duration || "",

            departmentId:
                course.department?.id || ""

        });


        setShowForm(true);

    }


    // ==========================================
    // DELETE COURSE
    // ==========================================

    async function handleDelete(id) {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this course?"
            );


        if (!confirmDelete) {

            return;

        }


        try {

            const response = await fetch(

                `http://localhost:8080/api/v1/admin/course/delete/${id}`,

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

                    "Course deleted successfully"

                );


                getCourses();

            } else {

                toast.error(

                    responseObject.message ||

                    "Unable to delete course"

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
            code: "",
            duration: "",
            departmentId: ""

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
                    Course Management
                </h2>


                <button
                    className="btn btn-primary"

                    onClick={() => {

                        resetForm();

                        setShowForm(true);

                    }}
                >
                    + Add Course
                </button>

            </div>


            {/* ADD / EDIT FORM */}

            {showForm && (

                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h4 className="mb-3">

                            {
                                editMode
                                    ? "Update Course"
                                    : "Add Course"
                            }

                        </h4>


                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="row">


                                {/* COURSE NAME */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Course Name
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

                                        placeholder="Enter course name"

                                        required
                                    />

                                </div>


                                {/* COURSE CODE */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Course Code
                                    </label>

                                    <input
                                        type="text"

                                        className="form-control"

                                        name="code"

                                        value={
                                            formData.code
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        placeholder="Enter course code"
                                    />

                                </div>


                                {/* DURATION */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Duration
                                    </label>

                                    <input
                                        type="number"

                                        className="form-control"

                                        name="duration"

                                        value={
                                            formData.duration
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        placeholder="Enter duration"

                                        min="1"

                                        required
                                    />

                                </div>


                                {/* DEPARTMENT */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Department
                                    </label>

                                    <select
                                        className="form-select"

                                        name="departmentId"

                                        value={
                                            formData.departmentId
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        required
                                    >

                                        <option value="">
                                            Select Department
                                        </option>


                                        {
                                            departments.map(
                                                (department) => (

                                                    <option
                                                        key={
                                                            department.id
                                                        }

                                                        value={
                                                            department.id
                                                        }
                                                    >
                                                        {
                                                            department.name
                                                        }
                                                    </option>

                                                )
                                            )
                                        }

                                    </select>

                                </div>

                            </div>


                            {/* SAVE */}

                            <button
                                type="submit"

                                className="btn btn-success me-2"
                            >

                                {
                                    editMode
                                        ? "Update Course"
                                        : "Add Course"
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


            {/* COURSE TABLE */}

            <div className="card shadow-sm">

                <div className="card-body">

                    <h4 className="mb-3">
                        Courses
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
                                        Code
                                    </th>

                                    <th>
                                        Duration
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {
                                    courses.length === 0

                                        ?

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="text-center"
                                            >
                                                No courses found
                                            </td>

                                        </tr>

                                        :

                                        courses.map(
                                            (course) => (

                                                <tr
                                                    key={
                                                        course.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            course.id
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            course.name ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            course.code ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            course.duration
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            course.department?.name ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>

                                                        <button
                                                            className="btn btn-warning btn-sm me-2"

                                                            onClick={() =>
                                                                handleEdit(
                                                                    course
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            className="btn btn-danger btn-sm"

                                                            onClick={() =>
                                                                handleDelete(
                                                                    course.id
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