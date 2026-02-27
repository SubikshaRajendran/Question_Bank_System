import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { History, BookOpen, ArrowLeft, Trophy, Activity } from 'lucide-react';

const MyAttempts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // 1. Fetch registered courses
                const dashboardData = await fetchApi(`/users/${user._id}/dashboard-data`);
                const allCourses = dashboardData.allCourses || [];
                const registered = allCourses.filter(c => c.isRegistered);

                // 2. Fetch all attempts to calculate stats natively (faster than adding new aggregation routes for now)
                const attemptsData = await fetchApi(`/quiz/student/attempts?studentId=${user._id}`);

                // 3. Map stats to courses
                const coursesWithStats = registered.map(course => {
                    const courseAttempts = attemptsData.filter(a => a.courseId && a.courseId._id === course._id);

                    let bestScore = 0;
                    if (courseAttempts.length > 0) {
                        bestScore = Math.max(...courseAttempts.map(a => a.percentage));
                    }

                    return {
                        ...course,
                        totalAttempts: courseAttempts.length,
                        bestScore
                    };
                });

                setCourses(coursesWithStats);
            } catch (err) {
                console.error("Failed to load attempt courses", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadDashboardData();
        }
    }, [user]);

    if (loading) {
        return <div className="container" style={{ marginTop: '3rem', textAlign: 'center' }}>Loading Courses...</div>;
    }

    return (
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '3rem' }}>
            {/* Back Button */}
            <div style={{ marginBottom: '3.5rem' }}>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/student/leaderboard')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
                >
                    <ArrowLeft size={20} />
                    Back to Leaderboard
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary-color)', color: 'white', padding: '1rem', borderRadius: '1rem' }}>
                        <History size={32} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0' }}>Quiz Attempts by Course</h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Select a course to view your detailed quiz attempt history.</p>
                    </div>
                </div>
            </div>

            {courses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <BookOpen size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Courses Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        You are not registered in any courses yet.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/student/dashboard')}>
                        Browse Courses
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.5rem',
                    alignItems: 'start'
                }}>
                    {courses.map((course) => (
                        <div
                            key={course._id}
                            className="card"
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'pointer',
                                borderRadius: '1rem'
                            }}
                            onClick={() => navigate(`/student/attempts/${course._id}`, { state: { course } })}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow)';
                            }}
                        >
                            {/* Course Image or Fallback */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                {course.image ?
                                    <img src={course.image} alt="Course icon" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                                    :
                                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BookOpen size={24} color="var(--text-secondary)" />
                                    </div>
                                }
                                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600, color: 'var(--text-color)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={course.title}>
                                    {course.title}
                                </h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.75rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
                                        <Activity size={14} /> Total Attempts
                                    </span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-color)' }}>
                                        {course.totalAttempts}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
                                        <Trophy size={14} /> Best Score
                                    </span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: course.bestScore >= 60 ? 'var(--success)' : (course.totalAttempts > 0 ? 'var(--danger)' : 'var(--text-color)') }}>
                                        {course.totalAttempts > 0 ? `${course.bestScore}%` : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAttempts;
