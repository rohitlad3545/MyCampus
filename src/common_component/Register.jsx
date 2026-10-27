
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function Register() {
    const navigate = useNavigate();
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
                "http://localhost:8080/api/v1/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const responseText = await response.text();
            let result = {};

            if (responseText) {
                try {
                    result = JSON.parse(responseText);
                } catch {
                    toast.error("Invalid response from server");
                    return;
                }
            }

            if (!response.ok) {
                toast.error(
                    result.message ||
                    `Registration failed (${response.status})`
                );
                return;
            }

            toast.success(result.message || "Registration successful!");

            setTimeout(() => navigate("/login"), 1000);
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register-page">
            <style>{`
                * { box-sizing: border-box; }

                .register-page {
                    min-height: 100vh;
                    font-family: "Segoe UI", Arial, sans-serif;
                    color: #172746;
                    background: #f3f7ff;
                }

                .register-navbar {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: #fff;
                    border-bottom: 1px solid #e4ebf6;
                    box-shadow: 0 3px 15px rgba(20,50,100,.04);
                }

                .register-nav-inner {
                    max-width: 1500px;
                    min-height: 72px;
                    margin: auto;
                    padding: 12px 25px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 18px;
                }

                .register-brand {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #122951;
                    font-size: 23px;
                    font-weight: 800;
                    white-space: nowrap;
                    text-decoration: none;
                }

                .register-brand span { color: #1264f5; }

                .register-nav-links {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .register-nav-links a {
                    padding: 10px 9px;
                    color: #52617d;
                    font-size: 12px;
                    white-space: nowrap;
                    text-decoration: none;
                    border-radius: 8px;
                    transition: .2s;
                }

                .register-nav-links a:hover,
                .register-nav-links a.active {
                    color: #1264f5;
                    background: #eaf1ff;
                }

                .register-nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .register-nav-actions a {
                    padding: 11px 13px;
                    border: 1px solid #d4deef;
                    border-radius: 9px;
                    font-size: 12px;
                    font-weight: 650;
                    white-space: nowrap;
                    text-decoration: none;
                    transition: .2s;
                }

                .register-admin-link {
                    color: #17325c;
                    background: white;
                }

                .register-student-link {
                    color: white;
                    background: #1264f5;
                    border-color: #1264f5 !important;
                }

                .register-nav-actions a:hover {
                    opacity: .85;
                }

                .register-main {
                    position: relative;
                    min-height: calc(100vh - 126px);
                    padding: 48px 6%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background:
                        radial-gradient(circle at 10% 20%,
                            rgba(69,130,255,.15), transparent 30%),
                        radial-gradient(circle at 90% 80%,
                            rgba(112,99,255,.11), transparent 30%),
                        linear-gradient(135deg,#f8faff,#edf3ff);
                }

                .register-layout {
                    width: 100%;
                    max-width: 1120px;
                    display: grid;
                    grid-template-columns: minmax(0,1fr) minmax(350px,440px);
                    align-items: center;
                    gap: 60px;
                    animation: register-appear .4s ease both;
                }

                @keyframes register-appear {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .register-welcome-tag {
                    color: #1264f5;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 2px;
                }

                .register-welcome h1 {
                    margin: 20px 0;
                    color: #152849;
                    font-size: clamp(38px,5vw,60px);
                    line-height: 1.12;
                    letter-spacing: -2px;
                    font-weight: 800;
                }

                .register-welcome h1 span { color: #1264f5; }

                .register-welcome > p {
                    max-width: 470px;
                    color: #687994;
                    font-size: 15px;
                    line-height: 1.9;
                }

                .register-features {
                    display: grid;
                    gap: 16px;
                    margin-top: 30px;
                }

                .register-feature {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #40516f;
                    font-size: 14px;
                }

                .register-check {
                    width: 25px;
                    height: 25px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    border-radius: 50%;
                    color: #1264f5;
                    background: #e2ecff;
                    font-weight: 800;
                }

                .register-card {
                    width: 100%;
                    padding: 32px 34px 25px;
                    background: white;
                    border: 1px solid #e3eaf5;
                    border-radius: 22px;
                    box-shadow: 0 24px 65px rgba(29,60,115,.12);
                }

                .register-logo {
                    width: 58px;
                    height: 58px;
                    margin: 0 auto 17px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    background: linear-gradient(135deg,#3984ff,#0750e8);
                    border-radius: 17px;
                    box-shadow: 0 8px 22px rgba(18,100,245,.22);
                    font-size: 30px;
                }

                .register-card-heading {
                    margin-bottom: 24px;
                    text-align: center;
                }

                .register-card-heading small {
                    color: #1264f5;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 2px;
                }

                .register-card-heading h2 {
                    margin: 10px 0 8px;
                    color: #172746;
                    font-size: 27px;
                    font-weight: 750;
                    letter-spacing: -.7px;
                }

                .register-card-heading p {
                    margin: 0;
                    color: #7b89a0;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .register-field { margin-bottom: 17px; }

                .register-field label {
                    display: block;
                    margin-bottom: 8px;
                    color: #293b59;
                    font-size: 13px;
                    font-weight: 650;
                }

                .register-input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .register-input-wrap input,
                .register-input-wrap select {
                    width: 100%;
                    min-width: 0;
                    height: 48px;
                    padding: 0 48px 0 15px;
                    color: #172746;
                    background: #fbfcff;
                    border: 1px solid #dce4f0;
                    border-radius: 10px;
                    outline: none;
                    font-family: inherit;
                    font-size: 13px;
                    transition: .2s;
                }

                .register-input-wrap input:focus,
                .register-input-wrap select:focus {
                    background: white;
                    border-color: #1264f5;
                    box-shadow: 0 0 0 4px rgba(18,100,245,.09);
                }

                .register-input-wrap input::placeholder {
                    color: #a0aec2;
                }

                .register-show-password {
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

                .register-error {
                    margin: 6px 0 0;
                    color: #dc3545;
                    font-size: 12px;
                }

                .register-submit {
                    width: 100%;
                    min-height: 49px;
                    margin-top: 5px;
                    padding: 12px 15px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    color: white;
                    background: #1264f5;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: .2s;
                }

                .register-submit:hover:not(:disabled) {
                    background: #084bc9;
                    transform: translateY(-1px);
                    box-shadow: 0 7px 18px rgba(18,100,245,.2);
                }

                .register-submit:disabled {
                    opacity: .7;
                    cursor: not-allowed;
                }

                .register-switch {
                    margin-top: 22px;
                    color: #74829a;
                    text-align: center;
                    font-size: 13px;
                }

                .register-switch a {
                    margin-left: 4px;
                    color: #1264f5;
                    font-weight: 750;
                    text-decoration: none;
                }

                .register-switch a:hover { text-decoration: underline; }

                .register-security {
                    margin-top: 22px;
                    padding-top: 16px;
                    color: #9aa6ba;
                    border-top: 1px solid #edf1f7;
                    text-align: center;
                    font-size: 11px;
                    line-height: 1.6;
                }

                .register-footer {
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

                @media(max-width:1200px) {
                    .register-nav-inner { flex-wrap: wrap; }
                    .register-nav-links {
                        order: 3;
                        width: 100%;
                        overflow-x: auto;
                        padding-bottom: 3px;
                    }
                    .register-nav-links a { flex-shrink: 0; }
                    .register-layout { gap: 32px; }
                }

                @media(max-width:800px) {
                    .register-main {
                        min-height: auto;
                        padding: 35px 18px;
                    }
                    .register-layout {
                        max-width: 470px;
                        grid-template-columns: 1fr;
                        gap: 26px;
                    }
                    .register-welcome { text-align: center; }
                    .register-welcome h1 {
                        margin: 14px 0;
                        font-size: 39px;
                    }
                    .register-welcome > p {
                        margin: auto;
                        font-size: 14px;
                    }
                    .register-features { display: none; }
                    .register-card { padding: 28px 24px 23px; }
                }

                @media(max-width:480px) {
                    .register-nav-inner {
                        padding: 12px 14px;
                        gap: 12px;
                    }
                    .register-brand { font-size: 20px; }
                    .register-nav-actions { gap: 6px; }
                    .register-nav-actions a {
                        padding: 9px;
                        font-size: 10px;
                    }
                    .register-nav-links { gap: 0; }
                    .register-nav-links a {
                        padding: 9px;
                        font-size: 11px;
                    }
                    .register-main { padding: 27px 13px; }
                    .register-welcome h1 {
                        font-size: 33px;
                        letter-spacing: -1px;
                    }
                    .register-card {
                        padding: 25px 19px 21px;
                        border-radius: 17px;
                    }
                    .register-card-heading h2 { font-size: 24px; }
                    .register-footer {
                        padding: 13px 14px;
                        font-size: 10px;
                    }
                }
            `}</style>

            {/* NAVBAR */}
            <header className="register-navbar">
                <div className="register-nav-inner">
                    <Link to="/" className="register-brand">
                        <span>🎓</span>
                        MyCampus
                    </Link>

                    <nav className="register-nav-links">
                        <NavLink to="/" end>Home</NavLink>
                        <a href="/#about">About</a>
                        <a href="/#academics">Academics</a>
                        <a href="/#facilities">Facilities</a>
                        <a href="/#campus-life">Campus Life</a>
                        <a href="/#gallery">Gallery</a>
                        <a href="/#contact">Contact</a>
                    </nav>

                    <div className="register-nav-actions">
                        <Link to="/admin" className="register-admin-link">
                            Admin Login
                        </Link>
                        <Link to="/login" className="register-student-link">
                            Student Login
                        </Link>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="register-main">
                <section className="register-layout">
                    <div className="register-welcome">
                        <span className="register-welcome-tag">
                            JOIN THE MYCAMPUS COMMUNITY
                        </span>

                        <h1>
                            Start your
                            <br />
                            <span>campus journey.</span>
                        </h1>

                        <p>
                            Create your MyCampus account and get started.
                            Your campus experience begins with a few
                            simple steps.
                        </p>

                        <div className="register-features">
                            <div className="register-feature">
                                <span className="register-check">✓</span>
                                Simple account registration
                            </div>
                            <div className="register-feature">
                                <span className="register-check">✓</span>
                                Access your campus services
                            </div>
                            <div className="register-feature">
                                <span className="register-check">✓</span>
                                Easy account access
                            </div>
                        </div>
                    </div>

                    <section className="register-card">
                        <div className="register-logo">🎓</div>

                        <div className="register-card-heading">
                            <small>CREATE YOUR ACCOUNT</small>
                            <h2>Join MyCampus</h2>
                            <p>Enter your details to register.</p>
                        </div>

                        <form onSubmit={handleSubmit(collectFormData)}>
                            <div className="register-field">
                                <label htmlFor="username">Username</label>
                                <div className="register-input-wrap">
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Choose a username"
                                        autoComplete="username"
                                        {...register("username", {
                                            required: "Username is required",
                                            minLength: {
                                                value: 3,
                                                message: "Minimum 3 characters required"
                                            },
                                            maxLength: {
                                                value: 20,
                                                message: "Maximum 20 characters allowed"
                                            }
                                        })}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="register-error">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="register-field">
                                <label htmlFor="password">Password</label>
                                <div className="register-input-wrap">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Minimum 6 characters required"
                                            }
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="register-show-password"
                                        onClick={() =>
                                            setShowPassword(value => !value)
                                        }
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="register-error">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="register-field">
                                <label htmlFor="role">Account Role</label>
                                <div className="register-input-wrap">
                                    <select
                                        id="role"
                                        {...register("role", {
                                            required: "Please select a role"
                                        })}
                                    >
                                        <option value="">Select your role</option>
                                        <option value="STUDENT">Student</option>
                                        <option value="FACULTY">Faculty</option>
                                        <option value="HOD">HOD</option>
                                    </select>
                                </div>
                                {errors.role && (
                                    <p className="register-error">
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="register-submit"
                                disabled={loading}
                            >
                                {loading ? "Creating account..." : "Create MyCampus account"}
                                {!loading && <span>→</span>}
                            </button>
                        </form>

                        <div className="register-switch">
                            Already have an account?
                            <Link to="/login"> Login</Link>
                        </div>

                        <div className="register-security">
                            College Management System · MyCampus
                        </div>
                    </section>
                </section>
            </main>

            <footer className="register-footer">
                <span>© {new Date().getFullYear()} MyCampus</span>
                <span>College Management System</span>
            </footer>
        </div>
    );
}
