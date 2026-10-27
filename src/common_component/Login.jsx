
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function Login() {
    const navigateTo = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    async function collectFormData(formData) {
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const responseObject = await response.json();

            if (!response.ok) {
                toast.error(
                    responseObject.message ||
                    "Invalid username or password"
                );
                return;
            }

            if (!responseObject.data) {
                toast.error("Login data was not received");
                return;
            }

            const loggedInUser = responseObject.data;

            if (!loggedInUser.jwtToken || !loggedInUser.role) {
                toast.error("Login response is missing token or role");
                return;
            }

            // Save authentication data
            localStorage.setItem(
                "userData",
                JSON.stringify(loggedInUser)
            );
            localStorage.setItem("jwtToken", loggedInUser.jwtToken);
            localStorage.setItem("role", loggedInUser.role);
            localStorage.setItem("id", loggedInUser.id);

            toast.success(
                responseObject.message || "Login successful!"
            );

            // Redirect based on the existing user role
            const roleRoutes = {
                STUDENT: "/student",
                FACULTY: "/faculty",
                ADMIN: "/admin",
                HOD: "/hod"
            };

            const destination = roleRoutes[loggedInUser.role];

            if (!destination) {
                toast.error("Unknown user role");
                return;
            }

            setTimeout(() => {
                navigateTo(destination);
            }, 700);

        } catch (error) {
            console.error("Login error:", error);
            toast.error("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mc-login-page">
            <style>{`
                * {
                    box-sizing: border-box;
                }

                .mc-login-page {
                    min-height: 100vh;
                    color: #172746;
                    font-family: "Segoe UI", Arial, sans-serif;
                    background: #f3f7ff;
                }

                .mc-login-page a {
                    text-decoration: none;
                }

                /* NAVBAR */

                .mc-navbar {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: rgba(255,255,255,.97);
                    border-bottom: 1px solid #e4ebf6;
                    box-shadow: 0 3px 15px rgba(20,50,100,.04);
                }

                .mc-navbar-inner {
                    max-width: 1500px;
                    min-height: 72px;
                    margin: auto;
                    padding: 12px 25px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 18px;
                }

                .mc-brand {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #122951;
                    font-size: 23px;
                    font-weight: 800;
                    white-space: nowrap;
                }

                .mc-brand:hover {
                    color: #1264f5;
                }

                .mc-brand-icon {
                    color: #1264f5;
                    font-size: 27px;
                }

                .mc-nav-links {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .mc-nav-link {
                    padding: 10px 9px;
                    color: #52617d;
                    font-size: 12px;
                    white-space: nowrap;
                    border-radius: 8px;
                    transition: .2s;
                }

                .mc-nav-link:hover,
                .mc-nav-link.active {
                    color: #1264f5;
                    background: #eaf1ff;
                }

                .mc-nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .mc-admin-link,
                .mc-student-link {
                    padding: 11px 13px;
                    border: 1px solid #d4deef;
                    border-radius: 9px;
                    font-size: 12px;
                    font-weight: 650;
                    white-space: nowrap;
                    transition: .2s;
                }

                .mc-admin-link {
                    color: #17325c;
                    background: white;
                }

                .mc-admin-link:hover {
                    background: #f2f6ff;
                    border-color: #1264f5;
                }

                .mc-student-link {
                    color: white;
                    background: #1264f5;
                    border-color: #1264f5;
                }

                .mc-student-link:hover {
                    color: white;
                    background: #084bc9;
                }

                /* MAIN BACKGROUND */

                .mc-auth-background {
                    position: relative;
                    min-height: calc(100vh - 126px);
                    padding: 55px 6%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background:
                        radial-gradient(
                            circle at 10% 20%,
                            rgba(69,130,255,.15),
                            transparent 30%
                        ),
                        radial-gradient(
                            circle at 90% 80%,
                            rgba(112,99,255,.11),
                            transparent 30%
                        ),
                        linear-gradient(135deg,#f8faff,#edf3ff);
                }

                .mc-login-layout {
                    width: 100%;
                    max-width: 1120px;
                    display: grid;
                    grid-template-columns:
                        minmax(0,1fr) minmax(350px,440px);
                    align-items: center;
                    gap: 60px;
                    animation: mc-login-appear .4s ease both;
                }

                @keyframes mc-login-appear {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* WELCOME PANEL */

                .mc-welcome-panel {
                    padding: 20px 0;
                }

                .mc-welcome-tag {
                    color: #1264f5;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 2px;
                }

                .mc-welcome-panel h1 {
                    margin: 20px 0;
                    color: #152849;
                    font-size: clamp(38px,5vw,60px);
                    line-height: 1.12;
                    letter-spacing: -2px;
                    font-weight: 800;
                }

                .mc-welcome-panel h1 span {
                    color: #1264f5;
                }

                .mc-welcome-panel > p {
                    max-width: 470px;
                    color: #687994;
                    font-size: 15px;
                    line-height: 1.9;
                }

                .mc-feature-list {
                    display: grid;
                    gap: 16px;
                    margin-top: 30px;
                }

                .mc-feature {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #40516f;
                    font-size: 14px;
                }

                .mc-feature-icon {
                    width: 25px;
                    height: 25px;
                    flex-shrink: 0;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #1264f5;
                    background: #e2ecff;
                    border-radius: 50%;
                    font-weight: 800;
                }

                /* LOGIN CARD */

                .mc-login-card {
                    width: 100%;
                    padding: 35px 34px 25px;
                    background: white;
                    border: 1px solid #e3eaf5;
                    border-radius: 22px;
                    box-shadow: 0 24px 65px rgba(29,60,115,.12);
                }

                .mc-login-logo {
                    width: 58px;
                    height: 58px;
                    margin: 0 auto 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    background: linear-gradient(135deg,#3984ff,#0750e8);
                    border-radius: 17px;
                    box-shadow: 0 8px 22px rgba(18,100,245,.22);
                    font-size: 30px;
                }

                .mc-card-heading {
                    margin-bottom: 27px;
                    text-align: center;
                }

                .mc-card-eyebrow {
                    color: #1264f5;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 2px;
                }

                .mc-card-heading h2 {
                    margin: 10px 0 8px;
                    color: #172746;
                    font-size: 27px;
                    font-weight: 750;
                    letter-spacing: -.7px;
                }

                .mc-card-heading p {
                    margin: 0;
                    color: #7b89a0;
                    font-size: 13px;
                    line-height: 1.6;
                }

                /* FORM */

                .mc-field {
                    margin-bottom: 21px;
                }

                .mc-field label {
                    display: block;
                    margin-bottom: 8px;
                    color: #293b59;
                    font-size: 13px;
                    font-weight: 650;
                }

                .mc-input-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .mc-input-symbol {
                    position: absolute;
                    left: 15px;
                    color: #8796ad;
                    font-size: 18px;
                    pointer-events: none;
                }

                .mc-input-box input {
                    width: 100%;
                    min-width: 0;
                    height: 49px;
                    padding: 0 55px 0 43px;
                    color: #172746;
                    background: #fbfcff;
                    border: 1px solid #dce4f0;
                    border-radius: 10px;
                    outline: none;
                    font-size: 13px;
                    transition: .2s;
                }

                .mc-input-box input:focus {
                    background: white;
                    border-color: #1264f5;
                    box-shadow: 0 0 0 4px rgba(18,100,245,.09);
                }

                .mc-input-box input::placeholder {
                    color: #a0aec2;
                }

                .mc-show-password {
                    position: absolute;
                    right: 12px;
                    padding: 5px;
                    color: #1264f5;
                    background: transparent;
                    border: none;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .mc-error {
                    margin: 6px 0 0;
                    color: #dc3545;
                    font-size: 12px;
                }

                .mc-login-button {
                    width: 100%;
                    min-height: 49px;
                    margin-top: 4px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    color: white;
                    background: #1264f5;
                    border: 1px solid #1264f5;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: .2s;
                }

                .mc-login-button:hover:not(:disabled) {
                    background: #084bc9;
                    box-shadow: 0 7px 18px rgba(18,100,245,.2);
                    transform: translateY(-1px);
                }

                .mc-login-button:disabled {
                    opacity: .7;
                    cursor: not-allowed;
                }

                .mc-register-prompt {
                    margin-top: 23px;
                    color: #74829a;
                    text-align: center;
                    font-size: 13px;
                }

                .mc-register-prompt a {
                    margin-left: 4px;
                    color: #1264f5;
                    font-weight: 750;
                }

                .mc-register-prompt a:hover {
                    text-decoration: underline;
                }

                .mc-security-note {
                    margin-top: 25px;
                    padding-top: 17px;
                    color: #9aa6ba;
                    border-top: 1px solid #edf1f7;
                    text-align: center;
                    font-size: 11px;
                    line-height: 1.6;
                }

                /* FOOTER */

                .mc-footer {
                    min-height: 54px;
                    padding: 15px 25px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    color: #7c8ba3;
                    background: white;
                    border-top: 1px solid #e8edf5;
                    font-size: 11px;
                }

                /* RESPONSIVE */

                @media(max-width:1200px) {
                    .mc-navbar-inner {
                        flex-wrap: wrap;
                    }

                    .mc-nav-links {
                        order: 3;
                        width: 100%;
                        overflow-x: auto;
                        padding-bottom: 3px;
                    }

                    .mc-nav-link {
                        flex-shrink: 0;
                    }

                    .mc-login-layout {
                        gap: 32px;
                    }
                }

                @media(max-width:800px) {
                    .mc-auth-background {
                        min-height: auto;
                        padding: 35px 18px;
                    }

                    .mc-login-layout {
                        max-width: 470px;
                        grid-template-columns: 1fr;
                        gap: 26px;
                    }

                    .mc-welcome-panel {
                        padding: 0;
                        text-align: center;
                    }

                    .mc-welcome-panel h1 {
                        margin: 14px 0;
                        font-size: 39px;
                    }

                    .mc-welcome-panel > p {
                        margin: auto;
                        font-size: 14px;
                    }

                    .mc-feature-list {
                        display: none;
                    }

                    .mc-login-card {
                        padding: 30px 24px 23px;
                    }
                }

                @media(max-width:480px) {
                    .mc-navbar-inner {
                        padding: 12px 14px;
                        gap: 12px;
                    }

                    .mc-brand {
                        font-size: 20px;
                    }

                    .mc-nav-actions {
                        gap: 6px;
                    }

                    .mc-admin-link,
                    .mc-student-link {
                        padding: 9px;
                        font-size: 10px;
                    }

                    .mc-nav-links {
                        gap: 0;
                    }

                    .mc-nav-link {
                        padding: 9px;
                        font-size: 11px;
                    }

                    .mc-auth-background {
                        padding: 27px 13px;
                    }

                    .mc-welcome-panel h1 {
                        font-size: 33px;
                        letter-spacing: -1px;
                    }

                    .mc-login-card {
                        padding: 26px 19px 21px;
                        border-radius: 17px;
                    }

                    .mc-card-heading h2 {
                        font-size: 24px;
                    }

                    .mc-footer {
                        padding: 13px 14px;
                        font-size: 10px;
                    }
                }
            `}</style>

            {/* NAVBAR */}
            <header className="mc-navbar">
                <div className="mc-navbar-inner">
                    <Link to="/" className="mc-brand">
                        <span className="mc-brand-icon">🎓</span>
                        MyCampus
                    </Link>

                    <nav className="mc-nav-links">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `mc-nav-link ${isActive ? "active" : ""}`
                            }
                        >
                            Home
                        </NavLink>

                        <a href="/#about" className="mc-nav-link">About</a>
                        <a href="/#academics" className="mc-nav-link">Academics</a>
                        <a href="/#facilities" className="mc-nav-link">Facilities</a>
                        <a href="/#campus-life" className="mc-nav-link">Campus Life</a>
                        <a href="/#gallery" className="mc-nav-link">Gallery</a>
                        <a href="/#contact" className="mc-nav-link">Contact</a>
                    </nav>

                    <div className="mc-nav-actions">
                        <Link to="/admin" className="mc-admin-link">
                            Admin Login
                        </Link>
                        <Link to="/login" className="mc-student-link">
                            🎓 Student Login
                        </Link>
                    </div>
                </div>
            </header>

            {/* LOGIN CONTENT */}
            <main className="mc-auth-background">
                <section className="mc-login-layout">
                    <div className="mc-welcome-panel">
                        <span className="mc-welcome-tag">
                            YOUR CAMPUS, CONNECTED
                        </span>

                        <h1>
                            Welcome to
                            <br />
                            <span>MyCampus.</span>
                        </h1>

                        <p>
                            Your campus journey starts here. Sign in to
                            access your academic information and campus
                            services in one place.
                        </p>

                        <div className="mc-feature-list">
                            <div className="mc-feature">
                                <span className="mc-feature-icon">✓</span>
                                Easy access to campus resources
                            </div>
                            <div className="mc-feature">
                                <span className="mc-feature-icon">✓</span>
                                Manage your academic activities
                            </div>
                            <div className="mc-feature">
                                <span className="mc-feature-icon">✓</span>
                                A simple login experience
                            </div>
                        </div>
                    </div>

                    <section className="mc-login-card">
                        <div className="mc-login-logo">🎓</div>

                        <div className="mc-card-heading">
                            <span className="mc-card-eyebrow">
                                ACCOUNT ACCESS
                            </span>
                            <h2>Login to MyCampus</h2>
                            <p>Enter your credentials to continue.</p>
                        </div>

                        <form onSubmit={handleSubmit(collectFormData)}>
                            <div className="mc-field">
                                <label htmlFor="username">Username</label>

                                <div className="mc-input-box">
                                    <span className="mc-input-symbol">♙</span>
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        {...register("username", {
                                            required: "Username is required",
                                            minLength: {
                                                value: 3,
                                                message:
                                                    "Username must have at least 3 characters"
                                            }
                                        })}
                                    />
                                </div>

                                {errors.username && (
                                    <p className="mc-error">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="mc-field">
                                <label htmlFor="password">Password</label>

                                <div className="mc-input-box">
                                    <span className="mc-input-symbol">♙</span>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        {...register("password", {
                                            required: "Password is required"
                                        })}
                                    />

                                    <button
                                        type="button"
                                        className="mc-show-password"
                                        onClick={() =>
                                            setShowPassword(value => !value)
                                        }
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="mc-error">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="mc-login-button"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Login to your account"}
                                {!loading && <span>→</span>}
                            </button>
                        </form>

                        <div className="mc-register-prompt">
                            Don't have an account?
                            <Link to="/register"> Register</Link>
                        </div>

                        <div className="mc-security-note">
                            College Management System · MyCampus
                        </div>
                    </section>
                </section>
            </main>

            <footer className="mc-footer">
                <span>© {new Date().getFullYear()} MyCampus</span>
                <span>College Management System</span>
            </footer>
        </div>
    );
}
