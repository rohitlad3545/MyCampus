/* eslint-disable no-unused-vars */

import React from "react";
import { Link } from "react-router-dom";

const stats = [
    { icon: "bi-people-fill", value: "500+", label: "Students", color: "blue" },
    { icon: "bi-person-video3", value: "50+", label: "Faculty Members", color: "green" },
    { icon: "bi-building-fill", value: "10+", label: "Departments", color: "orange" },
    { icon: "bi-mortarboard-fill", value: "20+", label: "Courses", color: "purple" },
];

const features = [
    {
        icon: "bi-book-half",
        title: "Academic Programs",
        text: "Wide range of courses and specializations",
        color: "blue",
    },
    {
        icon: "bi-people-fill",
        title: "Expert Faculty",
        text: "Learn from experienced and dedicated faculty",
        color: "green",
    },
    {
        icon: "bi-building-fill",
        title: "Modern Facilities",
        text: "State-of-the-art infrastructure",
        color: "orange",
    },
    {
        icon: "bi-people-fill",
        title: "Vibrant Campus Life",
        text: "Extracurricular and student activities",
        color: "pink",
    },
];

const values = [
    { icon: "bi-trophy-fill", title: "Excellence", subtitle: "in Education" },
    { icon: "bi-lightbulb-fill", title: "Innovation", subtitle: "in Learning" },
    { icon: "bi-people-fill", title: "Inclusive", subtitle: "Community" },
    { icon: "bi-shield-fill-check", title: "Safe", subtitle: "Environment" },
];

