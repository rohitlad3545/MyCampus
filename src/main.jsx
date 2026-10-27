
/* eslint-disable react-refresh/only-export-components */

import React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  NavLink,
} from "react-router-dom";

// Public components
import Home from "./common_component/Home.jsx";
import Login from "./common_component/Login.jsx";
import Register from "./common_component/Register.jsx";

// Admin components
import AdminNavbar from "./admin_component/AdminNavbar.jsx";
import AdminDashboard from "./admin_component/AdminDashboard.jsx";
import StudentManagement from "./admin_component/StudentManagement.jsx";
import FacultyManagement from "./admin_component/FacultyManagement.jsx";
import DepartmentManagement from "./admin_component/DepartmentManagement.jsx";
import CourseManagement from "./admin_component/CourseManagement.jsx";
import ExamManagement from "./admin_component/ExamManagement.jsx";
import AttendanceManagement from "./admin_component/AttendanceManagement.jsx";
import SubjectManagement from "./admin_component/SubjectManagement.jsx";
import SemesterManagement from "./admin_component/SemesterManagement.jsx";
import AcademicYearManagement from "./admin_component/AcademicYearManagement.jsx";
import FeeStructureManagement from "./admin_component/FeeStructureManagement.jsx";

// Faculty components
import AssignmentManagement from "./faculty_component/AssignmentManagement.jsx";
import FacultyHome from "./faculty_component/FacultyHome.jsx";
import FacultyDashboard from "./faculty_component/FacultyDashboard.jsx";
import FacultyAttendance from "./faculty_component/FacultyAttendance.jsx";
import FacultySubjects from "./faculty_component/FacultySubjects.jsx";

// HOD components
import HODDashboard from "./hod_component/HODDashboard.jsx";
import HODExamManagement from "./hod_component/HODExamManagement.jsx";
import HODStudentManagement from "./hod_component/HODStudentManagement.jsx";
import HODFacultyManagement from "./hod_component/HODFacultyManagement.jsx";
import HODSubjectManagement from "./hod_component/HODSubjectManagement.jsx";
import HODTimetableManagement from "./hod_component/HODTimetableManagement.jsx";
import HODAnnouncementManagement from "./hod_component/HODAnnouncementManagement.jsx";

// Student components
import StudentHome from "./student_component/StudentHome.jsx";
import StudentDashboard from "./student_component/StudentDashboard.jsx";
import StudentProfile from "./student_component/StudentProfile.jsx";
import StudentAttendance from "./student_component/StudentAttendance.jsx";
import StudentAssignments from "./student_component/StudentAssignments.jsx";
import StudentResults from "./student_component/StudentResults.jsx";
import StudentExams from "./student_component/StudentExams.jsx";
import StudentTimetable from "./student_component/StudentTimetable.jsx";
import StudentAnnouncements from "./student_component/StudentAnnouncements.jsx";
import StudentFees from "./student_component/StudentFees.jsx";

// Context and notifications
import LoggedInUserProvider from "./project_context/LoggedInUserContext.jsx";
import { Bounce, ToastContainer } from "react-toastify";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "react-toastify/dist/ReactToastify.css";
import StudentFeePayment from "./student_component/StudentFeePayment.jsx";

