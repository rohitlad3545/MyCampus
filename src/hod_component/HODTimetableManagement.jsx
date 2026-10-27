/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useMemo, useState } from "react";

const API = "http://localhost:8080/api/v1/hod/timetable";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EMPTY_FORM = {
  courseId: "",
  semesterId: "",
  subjectId: "",
  facultyId: "",
  day: "Monday",
  startTime: "",
  endTime: "",
};

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function getList(response) {
  const data = unwrap(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;

  return [];
}

function getId(item) {
  return item?.id ?? item?.timetableId;
}

function getErrorMessage(body, status) {
  return (
    body?.message ||
    body?.error ||
    `Request failed with status ${status}`
  );
}

async function request(path, options = {}) {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    throw new Error("Your login session has expired. Please log in again.");
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let body = null;

  if (text.trim()) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }

  return body;
}

function formatTime(value) {
  if (!value) return "—";

  const match = String(value).match(/^(\d{2}):(\d{2})/);
  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${suffix}`;
}

function getCourseName(item) {
  return item.course?.name || item.course?.courseName ||
    item.courseName || `Course ${item.course?.id ?? ""}`;
}

function getSemesterName(item) {
  return item.semester?.name || item.semester?.semesterName ||
    item.semesterName || `Semester ${item.semester?.id ?? ""}`;
}

function getSubjectName(item) {
  return item.subject?.name || item.subject?.subjectName ||
    item.subjectName || `Subject ${item.subject?.id ?? ""}`;
}

function getFacultyName(item) {
  return item.faculty?.name || item.faculty?.facultyName ||
    item.facultyName || `Faculty ${item.faculty?.id ?? ""}`;
}

function getDay(item) {
  return DAYS.find(
    (day) => day.toLowerCase() === String(item.day || "").toLowerCase()
  ) || item.day || "";
}

export default function HODTimetableManagement() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await request("/all");
      setEntries(getList(response));
    } catch (err) {
      setError(err.message || "Unable to load timetable entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const dayCounts = useMemo(() => {
    return DAYS.reduce((counts, day) => {
      counts[day] = entries.filter(
        (item) => getDay(item) === day
      ).length;
      return counts;
    }, {});
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return entries
      .filter((item) => {
        const matchesDay =
          selectedDay === "All" || getDay(item) === selectedDay;

        const searchable = [
          getCourseName(item),
          getSemesterName(item),
          getSubjectName(item),
          getFacultyName(item),
          getDay(item),
          item.startTime,
          item.endTime,
        ].join(" ").toLowerCase();

        return matchesDay && searchable.includes(query);
      })
      .sort((a, b) => {
        const dayDifference =
          DAYS.indexOf(getDay(a)) - DAYS.indexOf(getDay(b));

        if (dayDifference !== 0) {
          return dayDifference;
        }

        return String(a.startTime || "").localeCompare(
          String(b.startTime || "")
        );
      });
  }, [entries, search, selectedDay]);

  function openAddForm() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(getId(item));
    setForm({
      courseId: item.course?.id ?? "",
      semesterId: item.semester?.id ?? "",
      subjectId: item.subject?.id ?? "",
      facultyId: item.faculty?.id ?? "",
      day: getDay(item) || "Monday",
      startTime: String(item.startTime || "").slice(0, 5),
      endTime: String(item.endTime || "").slice(0, 5),
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function saveEntry(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const courseId = Number(form.courseId);
    const semesterId = Number(form.semesterId);
    const subjectId = Number(form.subjectId);
    const facultyId = Number(form.facultyId);

    if (
      !Number.isInteger(courseId) || courseId <= 0 ||
      !Number.isInteger(semesterId) || semesterId <= 0 ||
      !Number.isInteger(subjectId) || subjectId <= 0 ||
      !Number.isInteger(facultyId) || facultyId <= 0
    ) {
      setError("Enter valid positive IDs for course, semester, subject, and faculty.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError("Please select both start time and end time.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("End time must be later than start time.");
      return;
    }

    const payload = {
      course: { id: courseId },
      semester: { id: semesterId },
      subject: { id: subjectId },
      faculty: { id: facultyId },
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
    };

    setSaving(true);

    try {
      if (editingId != null) {
        await request(`/update/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setNotice("Timetable entry updated successfully.");
      } else {
        await request("/add", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("Timetable entry added successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });

      await loadEntries();
    } catch (err) {
      setError(err.message || "Unable to save timetable entry.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id) {
    if (id == null) {
      setError("This timetable entry has no ID and cannot be deleted.");
      return;
    }

    setError("");
    setNotice("");

    try {
      await request(`/delete/${id}`, {
        method: "DELETE",
      });

      setNotice("Timetable entry deleted successfully.");
      setDeleteId(null);
      await loadEntries();
    } catch (err) {
      setError(err.message || "Unable to delete timetable entry.");
    }
  }

  return (
    <div className="container-fluid px-0 timetable-page">
      <style>{`
        .timetable-page {
          color: #1c2e50;
        }

        .timetable-page .tm-card {
          border: 1px solid #e8edf5;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 5px 18px rgba(26,55,100,.045);
        }

        .timetable-page .tm-stat {
          padding: 18px;
          height: 100%;
        }

        .timetable-page .tm-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 13px;
          background: #eaf1ff;
          color: #2563eb;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .timetable-page .tm-stat-label {
          color: #718096;
          font-size: .82rem;
        }

        .timetable-page .tm-stat-value {
          font-size: 1.6rem;
          font-weight: 800;
        }

        .timetable-page .tm-day {
          min-height: 54px;
          border: 1px solid #cbd8ed;
          border-radius: 10px;
          background: white;
          color: #2563eb;
        }

        .timetable-page .tm-day.active {
          color: white;
          background: #2563eb;
          border-color: #2563eb;
        }

        .timetable-page .tm-muted {
          color: #718096;
        }

        .timetable-page .table > :not(caption) > * > * {
          padding: 14px 16px;
          vertical-align: middle;
        }

        .timetable-page .table thead th {
          white-space: nowrap;
          font-size: .76rem;
          text-transform: uppercase;
          letter-spacing: .4px;
          color: #65758b;
          background: #f7f9fc;
        }

        .timetable-page .tm-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(15, 23, 42, .55);
          overflow-y: auto;
        }

        .timetable-page .tm-modal {
          width: 100%;
          max-width: 650px;
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 18px;
          box-shadow: 0 20px 60px rgba(0,0,0,.2);
        }

        .timetable-page .tm-form-label {
          font-weight: 600;
          font-size: .88rem;
          margin-bottom: 6px;
        }

        @media (max-width: 575px) {
          .timetable-page .tm-stat {
            padding: 14px;
          }
        }
      `}</style>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="text-primary fw-bold small mb-2">
            HOD / ACADEMIC MANAGEMENT
          </div>
          <h2 className="fw-bold mb-1">Timetable Management</h2>
          <p className="tm-muted mb-0">
            Add, edit, and organize your department's weekly class schedule.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-primary rounded-3"
            onClick={loadEntries}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2" />
            Refresh
          </button>

          <button
            className="btn btn-primary rounded-3"
            onClick={openAddForm}
          >
            <i className="bi bi-plus-lg me-2" />
            Add Timetable
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
          <button
            type="button"
            className="btn-close float-end"
            aria-label="Dismiss"
            onClick={() => setError("")}
          />
        </div>
      )}

      {notice && (
        <div className="alert alert-success rounded-3">
          <i className="bi bi-check-circle me-2" />
          {notice}
          <button
            type="button"
            className="btn-close float-end"
            aria-label="Dismiss"
            onClick={() => setNotice("")}
          />
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="tm-card tm-stat d-flex align-items-center gap-3">
            <div className="tm-stat-icon">
              <i className="bi bi-calendar-week" />
            </div>
            <div>
              <div className="tm-stat-label">Total Timetable Entries</div>
              <div className="tm-stat-value">{entries.length}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="tm-card tm-stat d-flex align-items-center gap-3">
            <div className="tm-stat-icon">
              <i className="bi bi-calendar-check" />
            </div>
            <div>
              <div className="tm-stat-label">Days With Classes</div>
              <div className="tm-stat-value">
                {DAYS.filter((day) => dayCounts[day] > 0).length}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="tm-card tm-stat d-flex align-items-center gap-3">
            <div className="tm-stat-icon">
              <i className="bi bi-list-check" />
            </div>
            <div>
              <div className="tm-stat-label">Displayed Entries</div>
              <div className="tm-stat-value">{filteredEntries.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-2 mb-4">
        {DAYS.map((day) => (
          <div className="col-6 col-sm-4 col-lg" key={day}>
            <button
              type="button"
              className={`tm-day w-100 ${selectedDay === day ? "active" : ""}`}
              onClick={() =>
                setSelectedDay(selectedDay === day ? "All" : day)
              }
            >
              <div className="small">{day}</div>
              <strong>{dayCounts[day]}</strong>
            </button>
          </div>
        ))}
      </div>

      <div className="tm-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search" />
              </span>
              <input
                className="form-control"
                placeholder="Search course, semester, subject, faculty..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={selectedDay}
              onChange={(event) => setSelectedDay(event.target.value)}
            >
              <option value="All">All days</option>
              {DAYS.map((day) => (
                <option value={day} key={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <section className="tm-card overflow-hidden">
        <div className="p-3 p-md-4 border-bottom d-flex justify-content-between align-items-center gap-3">
          <div>
            <h5 className="fw-bold mb-1">Weekly Schedule</h5>
            <div className="tm-muted small">
              Classes ordered by day and start time
            </div>
          </div>
          <span className="badge text-bg-light">
            {filteredEntries.length} entries
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="tm-muted mt-3 mb-0">Loading timetable...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div className="tm-stat-icon mx-auto mb-3">
              <i className="bi bi-calendar-x" />
            </div>
            <h6 className="fw-bold">No timetable entries found</h6>
            <p className="tm-muted small">
              Add a timetable entry or change your search filters.
            </p>
            <button
              className="btn btn-primary btn-sm me-2"
              onClick={openAddForm}
            >
              <i className="bi bi-plus-lg me-1" />
              Add First Entry
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearch("");
                setSelectedDay("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEntries.map((item, index) => {
                  const id = getId(item);

                  return (
                    <tr key={id ?? index}>
                      <td>
                        <span className="badge text-bg-primary">
                          {getDay(item) || "—"}
                        </span>
                      </td>

                      <td className="text-nowrap">
                        <div className="fw-semibold">
                          {formatTime(item.startTime)}
                        </div>
                        <div className="tm-muted small">
                          to {formatTime(item.endTime)}
                        </div>
                      </td>

                      <td>{getCourseName(item)}</td>
                      <td>{getSemesterName(item)}</td>
                      <td className="fw-semibold">{getSubjectName(item)}</td>
                      <td>{getFacultyName(item)}</td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Edit timetable"
                            onClick={() => openEditForm(item)}
                          >
                            <i className="bi bi-pencil-square" />
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete timetable"
                            onClick={() => setDeleteId(id)}
                            disabled={id == null}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="tm-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="tm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="timetableFormTitle"
          >
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1" id="timetableFormTitle">
                  {editingId != null ? "Edit Timetable Entry" : "Add Timetable Entry"}
                </h5>
                <p className="tm-muted small mb-0">
                  Enter the class details below.
                </p>
              </div>

              <button
                className="btn-close"
                aria-label="Close"
                disabled={saving}
                onClick={() => setShowForm(false)}
              />
            </div>

            <form onSubmit={saveEntry}>
              <div className="p-4">
                <div className="row g-3">
                  {[
                    ["courseId", "Course ID"],
                    ["semesterId", "Semester ID"],
                    ["subjectId", "Subject ID"],
                    ["facultyId", "Faculty ID"],
                  ].map(([name, label]) => (
                    <div className="col-12 col-sm-6" key={name}>
                      <label className="form-label tm-form-label" htmlFor={name}>
                        {label}
                      </label>
                      <input
                        id={name}
                        name={name}
                        type="number"
                        min="1"
                        step="1"
                        className="form-control"
                        value={form[name]}
                        onChange={updateField}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        required
                      />
                    </div>
                  ))}

                  <div className="col-12 col-sm-6">
                    <label className="form-label tm-form-label" htmlFor="day">
                      Day
                    </label>
                    <select
                      id="day"
                      name="day"
                      className="form-select"
                      value={form.day}
                      onChange={updateField}
                      required
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label tm-form-label" htmlFor="startTime">
                      Start Time
                    </label>
                    <input
                      id="startTime"
                      name="startTime"
                      type="time"
                      className="form-control"
                      value={form.startTime}
                      onChange={updateField}
                      required
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label tm-form-label" htmlFor="endTime">
                      End Time
                    </label>
                    <input
                      id="endTime"
                      name="endTime"
                      type="time"
                      className="form-control"
                      value={form.endTime}
                      onChange={updateField}
                      required
                    />
                  </div>
                </div>

                <div className="alert alert-info small mt-4 mb-0">
                  Enter the database IDs for the selected course, semester,
                  subject, and faculty. These IDs must refer to existing records.
                </div>
              </div>

              <div className="p-3 border-top d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2 me-1" />
                      {editingId != null ? "Update Entry" : "Save Entry"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="tm-modal-backdrop">
          <div className="tm-modal p-4" style={{ maxWidth: 420 }}>
            <div className="tm-stat-icon mb-3">
              <i className="bi bi-trash" />
            </div>
            <h5 className="fw-bold">Delete timetable entry?</h5>
            <p className="tm-muted">
              This action will permanently remove this schedule entry.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-light"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => deleteEntry(deleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
