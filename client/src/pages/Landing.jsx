import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, BarChart2, Shield } from 'lucide-react';

const Landing = () => {

    return (
        <>
            <header className="hero-section">
                <div className="container hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            <span className="hero-welcome">Welcome to</span>
                            <span className="hero-brand">Question Bank System</span>
                        </h1>
                        <p className="hero-description">
                            Your comprehensive platform for accessing course, questions, and more.
                            Start your learning journey today.
                        </p>

                        <Link to="/login" className="btn btn-lg btn-icon">
                            Get Started
                            <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="hero-image">
                        {/* Education Illustration */}
                        <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" className="hero-svg">
                            <defs>
                                <linearGradient id="gradHero" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#818cf8', stopOpacity: 1 }} />
                                </linearGradient>
                            </defs>
                            <g transform="translate(20,20)">
                                <circle cx="250" cy="200" r="180" fill="rgba(79, 70, 229, 0.05)" />
                                <circle cx="250" cy="200" r="130" fill="rgba(79, 70, 229, 0.05)" />

                                <rect x="150" y="120" width="200" height="160" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="2" />
                                <rect x="170" y="140" width="160" height="20" rx="4" fill="#f3f4f6" />
                                <rect x="170" y="180" width="100" height="10" rx="4" fill="#e5e7eb" />
                                <rect x="170" y="200" width="120" height="10" rx="4" fill="#e5e7eb" />
                                <rect x="170" y="220" width="140" height="10" rx="4" fill="#e5e7eb" />

                                <circle cx="380" cy="80" r="20" fill="#fbbf24" opacity="0.8" />
                                <path d="M100,280 Q150,330 200,280" stroke="#10b981" strokeWidth="4" fill="none" />
                            </g>
                        </svg>
                    </div>
                </div>
            </header>

            <section className="features-section container">
                <div className="features-grid">
                    <div className="feature-card interactive-card">
                        <div className="feature-icon">
                            <BookOpen size={40} color="#4f46e5" />
                        </div>
                        <h3>Vast Question Bank</h3>
                        <p>Access thousands of curated questions across multiple subjects and difficulty levels.</p>
                    </div>
                    <div className="feature-card interactive-card">
                        <div className="feature-icon">
                            <BarChart2 size={40} color="#4f46e5" />
                        </div>
                        <h3>Track Progress</h3>
                        <p>Mark questions as read, flag them for review, and visualize your learning journey.</p>
                    </div>
                    <div className="feature-card interactive-card">
                        <div className="feature-icon">
                            <Shield size={40} color="#4f46e5" />
                        </div>
                        <h3>Secure Access</h3>
                        <p>Dedicated portals for students and administrators to ensure secure and personalized experiences.</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Landing;
