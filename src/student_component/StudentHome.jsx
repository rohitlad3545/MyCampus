import { Outlet } from "react-router-dom";
import StudentNavbar from "./StudentNavbar.jsx";

export default function StudentHome() {
  return (
    <div className="student-app">
      <style>{`
        .student-app {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          background: #f5f7fb;
          overflow-x: clip;
        }

        .student-main-content {
          flex: 1;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 24px;
          box-sizing: border-box;
        }

        .student-footer {
          width: 100%;
          padding: 16px 12px;
          text-align: center;
          color: #64748b;
          font-size: 0.82rem;
          background: #fff;
          border-top: 1px solid #e8edf5;
        }

        @media (max-width: 767.98px) {
          .student-main-content {
            padding: 16px 12px;
          }
        }
      `}</style>

      <StudentNavbar />

      <main className="student-main-content">
        <Outlet />
      </main>

      <footer className="student-footer">
        © {new Date().getFullYear()} MyCampus College Management Portal
      </footer>
    </div>
  );
}