export default function Home() {
    return (
        <div className="mc-home">
            <style>{`
                .mc-home {
                    --mc-blue: #0866f5;
                    --mc-navy: #101f3d;
                    color: var(--mc-navy);
                    background: #f7f9fd;
                    font-family: Inter, "Segoe UI", Arial, sans-serif;
                    overflow: hidden;
                }

                .mc-home a { text-decoration: none; }

                .mc-nav {
                    min-height: 62px;
                    background: rgba(255,255,255,.98);
                    border-bottom: 1px solid #e8edf5;
                    position: relative;
                    z-index: 5;
                }

                .mc-logo {
                    color: #10254b;
                    font-size: 1.35rem;
                    font-weight: 850;
                    letter-spacing: -1px;
                    white-space: nowrap;
                }

                .mc-logo i { color: var(--mc-blue); }

                .mc-navlinks {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 4px;
                    flex-wrap: wrap;
                }

                .mc-navlinks a {
                    color: #40516d;
                    font-size: .85rem;
                    font-weight: 600;
                    padding: 10px 13px;
                    border-radius: 9px;
                    white-space: nowrap;
                }

                .mc-navlinks a:hover,
                .mc-navlinks a.active {
                    color: white;
                    background: var(--mc-blue);
                }

                .mc-login {
                    border: 1px solid #d4deed;
                    color: #263b5e;
                    font-size: .85rem;
                    font-weight: 650;
                    border-radius: 9px;
                    padding: 9px 14px;
                    white-space: nowrap;
                }

                .mc-login.primary {
                    background: var(--mc-blue);
                    color: white;
                    border-color: var(--mc-blue);
                }

                .mc-hero {
                    position: relative;
                    min-height: 365px;
                    background:
                        linear-gradient(90deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.86) 32%, rgba(255,255,255,.14) 67%, rgba(255,255,255,.02) 100%),
                        url("https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2200&q=90")
                        center 48% / cover no-repeat;
                }

                .mc-hero-inner {
                    min-height: 365px;
                    display: flex;
                    align-items: center;
                    padding-top: 20px;
                    padding-bottom: 48px;
                }

                .mc-eyebrow {
                    color: var(--mc-blue);
                    font-size: .75rem;
                    font-weight: 800;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }

                .mc-hero h1 {
                    color: #101f3d;
                    font-size: clamp(2.1rem, 3.2vw, 3.3rem);
                    font-weight: 850;
                    line-height: 1.13;
                    letter-spacing: -1.4px;
                    max-width: 650px;
                }

                .mc-hero h1 span { color: var(--mc-blue); }

                .mc-hero p {
                    color: #52627c;
                    line-height: 1.6;
                    max-width: 560px;
                }

                .mc-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 9px;
                    padding: 12px 20px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: .9rem;
                    transition: transform .2s, box-shadow .2s;
                }

                .mc-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(8,102,245,.18);
                }

                .mc-btn-blue {
                    background: var(--mc-blue);
                    color: white;
                    border: 1px solid var(--mc-blue);
                }

                .mc-btn-outline {
                    color: var(--mc-blue);
                    border: 1px solid var(--mc-blue);
                    background: white;
                }

                .mc-stats {
                    position: relative;
                    z-index: 2;
                    margin-top: -32px;
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    background: rgba(255,255,255,.97);
                    border: 1px solid #e8eef8;
                    border-radius: 17px;
                    box-shadow: 0 8px 24px rgba(24,55,105,.10);
                    padding: 18px 12px;
                }

                .mc-stat {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 15px;
                    padding: 5px 12px;
                    border-right: 1px solid #e1e8f2;
                }

                .mc-stat:last-child { border-right: 0; }

                .mc-icon {
                    width: 58px;
                    height: 58px;
                    flex-shrink: 0;
                    border-radius: 50%;
                    display: grid;
                    place-items: center;
                    font-size: 1.7rem;
                }

                .mc-blue { background: #e8f0ff; color: #0870f9; }
                .mc-green { background: #e3f9ea; color: #12ad4e; }
                .mc-orange { background: #fff0e5; color: #f57924; }
                .mc-purple { background: #f4e5ff; color: #9418d6; }
                .mc-pink { background: #ffe5ef; color: #ed1671; }

                .mc-stat strong {
                    display: block;
                    font-size: 1.65rem;
                    font-weight: 850;
                    line-height: 1.2;
                }

                .mc-stat small { color: #64738c; font-size: .8rem; }

                .mc-explore { padding: 18px 0 24px; }

                .mc-section-title {
                    text-align: center;
                    font-size: 1.75rem;
                    font-weight: 850;
                    letter-spacing: -.5px;
                }

                .mc-title-line {
                    width: 55px;
                    height: 3px;
                    background: var(--mc-blue);
                    margin: 10px auto 12px;
                    border-radius: 4px;
                }

                .mc-muted { color: #61718a; }

                .mc-feature {
                    height: 100%;
                    min-height: 112px;
                    display: flex;
                    align-items: center;
                    gap: 17px;
                    background: white;
                    padding: 17px;
                    border: 1px solid #eef1f7;
                    border-radius: 17px;
                    box-shadow: 0 5px 16px rgba(24,55,105,.06);
                    transition: transform .2s, box-shadow .2s;
                }

                .mc-feature:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 25px rgba(24,55,105,.10);
                }

                .mc-feature .mc-icon { width: 60px; height: 60px; }
                .mc-feature h3 { font-size: 1rem; font-weight: 800; margin-bottom: 5px; }
                .mc-feature p { color: #64738c; font-size: .83rem; margin: 0; line-height: 1.45; }
                .mc-feature-arrow { margin-left: auto; color: var(--mc-blue); font-size: 1.3rem; }

                .mc-about { background: white; padding: 25px 0; }

                .mc-about h2 {
                    font-size: 1.8rem;
                    font-weight: 850;
                    letter-spacing: -.6px;
                }

                .mc-about p { color: #52627c; line-height: 1.65; }

                .mc-about-image {
                    min-height: 225px;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                    border-radius: 17px;
                    background:
                        linear-gradient(0deg, rgba(6,23,42,.45), transparent 70%),
                        url("https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1200&q=85")
                        center / cover no-repeat;
                }

                .mc-values {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    background: rgba(9,28,49,.75);
                    backdrop-filter: blur(8px);
                }

                .mc-value {
                    text-align: center;
                    color: white;
                    padding: 15px 5px;
                }

                .mc-value i { color: #25baff; font-size: 1.6rem; }
                .mc-value strong { display: block; font-size: .88rem; margin-top: 5px; }
                .mc-value small { color: #e0e8f4; font-size: .75rem; }

                .mc-footer {
                    background: white;
                    border-top: 1px solid #e2e8f0;
                    padding: 14px 0;
                    font-size: .8rem;
                    color: #5d6d86;
                }

                .mc-socials { display: flex; gap: 16px; font-size: 1.05rem; }
                .mc-socials a { color: var(--mc-blue); }

                @media (max-width: 1199px) {
                    .mc-navlinks a { padding: 9px 8px; font-size: .78rem; }
                    .mc-stat { gap: 9px; }
                    .mc-icon { width: 49px; height: 49px; }
                    .mc-stat strong { font-size: 1.4rem; }
                }

                @media (max-width: 991px) {
                    .mc-navlinks {
                        justify-content: flex-start;
                        overflow-x: auto;
                        flex-wrap: nowrap;
                        padding: 10px 0;
                    }
                    .mc-hero { background-position: 58% center; }
                    .mc-hero-inner { min-height: 360px; }
                    .mc-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .mc-stat:nth-child(2) { border-right: 0; }
                    .mc-stat:nth-child(-n+2) { border-bottom: 1px solid #e1e8f2; padding-bottom: 14px; }
                    .mc-stat:nth-child(n+3) { padding-top: 14px; }
                    .mc-about-image { min-height: 280px; }
                }

                @media (max-width: 575px) {
                    .mc-hero, .mc-hero-inner { min-height: 420px; }
                    .mc-hero {
                        background-image:
                            linear-gradient(90deg, rgba(255,255,255,.95), rgba(255,255,255,.78)),
                            url("https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80");
                    }
                    .mc-hero h1 { font-size: 2.25rem; }
                    .mc-stats { padding: 10px 4px; }
                    .mc-stat { padding: 10px 5px; gap: 7px; }
                    .mc-stat .mc-icon { width: 39px; height: 39px; font-size: 1.2rem; }
                    .mc-stat strong { font-size: 1.1rem; }
                    .mc-stat small { font-size: .68rem; }
                    .mc-feature { min-height: 100px; }
                    .mc-values { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .mc-value { padding: 9px 5px; }
                    .mc-about-image { min-height: 300px; }
                    .mc-footer .container { justify-content: center !important; text-align: center; }
                }
            `}</style>

            {/* Navigation */}
            <header className="mc-nav">
                <div className="container-xl py-2">
                    <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                        <Link to="/" className="mc-logo">
                            <i className="bi bi-mortarboard-fill me-1" />
                            MyCampus
                        </Link>

                        <nav className="mc-navlinks">
                            <a className="active" href="#home"><i className="bi bi-house-door me-1" />Home</a>
                            <a href="#about"><i className="bi bi-house-heart me-1" />About</a>
                            <a href="#academics"><i className="bi bi-building me-1" />Academics</a>
                            <a href="#facilities"><i className="bi bi-buildings me-1" />Facilities</a>
                            <a href="#campus-life"><i className="bi bi-mortarboard me-1" />Campus Life</a>
                            <a href="#gallery"><i className="bi bi-images me-1" />Gallery</a>
                            <a href="#contact"><i className="bi bi-chat-square-text me-1" />Contact</a>
                        </nav>

                        <div className="d-flex gap-2">
                            <Link to="/login" className="mc-login">
                                <i className="bi bi-person me-1" /> Admin Login
                            </Link>
                            <Link to="/login" className="mc-login primary">
                                <i className="bi bi-mortarboard-fill me-1" /> Student Login
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="mc-hero" id="home">
                <div className="container-xl mc-hero-inner">
                    <div className="col-lg-7">
                        <div className="mc-eyebrow mb-3">Welcome to MyCampus</div>
                        <h1>
                            Empowering Education
                            <br />
                            <span>Building Brighter Futures</span>
                        </h1>
                        <p className="mt-3 mb-3">
                            A modern college management portal connecting students,
                            faculty, and administration for a smarter, faster, and
                            better learning experience.
                        </p>
                        <div className="d-flex gap-3 flex-wrap">
                            <Link to="/login" className="mc-btn mc-btn-blue">
                                <i className="bi bi-mortarboard-fill" /> Student Login
                            </Link>
                            <Link to="/login" className="mc-btn mc-btn-outline">
                                <i className="bi bi-person" /> Admin Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container-xl">
                {/* Statistics */}
                <section className="mc-stats" aria-label="College statistics">
                    {stats.map((stat) => (
                        <div className="mc-stat" key={stat.label}>
                            <div className={`mc-icon mc-${stat.color}`}>
                                <i className={`bi ${stat.icon}`} />
                            </div>
                            <div>
                                <strong>{stat.value}</strong>
                                <small>{stat.label}</small>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Explore */}
                <section className="mc-explore" id="academics">
                    <h2 className="mc-section-title">Explore Our College</h2>
                    <div className="mc-title-line" />
                    <p className="text-center mc-muted small mb-4">
                        Discover the opportunities and facilities that make our college
                        a great place to learn and grow.
                    </p>

                    <div className="row g-3">
                        {features.map((feature, index) => (
                            <div className="col-12 col-sm-6 col-xl-3" key={feature.title}
                                id={index === 2 ? "facilities" : index === 3 ? "campus-life" : undefined}>
                                <a href="#about" className="mc-feature">
                                    <div className={`mc-icon mc-${feature.color}`}>
                                        <i className={`bi ${feature.icon}`} />
                                    </div>
                                    <div>
                                        <h3>{feature.title}</h3>
                                        <p>{feature.text}</p>
                                    </div>
                                    <i className="bi bi-chevron-right mc-feature-arrow" />
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* About */}
            <section className="mc-about" id="about">
                <div className="container-xl">
                    <div className="row align-items-center g-4">
                        <div className="col-lg-5">
                            <div className="mc-eyebrow mb-2">About Us</div>
                            <h2>A Place to Learn, Grow and Excel</h2>
                            <p className="mt-2 mb-3">
                                MyCampus is committed to providing quality education,
                                fostering innovation, and building future-ready graduates.
                                We offer a supportive environment where students can achieve
                                their academic goals and develop essential skills for a
                                successful career.
                            </p>
                            <a href="#academics" className="mc-btn mc-btn-blue">
                                Learn More <i className="bi bi-arrow-right" />
                            </a>
                        </div>

                        <div className="col-lg-7" id="gallery">
                            <div className="mc-about-image">
                                <div className="mc-values">
                                    {values.map((value) => (
                                        <div className="mc-value" key={value.title}>
                                            <i className={`bi ${value.icon}`} />
                                            <strong>{value.title}</strong>
                                            <small>{value.subtitle}</small>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mc-footer" id="contact">
                <div className="container-xl d-flex align-items-center justify-content-between gap-3 flex-wrap">
                    <div>
                        <Link to="/" className="mc-logo me-3">
                            <i className="bi bi-mortarboard-fill me-1" />
                            MyCampus
                        </Link>
                        <span>© {new Date().getFullYear()} MyCampus College Management Portal. All rights reserved.</span>
                    </div>

                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <a href="#contact" className="mc-muted">Privacy Policy</a>
                        <span>|</span>
                        <a href="#contact" className="mc-muted">Terms of Service</a>
                        <span>|</span>
                        <a href="#contact" className="mc-muted">Contact Us</a>
                        <div className="mc-socials">
                            <a href="#contact" aria-label="Facebook"><i className="bi bi-facebook" /></a>
                            <a href="#contact" aria-label="Twitter"><i className="bi bi-twitter" /></a>
                            <a href="#contact" aria-label="Instagram"><i className="bi bi-instagram" /></a>
                            <a href="#contact" aria-label="LinkedIn"><i className="bi bi-linkedin" /></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
