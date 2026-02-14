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

            {/* Top Section: Story and Image */}
            <div className="about-grid" style={{ marginBottom: '2rem', padding: '2rem' }}>
                <motion.div
                    className="about-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <h3>The Story</h3>
                        <p style={{ marginBottom: '1rem' }}>
                            The Question Bank System was created with a simple goal — to help students evaluate and strengthen their understanding of academic subjects independently. Many students prepare for exams without knowing their actual level of understanding in a specific course. This platform was designed to provide structured question sets across different subjects, allowing students to test themselves, identify knowledge gaps, and improve confidently. What started as a student-focused academic tool has evolved into a centralized self-assessment platform for effective learning.
                        </p>
                    </motion.div>
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

            {/* Middle Section: Mission and Vision */}
            <div className="mission-vision-grid" style={{ marginTop: '0', marginBottom: '3rem' }}>
                <motion.div className="mv-card" variants={itemVariants} initial="hidden" animate="visible">
                    <h4>Our Mission</h4>
                    <p style={{ fontSize: '0.9rem' }}>Our mission is to empower students with a simple, organized, and accessible platform that enables self-assessment across various academic courses. We aim to make exam preparation more structured by providing quality question banks that help students track their understanding and improve continuously.</p>
                </motion.div>
                <motion.div className="mv-card" variants={itemVariants} initial="hidden" animate="visible">
                    <h4>Our Vision</h4>
                    <p style={{ fontSize: '0.9rem' }}>Our vision is to create a reliable academic self-evaluation ecosystem where students can independently assess their knowledge, build confidence, and enhance their academic performance through consistent practice and feedback-driven learning.</p>
                </motion.div>
            </div>

            <div style={{ margin: '4rem 0 2rem', opacity: 0.1, borderTop: '1px solid var(--text-color)' }}></div>

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
