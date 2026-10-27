
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function SubjectManagement() {

    const [subjects, setSubjects] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [facultyList, setFacultyList] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const emptyForm = {
        name: "",
        code: "",
        credits: "",
        courseId: "",
        semesterId: "",
        facultyId: ""
    };

    const [formData, setFormData] = useState(emptyForm);

    const token = localStorage.getItem("jwtToken");

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

    useEffect(() => {
        getSubjects();
        getCourses();
        getSemesters();
        getFaculty();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // ==========================================
    // LOAD SUBJECTS
    // ==========================================

    async function getSubjects() {
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/admin/subject/all",
                {
                    method: "GET",
                    headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setSubjects(responseObject.data || []);
            } else {
                toast.error(
                    responseObject.message || "Unable to load subjects"
                );
            }
        } catch (error) {
            console.error(error);
            toast.error("Unable to load subjects");
        } finally {
            setLoading(false);
        }
    }


    // ==========================================
    // LOAD COURSES
    // ==========================================

    async function getCourses() {
        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/admin/course/all",
                {
                    method: "GET",
                    headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setCourses(responseObject.data || []);
            } else {
                toast.error(
                    responseObject.message || "Unable to load courses"
                );
            }
        } catch (error) {
            console.error(error);
            toast.error("Unable to load courses");
        }
    }


    // ==========================================
    // LOAD SEMESTERS
    // ==========================================

    async function getSemesters() {
        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/admin/semester/all",
                {
                    method: "GET",
                    headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setSemesters(responseObject.data || []);
            } else {
                toast.error(
                    responseObject.message || "Unable to load semesters"
                );
            }
        } catch (error) {
            console.error(error);
            toast.error("Unable to load semesters");
        }
    }


    // ==========================================
    // LOAD FACULTY
    // ==========================================

    async function getFaculty() {
        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/admin/faculty/all",
                {
                    method: "GET",
                    headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setFacultyList(responseObject.data || []);
            } else {
                toast.error(
                    responseObject.message || "Unable to load faculty"
                );
            }
        } catch (error) {
            console.error(error);
            toast.error("Unable to load faculty");
        }
    }


    // ==========================================
    // FORM CHANGE
    // ==========================================

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));
    }


    // ==========================================
    // OPEN ADD FORM
    // ==========================================

    function openAddForm() {
        setEditMode(false);
        setEditId(null);
        setFormData({ ...emptyForm });
        setShowForm(true);
    }


    // ==========================================
    // OPEN EDIT FORM
    // ==========================================

    function openEditForm(subject) {
        setEditMode(true);
        setEditId(subject.id);

        setFormData({
            name: subject.name || "",
            code: subject.code || "",
            credits: subject.credits ?? "",
            courseId: subject.course?.id
                ? String(subject.course.id)
                : "",
            semesterId: subject.semester?.id
                ? String(subject.semester.id)
                : "",
            facultyId: subject.faculty?.id
                ? String(subject.faculty.id)
                : ""
        });

        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }


    // ==========================================
    // SAVE SUBJECT
    // ==========================================

    async function saveSubject(event) {
        event.preventDefault();

        const subjectData = {
            name: formData.name.trim(),
            code: formData.code.trim() || null,
            credits: formData.credits !== ""
                ? Number(formData.credits)
                : null,
            course: formData.courseId
                ? { id: Number(formData.courseId) }
                : null,
            semester: formData.semesterId
                ? { id: Number(formData.semesterId) }
                : null,
            faculty: formData.facultyId
                ? { id: Number(formData.facultyId) }
                : null
        };

        setSaving(true);

        try {
            let url =
                "http://localhost:8080/api/v1/admin/subject/add";

            let method = "POST";

            if (editMode) {
                url =
                    `http://localhost:8080/api/v1/admin/subject/update/${editId}`;

                method = "PUT";
            }

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(subjectData)
            });

            const responseObject = await response.json();

            if (response.ok) {
                toast.success(
                    responseObject.message || "Subject saved successfully"
                );

                setShowForm(false);
                setFormData({ ...emptyForm });

                await getSubjects();
            } else {
                toast.error(
                    responseObject.message || "Unable to save subject"
                );
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong while saving the subject");
        } finally {
            setSaving(false);
        }
    }


    // ==========================================
    // DELETE SUBJECT
    // ==========================================

    async function deleteSubject(id) {
        if (!window.confirm(
            "Are you sure you want to delete this subject?"
        )) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/admin/subject/delete/${id}`,
                {
                    method: "DELETE",
                    headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                toast.success(
                    responseObject.message || "Subject deleted successfully"
                );

                await getSubjects();
            } else {
                toast.error(
                    responseObject.message || "Unable to delete subject"
                );
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong while deleting the subject");
        }
    }


    // ==========================================
    // SEARCH
    // ==========================================

    const filteredSubjects = subjects.filter(subject => {
        const query = search.toLowerCase();

        return (
            (subject.name || "").toLowerCase().includes(query) ||
            (subject.code || "").toLowerCase().includes(query) ||
            (subject.course?.name || "").toLowerCase().includes(query) ||
            (subject.faculty?.name || "").toLowerCase().includes(query)
        );
    });


    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="container-fluid px-3 px-md-4 py-4">

            {/* PAGE HEADER */}

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        <i className="bi bi-journal-bookmark-fill text-primary me-2"></i>
                        Subject Management
                    </h2>

                    <p className="text-secondary mb-0">
                        Manage subjects, courses, semesters and faculty allocation.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={openAddForm}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Add Subject
                </button>
            </div>


            {/* STATISTICS */}

            <div className="row g-3 mb-4">

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-3">
                                <i className="bi bi-journal-text fs-3"></i>
                            </div>

                            <div>
                                <div className="text-secondary small">
                                    Total Subjects
                                </div>
                                <h3 className="fw-bold mb-0">
                                    {subjects.length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="rounded-3 bg-success bg-opacity-10 text-success p-3">
                                <i className="bi bi-person-check fs-3"></i>
                            </div>

                            <div>
                                <div className="text-secondary small">
                                    Assigned Subjects
                                </div>
                                <h3 className="fw-bold mb-0">
                                    {subjects.filter(s => s.faculty?.id).length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="rounded-3 bg-warning bg-opacity-10 text-warning p-3">
                                <i className="bi bi-person-exclamation fs-3"></i>
                            </div>

                            <div>
                                <div className="text-secondary small">
                                    Unassigned Subjects
                                </div>
                                <h3 className="fw-bold mb-0">
                                    {subjects.filter(s => !s.faculty?.id).length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="rounded-3 bg-info bg-opacity-10 text-info p-3">
                                <i className="bi bi-people fs-3"></i>
                            </div>

                            <div>
                                <div className="text-secondary small">
                                    Available Faculty
                                </div>
                                <h3 className="fw-bold mb-0">
                                    {facultyList.length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

            </div>


            {/* ADD / EDIT FORM */}

            {showForm && (
                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-header bg-primary text-white py-3">
                        <h5 className="mb-0">
                            <i className={`bi ${editMode ? "bi-pencil-square" : "bi-plus-circle"} me-2`}></i>
                            {editMode ? "Update Subject" : "Create New Subject"}
                        </h5>
                    </div>

                    <div className="card-body p-4">

                        <form onSubmit={saveSubject}>

                            <div className="row g-3">

                                {/* SUBJECT NAME */}

                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">
                                        Subject Name <span className="text-danger">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Database Management Systems"
                                        required
                                    />
                                </div>


                                {/* SUBJECT CODE */}

                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">
                                        Subject Code
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g. CS301"
                                    />
                                </div>


                                {/* CREDITS */}

                                <div className="col-12 col-md-6 col-xl-3">
                                    <label className="form-label fw-semibold">
                                        Credits
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        name="credits"
                                        value={formData.credits}
                                        onChange={handleChange}
                                        placeholder="e.g. 4"
                                        min="0"
                                    />
                                </div>


                                {/* COURSE */}

                                <div className="col-12 col-md-6 col-xl-3">
                                    <label className="form-label fw-semibold">
                                        Course
                                    </label>

                                    <select
                                        className="form-select"
                                        name="courseId"
                                        value={formData.courseId}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Course</option>

                                        {courses.map(course => (
                                            <option
                                                key={course.id}
                                                value={course.id}
                                            >
                                                {course.name}
                                                {course.code ? ` - ${course.code}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>


                                {/* SEMESTER */}

                                <div className="col-12 col-md-6 col-xl-3">
                                    <label className="form-label fw-semibold">
                                        Semester
                                    </label>

                                    <select
                                        className="form-select"
                                        name="semesterId"
                                        value={formData.semesterId}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Semester</option>

                                        {semesters.map(semester => (
                                            <option
                                                key={semester.id}
                                                value={semester.id}
                                            >
                                                Semester {semester.semesterNumber}
                                                {semester.academicYear
                                                    ? ` - ${semester.academicYear}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>


                                {/* FACULTY ASSIGNMENT */}

                                <div className="col-12 col-md-6 col-xl-3">
                                    <label className="form-label fw-semibold">
                                        Assign Faculty
                                    </label>

                                    <select
                                        className="form-select"
                                        name="facultyId"
                                        value={formData.facultyId}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Unassigned
                                        </option>

                                        {facultyList.map(faculty => (
                                            <option
                                                key={faculty.id}
                                                value={faculty.id}
                                            >
                                                {faculty.name || "Unnamed Faculty"}
                                                {faculty.employeeId
                                                    ? ` (${faculty.employeeId})`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="form-text">
                                        Select the faculty member responsible for this subject.
                                    </div>
                                </div>

                            </div>


                            {/* FORM ACTIONS */}

                            <div className="d-flex flex-wrap gap-2 mt-4">

                                <button
                                    type="submit"
                                    className="btn btn-success px-4"
                                    disabled={saving}
                                >
                                    <i className={`bi ${saving ? "bi-hourglass-split" : "bi-check-circle"} me-2`}></i>
                                    {saving
                                        ? "Saving..."
                                        : editMode
                                            ? "Update Subject"
                                            : "Save Subject"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary px-4"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormData({ ...emptyForm });
                                    }}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}


            {/* SUBJECT TABLE */}

            <div className="card border-0 shadow-sm">

                <div className="card-header bg-white border-0 p-3">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">

                        <div>
                            <h5 className="fw-bold mb-1">
                                All Subjects
                            </h5>

                            <small className="text-secondary">
                                View and manage subject assignments
                            </small>
                        </div>

                        <div className="input-group" style={{ maxWidth: "360px" }}>
                            <span className="input-group-text bg-light">
                                <i className="bi bi-search"></i>
                            </span>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search name, code, course, faculty..."
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                            />
                        </div>

                    </div>
                </div>


                <div className="card-body p-0">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-primary">
                                <tr>
                                    <th className="px-3">ID</th>
                                    <th>Subject</th>
                                    <th>Code</th>
                                    <th>Credits</th>
                                    <th>Course</th>
                                    <th>Semester</th>
                                    <th>Academic Year</th>
                                    <th>Assigned Faculty</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5">
                                            <div
                                                className="spinner-border text-primary"
                                                role="status"
                                            >
                                                <span className="visually-hidden">
                                                    Loading...
                                                </span>
                                            </div>

                                            <div className="text-secondary mt-2">
                                                Loading subjects...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSubjects.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="text-center py-5"
                                        >
                                            <i className="bi bi-journal-x fs-1 text-secondary d-block mb-2"></i>

                                            <div className="fw-semibold">
                                                {search
                                                    ? "No matching subjects found"
                                                    : "No subjects found"}
                                            </div>

                                            <small className="text-secondary">
                                                {search
                                                    ? "Try another search term."
                                                    : "Click Add Subject to create your first subject."}
                                            </small>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubjects.map(subject => (
                                        <tr key={subject.id}>

                                            <td className="px-3 text-secondary">
                                                {subject.id}
                                            </td>

                                            <td>
                                                <div className="fw-semibold">
                                                    {subject.name}
                                                </div>
                                            </td>

                                            <td>
                                                <span className="badge text-bg-light border">
                                                    {subject.code || "-"}
                                                </span>
                                            </td>

                                            <td>
                                                {subject.credits ?? "-"}
                                            </td>

                                            <td>
                                                {subject.course?.name || "-"}
                                            </td>

                                            <td>
                                                {subject.semester
                                                    ? `Semester ${subject.semester.semesterNumber}`
                                                    : "-"}
                                            </td>

                                            <td>
                                                {subject.semester?.academicYear || "-"}
                                            </td>

                                            <td>
                                                {subject.faculty?.id ? (
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: "36px",
                                                                height: "36px",
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            <i className="bi bi-person-check"></i>
                                                        </div>

                                                        <div>
                                                            <div className="fw-semibold">
                                                                {subject.faculty.name || "Unnamed Faculty"}
                                                            </div>

                                                            <small className="text-secondary">
                                                                {subject.faculty.employeeId || "Faculty"}
                                                            </small>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="badge text-bg-warning">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>

                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Edit subject and faculty"
                                                        onClick={() => openEditForm(subject)}
                                                    >
                                                        <i className="bi bi-pencil-square me-1"></i>
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Delete subject"
                                                        onClick={() => deleteSubject(subject.id)}
                                                    >
                                                        <i className="bi bi-trash me-1"></i>
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

                <div className="card-footer bg-white text-secondary small">
                    Showing {filteredSubjects.length} of {subjects.length} subjects
                </div>

            </div>

        </div>
    );
}
