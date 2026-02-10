import React from 'react';

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="container">
            <div className="breadcrumbs" style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link> &gt; About Us
            </div>

            <motion.h2
                className="section-header"
                style={{ textAlign: 'center', marginBottom: '3rem' }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                About Us
            </motion.h2>

            <div className="about-grid">
                <motion.div
                    className="about-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <h3>The Story</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            The Question Bank System was born from a simple idea: education should be accessible, organized, and
                            efficient.
                            We recognized that students needed a reliable way to practice, and educators needed a seamless tool
                            to manage curriculum.
                            What started as a small project has grown into a comprehensive platform serving the academic
                            community.
                        </p>
                    </motion.div>

                    <div className="mission-vision-grid">
                        <motion.div className="mv-card" variants={itemVariants}>
                            <h4>Our Mission</h4>
                            <p style={{ fontSize: '0.9rem' }}>To streamline the assessment process and provide students with the
                                high-quality resources they need to excel.</p>
                        </motion.div>
                        <motion.div className="mv-card" variants={itemVariants}>
                            <h4>Our Vision</h4>
                            <p style={{ fontSize: '0.9rem' }}>A world where every student has immediate access to the tools that
                                help them unlock their full potential.</p>
                        </motion.div>
                    </div>
                </motion.div>

                <div className="about-image">
                    {/* Illustration: Education / Studying */}
                    <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', height: 'auto' }}>
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#818cf8', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                        <g transform="translate(50,50)">
                            {/* Background Blob */}
                            <path d="M350,150 Q380,50 250,50 Q120,50 100,150 Q80,250 200,300 Q320,350 350,150"
                                fill="rgba(79, 70, 229, 0.1)" />

                            {/* Simple Book Stack Icon */}
                            <rect x="180" y="180" width="140" height="20" rx="3" fill="url(#grad1)" />
                            <rect x="180" y="210" width="150" height="20" rx="3" fill="url(#grad1)" opacity="0.8" />
                            <rect x="180" y="240" width="160" height="20" rx="3" fill="url(#grad1)" opacity="0.6" />

                            {/* Student Head/Torso Abstract */}
                            <circle cx="120" cy="180" r="40" fill="#1f2937" />
                            <path d="M80,220 Q120,280 160,220 L160,300 L80,300 Z" fill="#374151" />

                            {/* Decoration */}
                            <circle cx="380" cy="80" r="10" fill="#10b981" />
                            <circle cx="50" cy="250" r="5" fill="#f59e0b" />
                        </g>
                    </svg>
                </div>
            </div>

            <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <h3>Get in Touch</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Have questions or feedback? We'd love to hear
                    from you.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <div>
                        <strong>Email</strong><br />
                        support@qbsystem.com
                    </div>
                    <div>
                        <strong>Phone</strong><br />
                        +1 (555) 123-4567
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
