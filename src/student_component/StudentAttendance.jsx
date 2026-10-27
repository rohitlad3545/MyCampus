
import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:8080/api/v1";

export default function StudentAttendance() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("DATE_DESC");

    useEffect(() => {
        const studentId = localStorage.getItem("id");
        const token = localStorage.getItem("jwtToken");
        const controller = new AbortController();

        const fetchAttendance = async () => {
            try {
                setLoading(true);
                setError("");

                if (!studentId || !token) {
                    throw new Error("Please log in again to view attendance.");
                }

                const response = await fetch(
                    `${API}/student/attendance/${studentId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                        signal: controller.signal,
                    }
                );

                const responseText = await response.text();
                let result = null;

                if (responseText.trim()) {
                    try {
                        result = JSON.parse(responseText);
                    } catch {
                        throw new Error(
                            `The server returned an invalid response (HTTP ${response.status}).`
                        );
                    }
                }

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                        `Failed to load attendance. HTTP ${response.status}.`
                    );
                }

                if (!result) {
                    throw new Error("The attendance API returned an empty response.");
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
                        result.message ||
                        "The API response does not contain an attendance records array."
                    );
                }

                setAttendance(records);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Unable to load attendance.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchAttendance();

        return () => controller.abort();
    }, []);

    const getStatus = (record) =>
        String(record.status ?? record.attendanceStatus ?? "")
            .trim()
            .toUpperCase();

    const getDateValue = (record) =>
        record.date ?? record.attendanceDate ?? record.createdAt ?? "";

    const getSubject = (record) =>
        record.subject?.name ?? record.subjectName ?? "";

    const formatDate = (value) => {
        if (!value) return "—";

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? String(value)
            : date.toLocaleDateString();
    };

    const presentCount = attendance.filter(
        (record) => getStatus(record) === "PRESENT"
    ).length;

    const absentCount = attendance.filter(
        (record) => getStatus(record) === "ABSENT"
    ).length;

    const totalClasses = attendance.length;

    const percentage =
        totalClasses > 0
            ? Math.round((presentCount / totalClasses) * 100)
            : 0;

    const filteredAttendance = useMemo(() => {
        const query = search.trim().toLowerCase();

        const records = attendance.filter((record) => {
            const matchesSearch =
                !query ||
                getSubject(record).toLowerCase().includes(query) ||
                getStatus(record).toLowerCase().includes(query) ||
                formatDate(getDateValue(record)).toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "ALL" || getStatus(record) === statusFilter;

            return matchesSearch && matchesStatus;
        });

        records.sort((a, b) => {
            if (sortBy === "DATE_ASC" || sortBy === "DATE_DESC") {
                const dateA = new Date(getDateValue(a)).getTime() || 0;
                const dateB = new Date(getDateValue(b)).getTime() || 0;

                return sortBy === "DATE_ASC" ? dateA - dateB : dateB - dateA;
            }

            if (sortBy === "SUBJECT_ASC") {
                return getSubject(a).localeCompare(getSubject(b));
            }

            if (sortBy === "SUBJECT_DESC") {
                return getSubject(b).localeCompare(getSubject(a));
            }

            return 0;
        });

        return records;
    }, [attendance, search, statusFilter, sortBy]);

    const refreshAttendance = () => {
        window.location.reload();
    };

    return (
        <div className="container-fluid px-0">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">My Attendance</h2>
                    <p className="text-muted mb-0">
                        Track your attendance and class records.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={refreshAttendance}
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
                        title: "Total Classes",
                        value: totalClasses,
                        icon: "bi-calendar-week",
                        color: "primary",
                    },
                    {
                        title: "Present",
                        value: presentCount,
                        icon: "bi-check-circle",
                        color: "success",
                    },
                    {
                        title: "Absent",
                        value: absentCount,
                        icon: "bi-x-circle",
                        color: "danger",
                    },
                    {
                        title: "Attendance Rate",
                        value: `${percentage}%`,
                        icon: "bi-graph-up-arrow",
                        color: "info",
                    },
                ].map((item) => (
                    <div className="col-12 col-sm-6 col-xl-3" key={item.title}>
                        <div className="card border-0 shadow-sm h-100 rounded-4">
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

                                {item.title === "Attendance Rate" && (
                                    <div className="progress mt-3" style={{ height: 6 }}>
                                        <div
                                            className="progress-bar"
                                            style={{ width: `${percentage}%` }}
                                            role="progressbar"
                                            aria-valuenow={percentage}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Attendance records */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <div>
                            <h5 className="fw-bold mb-1">Attendance Records</h5>
                            <small className="text-muted">
                                Search, filter, and sort your attendance.
                            </small>
                        </div>

                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                            {loading ? "Loading..." : `${filteredAttendance.length} records`}
                        </span>
                    </div>

                    {/* Search, filter and sort controls */}
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-lg-5">
                            <label htmlFor="attendanceSearch" className="form-label fw-semibold small">
                                Search records
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <i className="bi bi-search text-primary" />
                                </span>
                                <input
                                    id="attendanceSearch"
                                    type="search"
                                    className="form-control"
                                    placeholder="Search subject, status or date..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <label htmlFor="attendanceStatus" className="form-label fw-semibold small">
                                Filter by status
                            </label>
                            <select
                                id="attendanceStatus"
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All statuses</option>
                                <option value="PRESENT">Present</option>
                                <option value="ABSENT">Absent</option>
                                <option value="LATE">Late</option>
                            </select>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <label htmlFor="attendanceSort" className="form-label fw-semibold small">
                                Sort records
                            </label>
                            <select
                                id="attendanceSort"
                                className="form-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="DATE_DESC">Newest date first</option>
                                <option value="DATE_ASC">Oldest date first</option>
                                <option value="SUBJECT_ASC">Subject A–Z</option>
                                <option value="SUBJECT_DESC">Subject Z–A</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <p className="text-muted mt-3 mb-0">
                                Loading attendance records...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger mb-0" role="alert">
                            <div className="fw-semibold mb-1">
                                Unable to load attendance
                            </div>
                            <div>{error}</div>
                            <small className="d-block mt-2">
                                Check the attendance endpoint in your Spring Boot controller.
                            </small>
                        </div>
                    ) : attendance.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-calendar2-x text-secondary display-4" />
                            <h5 className="mt-3">No attendance records yet</h5>
                            <p className="text-muted mb-0">
                                Your attendance will appear here once it has been recorded.
                            </p>
                        </div>
                    ) : filteredAttendance.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-search text-secondary display-4" />
                            <h5 className="mt-3">No matching records</h5>
                            <p className="text-muted">
                                Try another search or change your filters.
                            </p>
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                    setSortBy("DATE_DESC");
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
                                        <th>Date</th>
                                        <th>Subject</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAttendance.map((record, index) => {
                                        const status = getStatus(record);

                                        const badgeClass =
                                            status === "PRESENT"
                                                ? "bg-success"
                                                : status === "ABSENT"
                                                ? "bg-danger"
                                                : status === "LATE"
                                                ? "bg-warning text-dark"
                                                : "bg-secondary";

                                        return (
                                            <tr key={record.id ?? index}>
                                                <td>{index + 1}</td>
                                                <td>{formatDate(getDateValue(record))}</td>
                                                <td>{getSubject(record) || "—"}</td>
                                                <td>
                                                    <span className={`badge ${badgeClass}`}>
                                                        {status || "Not recorded"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
