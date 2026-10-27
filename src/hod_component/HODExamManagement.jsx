/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function HODExamManagement() {

    const [exams, setExams] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        examType: "",
        date: "",
        semesterId: ""
    });

    const token = localStorage.getItem("jwtToken");

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    // ==========================================
    // GET ALL EXAMS
    // ==========================================

    async function getExams() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/hod/exam/all",
                {
                    method: "GET",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {

                setExams(
                    responseObject.data || []
                );

            } else {

                toast.error(
                    responseObject.message ||
                    "Unable to fetch exams"
                );
            }

        } catch (error) {

            console.error(error);

            toast.error("Server error");
        }
    }


    // ==========================================
    // GET SEMESTERS
    // ==========================================

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

                setSemesters(
                    responseObject.data || []
                );

            } else {

                toast.error(
                    responseObject.message ||
                    "Unable to fetch semesters"
                );
            }

        } catch (error) {

            console.error(error);

            toast.error("Server error");
        }
    }


    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {

        getExams();
        getSemesters();

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
    // ADD / UPDATE EXAM
    // ==========================================

    async function handleSubmit(event) {

        event.preventDefault();

        try {

            let url = "";
            let method = "";

            if (editMode) {

                url =
                    `http://localhost:8080/api/v1/hod/exam/update/${editId}`;

                method = "PUT";

            } else {

                url =
                    "http://localhost:8080/api/v1/hod/exam/add";

                method = "POST";
            }


            const examData = {

                name: formData.name,

                examType: formData.examType,

                date: formData.date,

                semester: {
                    id: Number(formData.semesterId)
                }
            };


            const response = await fetch(
                url,
                {
                    method: method,

                    headers: headers,

                    body: JSON.stringify(examData)
                }
            );


            const responseObject =
                await response.json();


            if (response.ok) {

                toast.success(
                    responseObject.message ||
                    "Exam saved successfully"
                );

                resetForm();

                getExams();

            } else {

                toast.error(
                    responseObject.message ||
                    "Operation failed"
                );
            }

        } catch (error) {

            console.error(error);

            toast.error("Server error");
        }
    }


    // ==========================================
    // EDIT EXAM
    // ==========================================

    function handleEdit(exam) {

        setEditMode(true);

        setEditId(exam.id);

        setFormData({

            name: exam.name || "",

            examType: exam.examType || "",

            date: exam.date || "",

            semesterId:
                exam.semester?.id || ""
        });

        setShowForm(true);
    }


    // ==========================================
    // DELETE EXAM
    // ==========================================

    async function handleDelete(id) {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this exam?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            const response = await fetch(

                `http://localhost:8080/api/v1/hod/exam/delete/${id}`,

                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const responseObject =
                await response.json();


            if (response.ok) {

                toast.success(
                    responseObject.message ||
                    "Exam deleted successfully"
                );

                getExams();

            } else {

                toast.error(
                    responseObject.message ||
                    "Unable to delete exam"
                );
            }

        } catch (error) {

            console.error(error);

            toast.error("Server error");
        }
    }


    // ==========================================
    // RESET FORM
    // ==========================================

    function resetForm() {

        setFormData({

            name: "",
            examType: "",
            date: "",
            semesterId: ""
        });

        setEditMode(false);

        setEditId(null);

        setShowForm(false);
    }


    return (
        <div className="container mt-4 mb-5">

            {/* HEADER */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>
                    Exam Management
                </h2>

                <button
                    className="btn btn-primary"
                    onClick={() => {

                        resetForm();

                        setShowForm(true);
                    }}
                >
                    + Add Exam
                </button>

            </div>


            {/* ADD / EDIT FORM */}

            {showForm && (

                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <h4 className="mb-3">

                            {editMode
                                ? "Update Exam"
                                : "Add Exam"}

                        </h4>


                        <form onSubmit={handleSubmit}>

                            <div className="row">

                                {/* EXAM NAME */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Exam Name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* EXAM TYPE */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Exam Type
                                    </label>

                                    <select
                                        className="form-select"
                                        name="examType"
                                        value={formData.examType}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select Exam Type
                                        </option>

                                        <option value="MIDTERM">
                                            Midterm
                                        </option>

                                        <option value="FINAL">
                                            Final
                                        </option>

                                        <option value="UNIT_TEST">
                                            Unit Test
                                        </option>

                                        <option value="PRACTICAL">
                                            Practical
                                        </option>

                                    </select>

                                </div>


                                {/* DATE */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Exam Date
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


                                {/* SEMESTER */}

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Semester
                                    </label>

                                    <select
                                        className="form-select"
                                        name="semesterId"
                                        value={formData.semesterId}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select Semester
                                        </option>

                                        {semesters.map(
                                            (semester) => (

                                                <option
                                                    key={semester.id}
                                                    value={semester.id}
                                                >
                                                    Semester{" "}
                                                    {semester.semesterNumber}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="btn btn-success me-2"
                            >
                                {editMode
                                    ? "Update Exam"
                                    : "Add Exam"}
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


            {/* EXAM TABLE */}

            <div className="card shadow-sm">

                <div className="card-body">

                    <h4 className="mb-3">
                        Exams
                    </h4>

                    <div className="table-responsive">

                        <table className="table table-bordered table-hover">

                            <thead className="table-primary">

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Exam
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Semester
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {exams.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center"
                                        >
                                            No exams found
                                        </td>

                                    </tr>

                                ) : (

                                    exams.map(
                                        (exam) => (

                                            <tr
                                                key={exam.id}
                                            >

                                                <td>
                                                    {exam.id}
                                                </td>

                                                <td>
                                                    {exam.name}
                                                </td>

                                                <td>
                                                    {exam.examType}
                                                </td>

                                                <td>
                                                    {exam.date}
                                                </td>

                                                <td>
                                                    {exam.semester
                                                        ?.semesterNumber ||
                                                        "-"}
                                                </td>

                                                <td>

                                                    <button
                                                        className="btn btn-warning btn-sm me-2"
                                                        onClick={() =>
                                                            handleEdit(exam)
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                exam.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
}