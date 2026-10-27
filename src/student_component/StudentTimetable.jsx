
import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:8080/api/v1";

const DAYS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

export default function StudentTimetable() {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [dayFilter, setDayFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("DAY_TIME");

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        const controller = new AbortController();

        async function fetchTimetable() {
            try {
                setLoading(true);
                setError("");

                if (!token) {
                    throw new Error("Please log in again to view your timetable.");
                }

                const response = await fetch(`${API}/student/timetable/all`, {
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
                        `Failed to load timetable (HTTP ${response.status}).`
                    );
                }

                if (!result) {
                    throw new Error("The timetable API returned an empty response.");
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
                        result.message || "The API did not return a timetable list."
                    );
                }

                setTimetable(records);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Unable to load timetable.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchTimetable();

        return () => controller.abort();
    }, []);

    const normalizedDay = (value) =>
        String(value || "").trim().toUpperCase();

    const getSubject = (item) =>
        item.subject?.name || item.subjectName || "Class";

    const getFaculty = (item) =>
        item.faculty?.name || item.facultyName || "Faculty not specified";

    const getStartTime = (item) => String(item.startTime || "");
    const getEndTime = (item) => String(item.endTime || "");

    const formatTime = (value) => {
        if (!value) return "—";

        const match = String(value).match(/^(\d{2}):(\d{2})/);
        if (!match) return value;

        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        const suffix = hours >= 12 ? "PM" : "AM";
        const displayHour = hours % 12 || 12;

        return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
    };

    const filteredTimetable = useMemo(() => {
        const query = search.trim().toLowerCase();

        const records = timetable.filter((item) => {
            const subject = getSubject(item);
            const faculty = getFaculty(item);
            const day = normalizedDay(item.day);
            const course = item.course?.name || "";
            const semester = item.semester?.semesterNumber
                ? `Semester ${item.semester.semesterNumber}`
                : "";

            const matchesSearch =
                !query ||
                subject.toLowerCase().includes(query) ||
                faculty.toLowerCase().includes(query) ||
                day.toLowerCase().includes(query) ||
                course.toLowerCase().includes(query) ||
                semester.toLowerCase().includes(query) ||
                getStartTime(item).toLowerCase().includes(query) ||
                getEndTime(item).toLowerCase().includes(query);

            const matchesDay =
                dayFilter === "ALL" || day === dayFilter;

            return matchesSearch && matchesDay;
        });

        records.sort((a, b) => {
            if (sortBy === "SUBJECT_ASC") {
                return getSubject(a).localeCompare(getSubject(b));
            }

            if (sortBy === "SUBJECT_DESC") {
                return getSubject(b).localeCompare(getSubject(a));
            }

            if (sortBy === "TIME_DESC") {
                return getStartTime(b).localeCompare(getStartTime(a));
            }

            if (sortBy === "TIME_ASC") {
                return getStartTime(a).localeCompare(getStartTime(b));
            }

            const dayA = DAYS.indexOf(normalizedDay(a.day));
            const dayB = DAYS.indexOf(normalizedDay(b.day));

            if (dayA !== dayB) {
                return dayA - dayB;
            }

            return getStartTime(a).localeCompare(getStartTime(b));
        });

        return records;
    }, [timetable, search, dayFilter, sortBy]);

    const scheduledDays = new Set(
        timetable.map((item) => normalizedDay(item.day))
            .filter((day) => DAYS.includes(day))
    ).size;

    const resetFilters = () => {
        setSearch("");
        setDayFilter("ALL");
        setSortBy("DAY_TIME");
    };

    return (
        <div className="container-fluid px-0">
            {/* Page heading */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">My Timetable</h2>
                    <p className="text-muted mb-0">
                        View and organize your weekly class schedule.
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
                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-2">Total Classes</p>
                                    <h3 className="fw-bold mb-0">
                                        {loading ? "—" : timetable.length}
                                    </h3>
                                </div>
                                <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-3">
                                    <i className="bi bi-calendar-week fs-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-2">Scheduled Days</p>
                                    <h3 className="fw-bold text-primary mb-0">
                                        {loading ? "—" : scheduledDays}
                                    </h3>
                                </div>
                                <div className="rounded-circle bg-success bg-opacity-10 text-success p-3">
                                    <i className="bi bi-calendar-check fs-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and filters */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <div>
                            <h5 className="fw-bold mb-1">Find Your Classes</h5>
                            <p className="text-muted small mb-0">
                                Search subjects, faculty, or courses and filter by day.
                            </p>
                        </div>

                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                            {loading ? "Loading..." : `${filteredTimetable.length} classes`}
                        </span>
                    </div>

                    <div className="row g-3">
                        <div className="col-12 col-lg-5">
                            <label htmlFor="timetableSearch" className="form-label fw-semibold small">
                                Search timetable
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <i className="bi bi-search text-primary" />
                                </span>
                                <input
                                    id="timetableSearch"
                                    type="search"
                                    className="form-control"
                                    placeholder="Subject, faculty, course..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <label htmlFor="timetableDay" className="form-label fw-semibold small">
                                Filter by day
                            </label>
                            <select
                                id="timetableDay"
                                className="form-select"
                                value={dayFilter}
                                onChange={(e) => setDayFilter(e.target.value)}
                            >
                                <option value="ALL">All days</option>
                                {DAYS.map((day) => (
                                    <option value={day} key={day}>
                                        {day.charAt(0) + day.slice(1).toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <label htmlFor="timetableSort" className="form-label fw-semibold small">
                                Sort classes
                            </label>
                            <select
                                id="timetableSort"
                                className="form-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="DAY_TIME">Day and start time</option>
                                <option value="TIME_ASC">Start time: earliest first</option>
                                <option value="TIME_DESC">Start time: latest first</option>
                                <option value="SUBJECT_ASC">Subject: A–Z</option>
                                <option value="SUBJECT_DESC">Subject: Z–A</option>
                            </select>
                        </div>
                    </div>

                    {(search || dayFilter !== "ALL" || sortBy !== "DAY_TIME") && (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary mt-3"
                            onClick={resetFilters}
                        >
                            <i className="bi bi-x-circle me-1" />
                            Reset filters
                        </button>
                    )}
                </div>
            </div>

            {/* Timetable results */}
            {loading ? (
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status" />
                        <p className="text-muted mt-3 mb-0">Loading timetable...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger">
                    <strong>Unable to load timetable</strong>
                    <div className="mt-1">{error}</div>
                </div>
            ) : timetable.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-calendar-week display-4 text-secondary" />
                        <h5 className="mt-3">No timetable available</h5>
                        <p className="text-muted mb-0">
                            Your class schedule will appear here when published.
                        </p>
                    </div>
                </div>
            ) : filteredTimetable.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-search display-4 text-secondary" />
                        <h5 className="mt-3">No matching classes</h5>
                        <p className="text-muted">
                            Try another search term or change the selected day.
                        </p>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={resetFilters}
                        >
                            Clear filters
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {DAYS.filter((day) =>
                        filteredTimetable.some(
                            (item) => normalizedDay(item.day) === day
                        )
                    ).map((day) => {
                        const records = filteredTimetable.filter(
                            (item) => normalizedDay(item.day) === day
                        );

                        return (
                            <div className="col-12 col-lg-6" key={day}>
                                <div className="card border-0 shadow-sm rounded-4 h-100">
                                    <div className="card-header bg-white border-bottom py-3 rounded-top-4">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="fw-bold mb-0">
                                                {day.charAt(0) + day.slice(1).toLowerCase()}
                                            </h5>
                                            <span className="badge bg-primary rounded-pill">
                                                {records.length} classes
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="d-flex flex-column gap-3">
                                            {records.map((item, index) => (
                                                <div
                                                    key={item.id ?? `${day}-${index}`}
                                                    className="border rounded-3 p-3"
                                                >
                                                    <div className="d-flex justify-content-between align-items-start gap-3">
                                                        <div className="d-flex gap-3">
                                                            <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-3 align-self-start">
                                                                <i className="bi bi-book fs-5" />
                                                            </div>

                                                            <div>
                                                                <h6 className="fw-bold mb-1">
                                                                    {getSubject(item)}
                                                                </h6>
                                                                <div className="text-muted small">
                                                                    <i className="bi bi-person me-1" />
                                                                    {getFaculty(item)}
                                                                </div>

                                                                {(item.course?.name ||
                                                                    item.semester?.semesterNumber) && (
                                                                    <div className="text-muted small mt-1">
                                                                        {item.course?.name || ""}
                                                                        {item.course?.name &&
                                                                        item.semester?.semesterNumber
                                                                            ? " · "
                                                                            : ""}
                                                                        {item.semester?.semesterNumber
                                                                            ? `Semester ${item.semester.semesterNumber}`
                                                                            : ""}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="text-end text-nowrap">
                                                            <span className="badge bg-primary-subtle text-primary mb-1">
                                                                <i className="bi bi-clock me-1" />
                                                                {formatTime(item.startTime)}
                                                            </span>
                                                            <div className="text-muted small">
                                                                to {formatTime(item.endTime)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
