/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:8080/api/v1";

export default function StudentDashboard() {
    const [fees, setFees] = useState([]);
    const [loadingFees, setLoadingFees] = useState(true);
    const [feeError, setFeeError] = useState("");
    const [period, setPeriod] = useState("week");

    const studentId = localStorage.getItem("id");
    const token = localStorage.getItem("jwtToken");

    const [studentName, setStudentName] = useState("Student");

    useEffect(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem("userData") || "null"
            );

            setStudentName(
                saved?.name ||
                saved?.username ||
                "Student"
            );
        } catch {
            setStudentName("Student");
        }
    }, []);

    useEffect(() => {
        if (!studentId || !token) {
            setLoadingFees(false);
            setFeeError("Please log in to view your fee details.");
            return;
        }

        const controller = new AbortController();

        async function loadFees() {
            setLoadingFees(true);
            setFeeError("");

            try {
                const response = await fetch(
                    `${API}/student/fee/all/${studentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Unable to load fees (${response.status})`
                    );
                }

                const result = await response.json();

                setFees(Array.isArray(result.data) ? result.data : []);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setFeeError(error.message || "Unable to load fees.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingFees(false);
                }
            }
        }

        loadFees();

        return () => controller.abort();
    }, [studentId, token]);

    const feeSummary = useMemo(() => {
        return fees.reduce(
            (summary, fee) => {
                summary.total += Number(fee.totalAmount || 0);
                summary.paid += Number(fee.amountPaid || 0);
                summary.balance += Number(fee.balance || 0);
                summary.discount += Number(fee.discount || 0);
                return summary;
            },
            { total: 0, paid: 0, balance: 0, discount: 0 }
        );
    }, [fees]);

    const paidPercentage = feeSummary.total > 0
        ? Math.min(
            100,
            Math.round((feeSummary.paid / feeSummary.total) * 100)
        )
        : 0;

    const currency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount);

    const attendance = [
        { label: "Mon", value: 82 },
        { label: "Tue", value: 90 },
        { label: "Wed", value: 76 },
        { label: "Thu", value: 95 },
        { label: "Fri", value: 88 },
        { label: "Sat", value: 65 }
    ];

    const activities = [
        {
            icon: "bi-journal-text",
            title: "Assignments",
            description: "Review and submit your coursework",
            path: "/student/assignments",
            color: "purple"
        },
        {
            icon: "bi-calendar-week",
            title: "Timetable",
            description: "Check your class schedule",
            path: "/student/timetable",
            color: "blue"
        },
        {
            icon: "bi-bar-chart",
            title: "Results",
            description: "Review marks and grades",
            path: "/student/results",
            color: "green"
        },
        {
            icon: "bi-credit-card",
            title: "Fee Payment",
            description: "View fees and outstanding balance",
            path: "/student/fees",
            color: "orange"
        }
    ];

    return (
        <div className="student-dashboard">
            <style>{`
                .student-dashboard {
                    color: #172554;
                    min-height: 80vh;
                    animation: dashboardEnter .4s ease-out;
                }

                @keyframes dashboardEnter {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .sd-welcome {
                    background: linear-gradient(115deg, #ffffff, #eef5ff);
                    border: 1px solid #e4ecf8;
                    border-radius: 20px;
                    padding: 28px;
                }

                .sd-eyebrow {
                    color: #2563eb;
                    font-size: .76rem;
                    font-weight: 800;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                }

                .sd-card {
                    background: white;
                    border: 1px solid #e8edf5;
                    border-radius: 18px;
                    height: 100%;
                    box-shadow: 0 4px 16px rgba(15, 23, 42, .035);
                    transition: transform .2s, box-shadow .2s;
                }

                .sd-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 25px rgba(15, 23, 42, .075);
                }

                .sd-stat-icon {
                    width: 48px;
                    height: 48px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    font-size: 1.35rem;
                    flex-shrink: 0;
                }

                .sd-blue { background: #eaf2ff; color: #2563eb; }
                .sd-purple { background: #f1eaff; color: #7c3aed; }
                .sd-green { background: #e4f8ef; color: #059669; }
                .sd-orange { background: #fff0dc; color: #ea580c; }

                .sd-muted { color: #718096; }
                .sd-section-title { font-size: 1.05rem; font-weight: 750; }
                .sd-big-number { font-size: 1.85rem; font-weight: 800; letter-spacing: -.04em; }
                .sd-small-label { color: #718096; font-size: .83rem; }

                .sd-chart {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    gap: 14px;
                    height: 190px;
                    padding-top: 15px;
                    border-bottom: 1px solid #e8edf5;
                    background: repeating-linear-gradient(
                        to bottom,
                        transparent 0,
                        transparent 46px,
                        #edf1f7 47px,
                        transparent 48px
                    );
                }

                .sd-bar-column {
                    flex: 1;
                    max-width: 54px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 8px;
                }

                .sd-bar {
                    width: 100%;
                    max-width: 35px;
                    min-height: 5px;
                    border-radius: 8px 8px 3px 3px;
                    background: linear-gradient(180deg, #60a5fa, #2563eb);
                    transition: height .35s ease;
                }

                .sd-activity {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    padding: 15px 0;
                    border-bottom: 1px solid #edf1f6;
                    text-decoration: none;
                    color: inherit;
                }

                .sd-activity:last-child { border-bottom: 0; }
                .sd-activity:hover .sd-activity-title { color: #2563eb; }

                .sd-link {
                    color: #2563eb;
                    font-size: .86rem;
                    font-weight: 700;
                    text-decoration: none;
                }

                .sd-link:hover { text-decoration: underline; }

                .sd-progress {
                    height: 9px;
                    border-radius: 20px;
                    overflow: hidden;
                    background: #e9eff8;
                }

                .sd-progress-fill {
                    height: 100%;
                    border-radius: 20px;
                    background: linear-gradient(90deg, #3b82f6, #2563eb);
                    transition: width .5s;
                }

                .sd-pill {
                    border-radius: 30px;
                    padding: 5px 10px;
                    font-size: .75rem;
                    font-weight: 700;
                    background: #eff6ff;
                    color: #2563eb;
                }

                .sd-empty {
                    background: #f8fafc;
                    border: 1px dashed #d9e2ef;
                    border-radius: 12px;
                    padding: 18px;
                    color: #718096;
                    font-size: .88rem;
                }

                @media (max-width: 575px) {
                    .sd-welcome { padding: 20px; }
                    .sd-big-number { font-size: 1.55rem; }
                    .sd-chart { gap: 6px; }
                }
            `}</style>

            {/* Welcome banner */}
            <section className="sd-welcome mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <div className="sd-eyebrow mb-2">
                            Student portal
                        </div>

                        <h2 className="fw-bold mb-2">
                            Welcome back, {studentName}! 👋
                        </h2>

                        <p className="sd-muted mb-0">
                            Your academic progress, all in one place.
                        </p>
                    </div>

                    <div className="text-sm-end">
                        <span className="sd-pill">
                            <i className="bi bi-calendar3 me-2"></i>
                            {new Date().toLocaleDateString("en-IN", {
                                weekday: "long",
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            })}
                        </span>
                        <div className="sd-small-label mt-2">
                            Have a productive day!
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="sd-card p-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <span className="sd-stat-icon sd-blue">
                                <i className="bi bi-calendar-check"></i>
                            </span>
                            <span className="sd-small-label">Attendance</span>
                        </div>
                        <div className="sd-big-number mt-3">—</div>
                        <div className="sd-small-label">
                            Attendance API not connected yet
                        </div>
                        <Link className="sd-link d-inline-block mt-3"
                            to="/student/attendance">
                            View attendance →
                        </Link>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="sd-card p-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <span className="sd-stat-icon sd-purple">
                                <i className="bi bi-journal-check"></i>
                            </span>
                            <span className="sd-small-label">Assignments</span>
                        </div>
                        <div className="sd-big-number mt-3">—</div>
                        <div className="sd-small-label">
                            Assignment API not connected yet
                        </div>
                        <Link className="sd-link d-inline-block mt-3"
                            to="/student/assignments">
                            View assignments →
                        </Link>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="sd-card p-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <span className="sd-stat-icon sd-green">
                                <i className="bi bi-mortarboard"></i>
                            </span>
                            <span className="sd-small-label">Results</span>
                        </div>
                        <div className="sd-big-number mt-3">—</div>
                        <div className="sd-small-label">
                            Results API not connected yet
                        </div>
                        <Link className="sd-link d-inline-block mt-3"
                            to="/student/results">
                            View results →
                        </Link>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="sd-card p-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <span className="sd-stat-icon sd-orange">
                                <i className="bi bi-wallet2"></i>
                            </span>
                            <span className="sd-small-label">Outstanding fees</span>
                        </div>

                        <div className="sd-big-number mt-3">
                            {loadingFees ? "…" : currency(feeSummary.balance)}
                        </div>

                        <div className="sd-small-label">
                            {loadingFees
                                ? "Loading fee details"
                                : `${fees.length} assigned fee record(s)`}
                        </div>

                        <Link className="sd-link d-inline-block mt-3"
                            to="/student/fees">
                            Manage fees →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="row g-4 mb-4">
                {/* Attendance visualization */}
                <div className="col-12 col-xl-7">
                    <section className="sd-card p-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div>
                                <h3 className="sd-section-title mb-1">
                                    <i className="bi bi-graph-up-arrow text-primary me-2"></i>
                                    Academic overview
                                </h3>
                                <p className="sd-small-label mb-0">
                                    Your activity chart will become live when the relevant APIs are connected.
                                </p>
                            </div>

                            <select
                                className="form-select form-select-sm"
                                style={{ width: 135 }}
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                aria-label="Chart period"
                            >
                                <option value="week">This week</option>
                                <option value="month">This month</option>
                            </select>
                        </div>

                        <div className="sd-empty mt-4 mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Attendance history is not connected yet. The sample bars below are illustrative, not your actual attendance.
                        </div>

                        <div className="sd-chart">
                            {attendance.map((item) => (
                                <div className="sd-bar-column" key={item.label}>
                                    <span className="sd-small-label">
                                        {item.value}%
                                    </span>
                                    <div
                                        className="sd-bar"
                                        style={{ height: `${item.value}%` }}
                                        title={`${item.label}: sample ${item.value}%`}
                                    />
                                    <span className="sd-small-label">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Fee summary */}
                <div className="col-12 col-xl-5">
                    <section className="sd-card p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="sd-section-title mb-1">
                                    <i className="bi bi-credit-card text-primary me-2"></i>
                                    Fee summary
                                </h3>
                                <p className="sd-small-label mb-0">
                                    Your assigned fee records
                                </p>
                            </div>
                            <Link className="sd-link" to="/student/fees">
                                Details →
                            </Link>
                        </div>

                        {loadingFees ? (
                            <div className="text-center py-4">
                                <div className="spinner-border spinner-border-sm text-primary me-2" />
                                Loading fees…
                            </div>
                        ) : feeError ? (
                            <div className="alert alert-warning small">
                                {feeError}
                            </div>
                        ) : fees.length === 0 ? (
                            <div className="sd-empty">
                                <i className="bi bi-wallet me-2"></i>
                                No fee records have been assigned to your account yet.
                            </div>
                        ) : (
                            <>
                                <div className="d-flex justify-content-between align-items-end mb-2">
                                    <div>
                                        <div className="sd-small-label">Total amount</div>
                                        <div className="fw-bold fs-4">
                                            {currency(feeSummary.total)}
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="sd-small-label">Paid</div>
                                        <div className="fw-bold text-success">
                                            {currency(feeSummary.paid)}
                                        </div>
                                    </div>
                                </div>

                                <div className="sd-progress mb-3">
                                    <div
                                        className="sd-progress-fill"
                                        style={{ width: `${paidPercentage}%` }}
                                    />
                                </div>

                                <div className="d-flex justify-content-between sd-small-label mb-4">
                                    <span>{paidPercentage}% paid</span>
                                    <span>{currency(feeSummary.balance)} remaining</span>
                                </div>

                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="sd-small-label">Discount</div>
                                        <div className="fw-bold text-success">
                                            {currency(feeSummary.discount)}
                                        </div>
                                    </div>
                                    <div className="col-6 text-end">
                                        <div className="sd-small-label">Fee records</div>
                                        <div className="fw-bold">
                                            {fees.length}
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    to="/student/fees"
                                    className="btn btn-primary w-100 mt-4"
                                >
                                    View fee details
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Link>
                            </>
                        )}
                    </section>
                </div>
            </div>

            {/* Quick access */}
            <section className="sd-card p-4 mb-4">
                <div className="mb-3">
                    <h3 className="sd-section-title mb-1">
                        <i className="bi bi-lightning-charge text-primary me-2"></i>
                        Quick access
                    </h3>
                    <p className="sd-small-label mb-0">
                        Jump straight to a frequently used module.
                    </p>
                </div>

                <div className="row g-3">
                    {activities.map((item) => (
                        <div className="col-12 col-sm-6 col-xl-3" key={item.path}>
                            <Link
                                to={item.path}
                                className="sd-activity h-100 border rounded-3 px-3"
                            >
                                <span className={`sd-stat-icon sd-${item.color}`}>
                                    <i className={`bi ${item.icon}`}></i>
                                </span>
                                <span className="flex-grow-1">
                                    <span className="d-block fw-bold sd-activity-title">
                                        {item.title}
                                    </span>
                                    <span className="sd-small-label">
                                        {item.description}
                                    </span>
                                </span>
                                <i className="bi bi-chevron-right text-secondary"></i>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Status and announcements */}
            <div className="row g-4">
                <div className="col-12 col-lg-6">
                    <section className="sd-card p-4">
                        <h3 className="sd-section-title mb-3">
                            <i className="bi bi-megaphone text-primary me-2"></i>
                            Announcements
                        </h3>

                        <div className="sd-empty">
                            College announcements will appear here when the Student announcements API is connected.
                        </div>

                        <Link
                            to="/student/announcements"
                            className="sd-link d-inline-block mt-3"
                        >
                            View all announcements →
                        </Link>
                    </section>
                </div>

                <div className="col-12 col-lg-6">
                    <section className="sd-card p-4">
                        <h3 className="sd-section-title mb-3">
                            <i className="bi bi-calendar-event text-primary me-2"></i>
                            Upcoming exams
                        </h3>

                        <div className="sd-empty">
                            Your upcoming exams will appear here when the Student exams API is connected.
                        </div>

                        <Link
                            to="/student/exams"
                            className="sd-link d-inline-block mt-3"
                        >
                            View exam schedule →
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    );
}