import { Outlet } from "react-router-dom";
import FacultyNavbar from "./FacultyNavbar.jsx";

export default function FacultyHome() {
  return (
    <div className="min-vh-100 bg-light">
      <FacultyNavbar />

      <main className="container-fluid px-3 px-lg-4 py-4">
        <Outlet />
      </main>

      <footer className="text-center text-muted py-3 small">
        © {new Date().getFullYear()} MyCampus College Management Portal
      </footer>
    </div>
  );
}