import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { History, BookOpen, CheckCircle, XCircle, ChevronDown, Calendar, ChevronLeft, ChevronRight, Eye, ArrowLeft } from 'lucide-react';

const CourseAttempts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { courseId } = useParams();
    const location = useLocation();

    // Fallback: If passed via state, we have course data immediately. Otherwise, we fetch it or rely on populated route data.
    const [course, setCourse] = useState(location.state?.course || null);

    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedAttempt, setSelectedAttempt] = useState(null);

    // Calendar Filter States
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    // Popover State
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewYear, setViewYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const loadAttempts = async () => {
            try {
                const data = await fetchApi(`/quiz/student/course/${courseId}/attempts?studentId=${user._id}`);
                setAttempts(data || []);

                // If we didn't receive course details via state, extract it from the first populated attempt
                if (!course && data.length > 0 && data[0].courseId) {
                    setCourse({ title: data[0].courseId.title, _id: data[0].courseId._id, image: data[0].courseId.image });
                }
            } catch (err) {
                console.error("Failed to load attempts", err);
            } finally {
                setLoading(false);
            }
        };

        if (user && courseId) {
            loadAttempts();
        }
    }, [user, courseId, course]);

    const openModal = (attempt) => {
        setSelectedAttempt(attempt);
    };

    const closeModal = () => {
        setSelectedAttempt(null);
    };

    const filteredAttempts = attempts.filter(attempt => {
        const attemptDate = new Date(attempt.date);
        return attemptDate.getFullYear() === selectedYear && attemptDate.getMonth() === selectedMonth;
    });

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const handleMonthSelect = (monthIndex) => {
        setSelectedYear(viewYear);
        setSelectedMonth(monthIndex);
        setShowCalendar(false);
    };

    const handleOpenCalendar = () => {
        setViewYear(selectedYear);
        setShowCalendar(!showCalendar);
    };

    if (loading) {
        return <div className="container" style={{ marginTop: '3rem', textAlign: 'center' }}>Loading Quiz Attempts...</div>;
    }

    return (
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '3rem' }}>
            {/* Back Button */}
            <button
                className="btn btn-secondary"
                onClick={() => navigate('/student/attempts')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
            >
                <ArrowLeft size={20} />
                Back to Courses
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary-color)', color: 'white', padding: '1rem', borderRadius: '1rem' }}>
                        <History size={32} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0' }}>Quiz History: {course?.title || 'Course'}</h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>View all your past quiz performance for this specific course.</p>
                    </div>
                </div>

                {/* Calendar Filter Trigger */}
                <div style={{ position: 'relative' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handleOpenCalendar}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)' }}
                    >
                        <Calendar size={18} color="var(--primary-color)" />
                        <span>{months[selectedMonth]} {selectedYear}</span>
                        <ChevronDown size={16} />
                    </button>

                    {/* Calendar Popover */}
                    {showCalendar && (
                        <div className="card" style={{
                            position: 'absolute',
                            top: '110%',
                            right: 0,
                            width: '280px',
                            padding: '1.5rem',
                            zIndex: 50,
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                            animation: 'fadeIn 0.2s ease'
                        }}>
                            {/* Year Selector Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <button
                                    onClick={() => setViewYear(prev => prev - 1)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
                                >
                                    <ChevronLeft size={20} color="var(--text-secondary)" />
                                </button>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{viewYear}</span>
                                <button
                                    onClick={() => setViewYear(prev => prev + 1)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
                                >
                                    <ChevronRight size={20} color="var(--text-secondary)" />
                                </button>
                            </div>

                            {/* Months Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {months.map((month, index) => {
                                    const isSelected = selectedYear === viewYear && selectedMonth === index;
                                    return (
                                        <button
                                            key={month}
                                            onClick={() => handleMonthSelect(index)}
                                            style={{
                                                padding: '0.75rem 0',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                background: isSelected ? 'var(--primary-color)' : 'transparent',
                                                color: isSelected ? 'white' : 'var(--text-color)',
                                                fontWeight: isSelected ? 600 : 400,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                fontSize: '0.9rem'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = 'var(--bg-secondary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            {month}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {filteredAttempts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Calendar size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Attempts Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        You haven't attempted any quizzes for this course in {months[selectedMonth]} {selectedYear}.
                    </p>
                    {attempts.length > 0 && (
                        <button className="btn btn-secondary" onClick={() => {
                            setSelectedYear(new Date(attempts[0].date).getFullYear());
                            setSelectedMonth(new Date(attempts[0].date).getMonth());
                        }}>
                            Go to latest attempt
                        </button>
                    )}
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {filteredAttempts.map((attempt) => {
                        const passed = attempt.percentage >= 60;

                        return (
                            <div key={attempt._id} className="card" style={{
                                padding: '1.25rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                borderLeft: `6px solid ${passed ? 'var(--success)' : 'var(--danger)'}`,
                                borderRadius: '0.5rem',
                                gap: '1.5rem'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)' || 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 6px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                                }}
                            >
                                {/* Left Side: Title & Status */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: 0 }}>
                                    {/* Format the date nicely */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <h3 style={{
                                            fontSize: '1.15rem',
                                            margin: 0,
                                            fontWeight: 600,
                                            color: 'var(--text-color)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            Attempt #{attempt.attemptNumber || 1}
                                        </h3>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {new Date(attempt.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side: Status & Button */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexShrink: 0 }}>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '2rem',
                                        background: passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: passed ? 'var(--success)' : 'var(--danger)',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        flexShrink: 0,
                                        width: '85px',
                                        justifyContent: 'center'
                                    }}>
                                        {passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {passed ? 'Pass' : 'Fail'}
                                    </div>

                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '0.5rem' }}
                                        onClick={() => openModal(attempt)}
                                    >
                                        <Eye size={16} /> View
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Popup */}
            {selectedAttempt && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease',
                    padding: '1rem'
                }} onClick={closeModal}>
                    <div className="card" style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: '0',
                        overflow: 'hidden',
                        position: 'relative'
                    }} onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div style={{
                            background: selectedAttempt.percentage >= 60 ? 'var(--success)' : 'var(--danger)',
                            color: 'white',
                            padding: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {selectedAttempt.percentage >= 60 ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    Quiz Attempt Details
                                </h2>
                                <div style={{ opacity: 0.9, fontSize: '0.85rem' }}>
                                    {selectedAttempt.percentage >= 60 ? 'Passed' : 'Failed'}
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: 'white',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '2rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: selectedAttempt.percentage >= 60 ? 'var(--success)' : 'var(--danger)', lineHeight: 1, marginBottom: '0.5rem' }}>
                                    {selectedAttempt.percentage}%
                                </div>
                                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-color)' }}>
                                    {course?.title || 'Course Attempt'}
                                </h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Marks Scored</span>
                                    <span style={{ fontWeight: 600 }}>{selectedAttempt.score} / {selectedAttempt.totalQuestions}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                                    <span style={{ fontWeight: 600 }}>{new Date(selectedAttempt.date).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Time</span>
                                    <span style={{ fontWeight: 600 }}>{new Date(selectedAttempt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Attempt #</span>
                                    <span style={{ fontWeight: 600 }}>{selectedAttempt.attemptNumber || 1}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </div>
    );
};

export default CourseAttempts;
