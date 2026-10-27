/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useCallback, useEffect, useMemo, useState } from "react";

const API = "http://localhost:8080/api/v1/hod/announcements";

const EMPTY_FORM = {
  title: "",
  message: "",
};

function extractList(body) {
  const data = body?.data?.data ?? body?.data ?? body;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.announcements)) return data.announcements;

  return [];
}

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    throw new Error("Please log in again to manage announcements.");
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
    throw new Error(
      body?.message ||
        body?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return body;
}

function getTitle(item) {
  return item.title || item.heading || item.subject || "Untitled announcement";
}

function getMessage(item) {
  return item.message || item.content || item.description || "";
}

function getAnnouncementId(item) {
  return item.id ?? item.announcementId;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HODAnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const body = await apiRequest("/all");
      setAnnouncements(extractList(body));
    } catch (err) {
      setError(err.message || "Unable to load announcements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...announcements]
      .filter((item) =>
        `${getTitle(item)} ${getMessage(item)}`
          .toLowerCase()
          .includes(query)
      )
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.publishedAt || a.date || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || b.publishedAt || b.date || 0
        ).getTime();

        return dateB - dateA;
      });
  }, [announcements, search]);

  function openAddForm() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(getAnnouncementId(item));
    setForm({
      title: getTitle(item) === "Untitled announcement" ? "" : getTitle(item),
      message: getMessage(item),
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const title = form.title.trim();
    const message = form.message.trim();

    if (!title || !message) {
      setError("Please enter both an announcement title and message.");
      return;
    }

    const payload = { title, message };
    setSaving(true);

    try {
      if (editingId != null) {
        await apiRequest(`/update/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setNotice("Announcement updated successfully.");
      } else {
        await apiRequest("/add", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setNotice("Announcement added successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });

      await loadAnnouncements();
    } catch (err) {
      setError(err.message || "Unable to save the announcement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const id = getAnnouncementId(deleteItem);

    if (id == null) {
      setError("This announcement has no ID and cannot be deleted.");
      setDeleteItem(null);
      return;
    }

    setError("");
    setNotice("");

    try {
      await apiRequest(`/delete/${id}`, {
        method: "DELETE",
      });

      setDeleteItem(null);
      setNotice("Announcement deleted successfully.");

      await loadAnnouncements();
    } catch (err) {
      setError(err.message || "Unable to delete the announcement.");
    }
  }

  return (
    <div className="container-fluid px-0 announcement-page">
      <style>{`
        .announcement-page {
          color: #1c2e50;
        }

        .announcement-page .announcement-card {
          background: #fff;
          border: 1px solid #e8edf5;
          border-radius: 16px;
          box-shadow: 0 5px 18px rgba(26,55,100,.045);
        }

        .announcement-page .announcement-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #fff1d6;
          color: #d97706;
          font-size: 1.3rem;
        }

        .announcement-page .announcement-muted {
          color: #718096;
        }

        .announcement-page .announcement-item {
          padding: 22px;
          border-bottom: 1px solid #edf1f7;
        }

        .announcement-page .announcement-item:last-child {
          border-bottom: 0;
        }

        .announcement-page .announcement-message {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          line-height: 1.7;
        }

        .announcement-page .announcement-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(15,23,42,.55);
          overflow-y: auto;
        }

        .announcement-page .announcement-modal {
          width: 100%;
          max-width: 620px;
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 18px;
          background: white;
          box-shadow: 0 20px 60px rgba(0,0,0,.2);
        }

        @media (max-width: 575px) {
          .announcement-page .announcement-item {
            padding: 16px;
          }
        }
      `}</style>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="text-primary fw-bold small mb-2">
            HOD / DEPARTMENT ADMINISTRATION
          </div>

          <h2 className="fw-bold mb-1">
            Announcement Management
          </h2>

          <p className="announcement-muted mb-0">
            Create and manage important updates for your department.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary rounded-3"
            onClick={loadAnnouncements}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2" />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary rounded-3"
            onClick={openAddForm}
          >
            <i className="bi bi-plus-lg me-2" />
            Add Announcement
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3">
          <i className="bi bi-exclamation-triangle-fill me-2" />
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
          <i className="bi bi-check-circle-fill me-2" />
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
        <div className="col-12 col-md-6">
          <div className="announcement-card p-3 d-flex align-items-center gap-3 h-100">
            <div className="announcement-icon">
              <i className="bi bi-megaphone-fill" />
            </div>
            <div>
              <div className="announcement-muted small">
                Total Announcements
              </div>
              <div className="fs-3 fw-bold">
                {loading ? "—" : announcements.length}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="announcement-card p-3 d-flex align-items-center gap-3 h-100">
            <div
              className="announcement-icon"
              style={{ background: "#e5f7eb", color: "#15803d" }}
            >
              <i className="bi bi-search" />
            </div>
            <div>
              <div className="announcement-muted small">
                Matching Announcements
              </div>
              <div className="fs-3 fw-bold">
                {filteredAnnouncements.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="announcement-card p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search" />
          </span>

          <input
            type="search"
            className="form-control"
            placeholder="Search announcements by title or message..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <section className="announcement-card overflow-hidden">
        <div className="p-3 p-md-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 className="fw-bold mb-1">
              Department Announcements
            </h5>
            <p className="announcement-muted small mb-0">
              Updates managed by the Head of Department.
            </p>
          </div>

          <span className="badge text-bg-light">
            {filteredAnnouncements.length} announcements
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="announcement-muted mt-3 mb-0">
              Loading announcements...
            </p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div className="announcement-icon mx-auto mb-3">
              <i className="bi bi-megaphone" />
            </div>

            <h5 className="fw-bold">
              {search ? "No matching announcements" : "No announcements yet"}
            </h5>

            <p className="announcement-muted mb-3">
              {search
                ? "Try another search term."
                : "Create an announcement to share important information with your department."}
            </p>

            {search ? (
              <button
                className="btn btn-outline-primary"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={openAddForm}
              >
                <i className="bi bi-plus-lg me-2" />
                Create First Announcement
              </button>
            )}
          </div>
        ) : (
          filteredAnnouncements.map((item, index) => {
            const id = getAnnouncementId(item);
            const date =
              item.createdAt ||
              item.publishedAt ||
              item.date;

            return (
              <article
                className="announcement-item"
                key={id ?? index}
              >
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                  <div className="d-flex gap-3 flex-grow-1">
                    <div className="announcement-icon">
                      <i className="bi bi-megaphone-fill" />
                    </div>

                    <div className="flex-grow-1">
                      <h5 className="fw-bold mb-2">
                        {getTitle(item)}
                      </h5>

                      <div className="announcement-muted small mb-3">
                        <i className="bi bi-clock me-2" />
                        {formatDate(date)}
                      </div>

                      <p className="announcement-message mb-0">
                        {getMessage(item)}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      title="Edit announcement"
                      onClick={() => openEditForm(item)}
                    >
                      <i className="bi bi-pencil-square me-1" />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      title="Delete announcement"
                      disabled={id == null}
                      onClick={() => setDeleteItem(item)}
                    >
                      <i className="bi bi-trash me-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {showForm && (
        <div
          className="announcement-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="announcement-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcementFormTitle"
          >
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5
                  id="announcementFormTitle"
                  className="fw-bold mb-1"
                >
                  {editingId != null
                    ? "Edit Announcement"
                    : "Create Announcement"}
                </h5>

                <p className="announcement-muted small mb-0">
                  Enter the information you want to share.
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                disabled={saving}
                onClick={() => setShowForm(false)}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-4">
                <div className="mb-3">
                  <label
                    htmlFor="announcementTitle"
                    className="form-label fw-semibold"
                  >
                    Announcement Title
                  </label>

                  <input
                    id="announcementTitle"
                    name="title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Internal examination schedule"
                    maxLength={200}
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="announcementMessage"
                    className="form-label fw-semibold"
                  >
                    Announcement Message
                  </label>

                  <textarea
                    id="announcementMessage"
                    name="message"
                    className="form-control"
                    rows={6}
                    maxLength={10000}
                    placeholder="Write your announcement here..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />

                  <div className="announcement-muted small text-end mt-1">
                    {form.message.length}/10000
                  </div>
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
                      {editingId != null ? "Update Announcement" : "Publish Announcement"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="announcement-modal-backdrop">
          <div
            className="announcement-modal p-4"
            style={{ maxWidth: 430 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="deleteAnnouncementTitle"
          >
            <div className="announcement-icon mb-3">
              <i className="bi bi-trash" />
            </div>

            <h5
              id="deleteAnnouncementTitle"
              className="fw-bold"
            >
              Delete this announcement?
            </h5>

            <p className="announcement-muted">
              Are you sure you want to delete "{getTitle(deleteItem)}"?
              This action cannot be undone.
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-light"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
