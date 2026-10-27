
import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:8080/api/v1";

export default function StudentAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("DUE_ASC");

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        const controller = new AbortController();

        async function fetchAssignments() {
            try {
                setLoading(true);
                setError("");

                if (!token) {
                    throw new Error("Please log in again to view assignments.");
                }

                const response = await fetch(`${API}/student/assignments/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    signal: controller.signal,
                });

                const text = await response.text();
                let result = null;

                if (text.trim()) {
                    try {
                        result = JSON.parse(text);
                    } catch {
                        throw new Error(
                            `Invalid server response (HTTP ${response.status}).`
                        );
                    }
                }

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                        `Failed to load assignments (HTTP ${response.status}).`
                    );
                }

                if (!result) {
                    throw new Error("The assignments API returned an empty response.");
                }

                const records = Array.isArray(result)
                    ? result
                    : Array.isArray(result.data)
                    ? result.data
                    : Array.isArray(result.data?.data)
                    ? result.data.data
                    : null;

                if (!records) {
                    throw new Error(
                        result.message || "The API did not return an assignments list."
                    );
                }

                setAssignments(records);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Unable to load assignments.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchAssignments();

        return () => controller.abort();
    }, []);

    const formatDate = (value) => {
        if (!value) return "—";

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? String(value)
            : date.toLocaleDateString();
    };

    const isOverdue = (value) =>
        value &&
        new Date(value).getTime() < new Date().setHours(0, 0, 0, 0);

    const getTitle = (item) => item.title || "Untitled assignment";
    const getSubject = (item) => item.subject?.name || item.subjectName || "";
    const getFaculty = (item) => item.faculty?.name || item.facultyName || "";

    const getStatus = (item) => {
        const explicitStatus = String(
            item.status ?? item.submissionStatus ?? ""
        ).trim().toUpperCase();

        if (["SUBMITTED", "GRADED"].includes(explicitStatus)) {
            return explicitStatus;
        }

        if (item.dueDate && isOverdue(item.dueDate)) {
            return "OVERDUE";
        }

        return "UPCOMING";
    };

    const filteredAssignments = useMemo(() => {
        const query = search.trim().toLowerCase();

        const records = assignments.filter((item) => {
            const matchesSearch =
                !query ||
                getTitle(item).toLowerCase().includes(query) ||
                getSubject(item).toLowerCase().includes(query) ||
                getFaculty(item).toLowerCase().includes(query) ||
                String(item.description || "").toLowerCase().includes(query) ||
                getStatus(item).toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "ALL" || getStatus(item) === statusFilter;

            return matchesSearch && matchesStatus;
        });

        records.sort((a, b) => {
            if (sortBy === "TITLE_ASC") {
                return getTitle(a).localeCompare(getTitle(b));
            }

            if (sortBy === "TITLE_DESC") {
                return getTitle(b).localeCompare(getTitle(a));
            }

            if (sortBy === "SUBJECT_ASC") {
                return getSubject(a).localeCompare(getSubject(b));
            }

            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;

            if (sortBy === "DUE_DESC") {
                return dateB - dateA;
            }

            return dateA - dateB;
        });

        return records;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignments, search, statusFilter, sortBy]);

    const upcomingCount = assignments.filter(
        (item) => item.dueDate && !isOverdue(item.dueDate)
    ).length;

    const pastDeadlineCount = assignments.filter(
        (item) => isOverdue(item.dueDate)
    ).length;

    const statusBadge = (status) => {
        const classes = {
            SUBMITTED: "bg-success",
            GRADED: "bg-primary",
            OVERDUE: "bg-danger",
            UPCOMING: "bg-warning text-dark",
        };

        const labels = {
            SUBMITTED: "Submitted",
            GRADED: "Graded",
            OVERDUE: "Past deadline",
            UPCOMING: "Upcoming",
        };

        return (
            <span className={`badge ${classes[status] || "bg-secondary"}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="container-fluid px-0">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">My Assignments</h2>
                    <p className="text-muted mb-0">
                        View assignment instructions and submission deadlines.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-2" />
                    Refresh
                </button>
            </div>

            {/* Summary cards */}
            <div className="row g-3 mb-4">
                {[
                    {
                        title: "Total Assignments",
                        value: assignments.length,
                        icon: "bi-journal-text",
                        color: "primary",
                    },
                    {
                        title: "Upcoming Deadlines",
                        value: upcomingCount,
                        icon: "bi-calendar-check",
                        color: "success",
                    },
                    {
                        title: "Past Deadlines",
                        value: pastDeadlineCount,
                        icon: "bi-clock-history",
                        color: "danger",
                    },
                ].map((item) => (
                    <div className="col-12 col-md-4" key={item.title}>
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-2">{item.title}</p>
                                        <h3 className={`fw-bold text-${item.color} mb-0`}>
                                            {loading ? "—" : item.value}
                                        </h3>
                                    </div>
                                    <div className={`rounded-circle bg-${item.color} bg-opacity-10 text-${item.color} p-3`}>
                                        <i className={`bi ${item.icon} fs-4`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Assignment records */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <div>
                            <h5 className="fw-bold mb-1">Assignment Records</h5>
                            <small className="text-muted">
                                Search, filter, and sort your assignments.
                            </small>
                        </div>

                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                            {loading ? "Loading..." : `${filteredAssignments.length} records`}
                        </span>
                    </div>

                    {/* Search and filters */}
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-lg-5">
                            <label htmlFor="assignmentSearch" className="form-label fw-semibold small">
                                Search assignments
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <i className="bi bi-search text-primary" />
                                </span>
                                <input
                                    id="assignmentSearch"
                                    type="search"
                                    className="form-control"
                                    placeholder="Search title, subject or faculty..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <label htmlFor="assignmentStatus" className="form-label fw-semibold small">
                                Filter by status
                            </label>
                            <select
                                id="assignmentStatus"
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All statuses</option>
                                <option value="UPCOMING">Upcoming</option>
                                <option value="OVERDUE">Past deadline</option>
                                <option value="SUBMITTED">Submitted</option>
                                <option value="GRADED">Graded</option>
                            </select>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <label htmlFor="assignmentSort" className="form-label fw-semibold small">
                                Sort assignments
                            </label>
                            <select
                                id="assignmentSort"
                                className="form-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="DUE_ASC">Due date: earliest first</option>
                                <option value="DUE_DESC">Due date: latest first</option>
                                <option value="TITLE_ASC">Title: A–Z</option>
                                <option value="TITLE_DESC">Title: Z–A</option>
                                <option value="SUBJECT_ASC">Subject: A–Z</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <p className="text-muted mt-3 mb-0">Loading assignments...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger">
                            <strong>Unable to load assignments</strong>
                            <div className="mt-1">{error}</div>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-journal-text display-4 text-secondary" />
                            <h5 className="mt-3">No assignments available</h5>
                            <p className="text-muted mb-0">
                                Assignments will appear here when they are published.
                            </p>
                        </div>
                    ) : filteredAssignments.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-search display-4 text-secondary" />
                            <h5 className="mt-3">No matching assignments</h5>
                            <p className="text-muted">Try changing your search or filters.</p>
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                    setSortBy("DUE_ASC");
                                }}
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Subject</th>
                                        <th>Faculty</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssignments.map((item, index) => (
                                        <tr key={item.id ?? index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="fw-semibold">
                                                    {getTitle(item)}
                                                </div>
                                                {item.description && (
                                                    <small className="text-muted">
                                                        {item.description}
                                                    </small>
                                                )}
                                            </td>
                                            <td>{getSubject(item) || "—"}</td>
                                            <td>{getFaculty(item) || "—"}</td>
                                            <td>{formatDate(item.dueDate)}</td>
                                            <td>{statusBadge(getStatus(item))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