// HOD layout
function HODHome() {
  const hodLinks = [
    {
      label: "Dashboard",
      path: "/hod",
      icon: "bi-grid-1x2",
      end: true,
    },
    {
      label: "Students",
      path: "/hod/students",
      icon: "bi-people",
    },
    {
      label: "Faculty",
      path: "/hod/faculty",
      icon: "bi-person-workspace",
    },
    {
      label: "Subjects",
      path: "/hod/subjects",
      icon: "bi-book",
    },
    {
      label: "Exams",
      path: "/hod/exams",
      icon: "bi-journal-check",
    },
    {
      label: "Announcements",
      path: "/hod/announcements",
      icon: "bi-megaphone",
    },
    {
      label: "Timetable",
      path: "/hod/timetable",
      icon: "bi-calendar-week",
    },
  ];

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <style>{`
        .hod-navbar {
          background: linear-gradient(110deg, #1747b5, #2563eb);
          position: sticky;
          top: 0;
          z-index: 1030;
        }

        .hod-brand {
          color: white !important;
          font-weight: 800;
          font-size: 1.2rem;
          white-space: nowrap;
        }

        .hod-nav-link {
          color: rgba(255,255,255,.9) !important;
          padding: 9px 12px !important;
          margin: 3px;
          border-radius: 9px;
          font-size: .9rem;
          white-space: nowrap;
        }

        .hod-nav-link:hover {
          background: rgba(255,255,255,.14);
          color: #fff !important;
        }

        .hod-nav-link.active {
          color: #1747b5 !important;
          background: #fff;
          font-weight: 600;
        }

        .hod-content {
          flex: 1;
          width: 100%;
        }

        @media (max-width: 991.98px) {
          .hod-navbar .navbar-collapse {
            padding: 12px 0;
            max-height: 75vh;
            overflow-y: auto;
          }

          .hod-nav-link {
            margin: 3px 0;
          }
        }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-dark hod-navbar shadow-sm">
        <div className="container-fluid px-3 px-lg-4">
          <Link to="/hod" className="navbar-brand hod-brand">
            <i className="bi bi-mortarboard-fill me-2" />
            MyCampus
            <span className="badge bg-light text-primary ms-2">
              HOD
            </span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#hodNavigation"
            aria-controls="hodNavigation"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className="collapse navbar-collapse"
            id="hodNavigation"
          >
            <ul className="navbar-nav ms-auto align-items-lg-center">
              {hodLinks.map((item) => (
                <li className="nav-item" key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `nav-link hod-nav-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <i className={`bi ${item.icon} me-1`} />
                    {item.label}
                  </NavLink>
                </li>
              ))}

              <li className="nav-item ms-lg-2">
                <Link
                  to="/"
                  className="btn btn-outline-light btn-sm px-3 mt-2 mt-lg-0"
                >
                  <i className="bi bi-house-door me-1" />
                  Public Home
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="hod-content container-fluid px-3 px-lg-4 py-4">
        <Outlet />
      </main>

      <footer className="text-center text-muted py-3 small border-top bg-white">
        © {new Date().getFullYear()} MyCampus College Management Portal
      </footer>
    </div>
  );
}

// Application routes
const projectRoutes = createBrowserRouter([
  // Public homepage
  {
    path: "/",
    element: <Home />,
  },

  // Authentication
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // Admin
  {
    path: "/admin",
    element: <AdminNavbar />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "students", element: <StudentManagement /> },
      { path: "faculty", element: <FacultyManagement /> },
      { path: "departments", element: <DepartmentManagement /> },
      { path: "courses", element: <CourseManagement /> },
      { path: "exams", element: <ExamManagement /> },
      { path: "attendance", element: <AttendanceManagement /> },
      { path: "subjects", element: <SubjectManagement /> },
      { path: "semesters", element: <SemesterManagement /> },
      {
        path: "academic-years",
        element: <AcademicYearManagement />,
      },
      {
        path: "fee-structures",
        element: <FeeStructureManagement />,
      },
    ],
  },

  // Faculty
  {
    path: "/faculty",
    element: <FacultyHome />,
    children: [
      { index: true, element: <FacultyDashboard /> },
      { path: "assignments", element: <AssignmentManagement /> },
      { path: "attendance", element: <FacultyAttendance /> },
      { path: "subjects", element: <FacultySubjects /> },
    ],
  },

  // HOD
  {
    path: "/hod",
    element: <HODHome />,
    children: [
      { index: true, element: <HODDashboard /> },
      { path: "exams", element: <HODExamManagement /> },
      { path: "students", element: <HODStudentManagement /> },
      { path: "faculty", element: <HODFacultyManagement /> },
      { path: "subjects", element: <HODSubjectManagement /> },
      {
        path: "announcements",
        element: <HODAnnouncementManagement />,
      },
      {
        path: "timetable",
        element: <HODTimetableManagement />,
      },
    ],
  },

  // Student
  {
    path: "/student",
    element: <StudentHome />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: "profile", element: <StudentProfile /> },
      { path: "attendance", element: <StudentAttendance /> },
      { path: "assignments", element: <StudentAssignments /> },
      { path: "results", element: <StudentResults /> },
      { path: "exams", element: <StudentExams /> },
      { path: "timetable", element: <StudentTimetable /> },
      {
        path: "announcements",
        element: <StudentAnnouncements />,
      },
      { path: "fees", element: <StudentFees /> },
      { path: "studentfees", element: <StudentFeePayment /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoggedInUserProvider>
      <RouterProvider router={projectRoutes} />

      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </LoggedInUserProvider>
  </React.StrictMode>
);
