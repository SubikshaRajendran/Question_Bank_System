import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { Check, Flag, Trophy, Star, LayoutGrid, Eye, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import ConfirmationModal from '../../components/ConfirmationModal';

const CourseView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [readQIds, setReadQIds] = useState([]);
    const [flaggedQIds, setFlaggedQIds] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Stats
    const totalQuestions = questions.length;
    const completedQuestions = questions.filter(q => readQIds.includes(q._id)).length;
    const remainingQuestions = Math.max(0, totalQuestions - completedQuestions);

    const [progress, setProgress] = useState(0);
    const [showStickyProgress, setShowStickyProgress] = useState(false);
    const headerRef = useRef(null);

    // Comment State
    const [commentingQId, setCommentingQId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [animationStage, setAnimationStage] = useState('initial'); // 'initial', 'check', 'trophy'

    const handleAddComment = async (qId) => {
        if (!commentText.trim()) return;
        try {
            await fetchApi('/comments', {
                method: 'POST',
                body: JSON.stringify({
                    userId: user._id,
                    questionId: qId,
                    courseId: course._id,
                    text: commentText
                })
            });
            setCommentingQId(null);
            setCommentText('');
            setShowSuccessModal(true);
        } catch (err) {
            console.error('Failed to submit comment', err);
            alert('Failed to submit comment');
        }
    };

    useEffect(() => {
        if (!loading && questions.length > 0) {
            let targetId = null;

            if (location.state?.openCommentFor) {
                targetId = location.state.openCommentFor;
                setCommentingQId(targetId);
            } else if (location.state?.highlightComment) {
                targetId = location.state.highlightComment;
            }

            if (targetId) {
                setTimeout(() => {
                    const el = document.getElementById(targetId);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.style.transition = 'box-shadow 0.5s';
                        el.style.boxShadow = '0 0 0 3px var(--primary-color)';

                        setTimeout(() => {
                            el.style.boxShadow = '';
                        }, 2500);
                    }
                }, 300);

                // Clean up the location state so it doesn't re-trigger
                navigate(location.pathname + location.hash, { replace: true, state: {} });
            }
        }
    }, [loading, questions, location.state, navigate]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [courseData, readData, flaggedData] = await Promise.all([
                    fetchApi(`/courses/${id}`),
                    fetchApi(`/users/${user._id}/read-questions`),
                    fetchApi(`/users/${user._id}/flagged-questions`)
                ]);

                if (!courseData.course) throw new Error("Course not found");

                setCourse(courseData.course);
                setQuestions(courseData.questions || []);
                setReadQIds(readData || []);
                // flaggedData returns array of objects populated, we need IDs
                setFlaggedQIds(flaggedData.map(f => f._id) || []);
            } catch (err) {
                console.error("Failed to load course", err);
            } finally {
                setLoading(false);
            }
        };

        if (user && id) {
            loadData();
        }
    }, [id, user]);

    // Calculate Progress and Filter
    useEffect(() => {
        if (!course || questions.length === 0) {
            setProgress(0);
            setFilteredQuestions([]);
            return;
        }

        // Calculate Progress
        const total = questions.length;
        const readCount = questions.filter(q => readQIds.includes(q._id)).length;
        setProgress(Math.round((readCount / total) * 100));

        // Filter
        let result = questions;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(q => q.text.toLowerCase().includes(term));
        }

        if (filterType === 'unread') {
            result = result.filter(q => !readQIds.includes(q._id));
        } else if (filterType === 'flagged') {
            result = result.filter(q => flaggedQIds.includes(q._id));
        } else if (filterType === 'recent') {
            // Reverse original order logic simulation
            result = [...result].reverse();
        }

        setFilteredQuestions(result);

    }, [course, questions, readQIds, flaggedQIds, filterType, searchTerm]);

    // Scroll to hash on load
    useEffect(() => {
        if (!loading && questions.length > 0) {
            const hash = window.location.hash;
            if (hash) {
                const id = hash.substring(1);
                // Use a small timeout to allow DOM to settle
                setTimeout(() => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.style.transition = 'border-color 0.3s';
                        element.style.borderColor = 'var(--primary-color)';
                        element.style.borderWidth = '2px';

                        setTimeout(() => {
                            element.style.borderColor = '';
                            element.style.borderWidth = '';
                        }, 2000);
                    }
                }, 100);
            }
        }
    }, [loading, questions]);

    // Scroll Observer for Dynamic Progress
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Show sticky progress when header is NOT intersecting (scrolled out of view)
                setShowStickyProgress(!entry.isIntersecting);
            },
            { threshold: 0.1 } // Trigger when 10% of header is left or less
        );

        if (headerRef.current) {
            observer.observe(headerRef.current);
        }

        return () => {
            if (headerRef.current) {
                observer.unobserve(headerRef.current);
            }
        };
    }, [loading]); // Re-attach if loading changes (though mainly once mounted)


    const markRead = async (qId) => {
        try {
            await fetchApi(`/users/${user._id}/read-question`, {
                method: 'POST',
                body: JSON.stringify({ questionId: qId })
            });
            setReadQIds(prev => {
                const updated = [...prev, qId];
                if (updated.length === questions.length) {
                    setShowCompletionModal(true);
                    setAnimationStage('check');

                    // Sequence: Checkmark -> Trophy -> Confetti
                    setTimeout(() => {
                        setAnimationStage('trophy');
                        confetti({
                            particleCount: 200,
                            spread: 160,
                            origin: { y: 0, x: 0.5 },
                            gravity: 0.8,
                            zIndex: 3000,
                            colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                        });
                    }, 1800);
                }
                return updated;
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Auto-close modal
    useEffect(() => {
        if (showCompletionModal) {
            const timer = setTimeout(() => {
                setShowCompletionModal(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showCompletionModal]);

    const markFlagged = async (qId) => {
        try {
            const updatedFlags = await fetchApi(`/users/${user._id}/flag-question`, {
                method: 'POST',
                body: JSON.stringify({ questionId: qId })
            });
            setFlaggedQIds(updatedFlags);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="container">Loading Course...</div>;
    if (!course) return <div className="container">Course not found</div>;

    return (
        <div className="container">
            {/* Breadcrumbs */}
            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Home</Link> &gt;
                <Link to="/student/courses" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}> My Courses</Link> &gt;
                <span style={{ color: 'var(--text-color)' }}> {course.title}</span>
            </div>

            {/* Modern Header Card */}
            <div className="course-header-card" ref={headerRef}>
                {course.image && (
                    <img
                        src={`${course.image}`}
                        alt={course.title}
                        className="course-header-image"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
                <div className="course-header-content">
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '800' }}>{course.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>{course.description}</p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>Course Progress</span>
                        <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{progress}%</span>
                    </div>
                    <div className="progress-thick">
                        <div className="progress-bar progress-blue" style={{ width: `${progress}%` }}></div>
                    </div>

                    {/* Stats Row */}
                    <div className="course-stats">
                        <div className="stat-item">
                            <span className="stat-value">{totalQuestions}</span>
                            <span className="stat-label">Total Questions</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{completedQuestions}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{remainingQuestions}</span>
                            <span className="stat-label">Remaining</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="course-layout-modern">
                {/* Main Content (Questions) */}
                <main>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Course Content</h3>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{filteredQuestions.length} Questions</span>
                    </div>

                    {filteredQuestions.length === 0 ? (
                        <div className="no-results" style={{ background: 'var(--card-bg)', borderRadius: '1rem', padding: '3rem', textAlign: 'center', border: 'var(--glass-border)' }}>
                            <p>No questions found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredQuestions.map(q => {
                            const isRead = readQIds.includes(q._id);
                            const isFlagged = flaggedQIds.includes(q._id);

                            return (
                                <div id={q._id} key={q._id} className="question-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--card-shadow)', border: 'var(--glass-border)', transition: 'transform 0.2s', backgroundColor: 'var(--card-bg)' }}>
                                    <p dangerouslySetInnerHTML={{
                                        __html: searchTerm ? q.text.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="highlight">$1</span>') : q.text
                                    }} style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--text-color)', lineHeight: '1.6' }}></p>

                                    <div className="question-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                        {isRead ? (
                                            <span style={{ color: 'var(--success)', border: '1px solid var(--success)', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '500', background: 'rgba(16, 185, 129, 0.05)' }}>
                                                <Check size={18} /> Completed
                                            </span>
                                        ) : (
                                            <button className="btn btn-secondary btn-sm" onClick={() => markRead(q._id)}>
                                                Mark as Complete
                                            </button>
                                        )}

                                        <button
                                            className="btn btn-secondary btn-sm"
                                            style={isFlagged ? { borderColor: 'var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' } : {}}
                                            onClick={() => markFlagged(q._id)}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Flag size={16} fill={isFlagged ? 'currentColor' : 'none'} />
                                                {isFlagged ? 'Flagged' : 'Flag'}
                                            </span>
                                        </button>

                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setCommentingQId(q._id)}
                                        >
                                            💬 Comment
                                        </button>
                                    </div>

                                    {commentingQId === q._id && (
                                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
                                            <textarea
                                                rows="3"
                                                placeholder="Type your question or comment here..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                                            ></textarea>
                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => {
                                                        setCommentingQId(null);
                                                        setCommentText('');
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleAddComment(q._id)}
                                                >
                                                    Submit Comment
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </main>

                {/* Sidebar (Filters & Progress) */}
                <aside className="filter-panel">
                    {/* Circular Progress (Dynamic Visibility) */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: showStickyProgress ? '2rem' : '0',
                        opacity: showStickyProgress ? 1 : 0,
                        maxHeight: showStickyProgress ? '200px' : '0',
                        overflow: 'hidden',
                        transition: 'all 0.5s ease-in-out',
                        transform: showStickyProgress ? 'translateY(0)' : 'translateY(-20px)'
                    }}>
                        <svg viewBox="0 0 36 36" className="circular-chart" style={{ width: '120px', height: '120px' }}>
                            <path className="circle-bg"
                                d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path className="circle"
                                strokeDasharray={`${progress}, 100`}
                                d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.35" className="percentage">{progress}%</text>
                        </svg>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {completedQuestions} / {totalQuestions} Completed
                        </p>
                    </div>

                    <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Search & Filter</h4>

                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {['all', 'unread', 'flagged', 'recent'].map(type => {
                            let label = '';
                            let IconComponent = null;
                            if (type === 'all') { label = 'All Questions'; IconComponent = LayoutGrid; }
                            else if (type === 'unread') { label = 'Unread Only'; IconComponent = Eye; }
                            else if (type === 'flagged') { label = 'Flagged Only'; IconComponent = Flag; }
                            else if (type === 'recent') { label = 'Recently Added'; IconComponent = Clock; }

                            return (
                                <button
                                    key={type}
                                    className={`filter-chip ${filterType === type ? 'active' : ''}`}
                                    onClick={() => setFilterType(type)}
                                >
                                    <IconComponent size={20} /> {label}
                                </button>
                            );
                        })}
                    </div>
                </aside>
            </div>
            {/* Success Modal */}
            <ConfirmationModal
                isOpen={showSuccessModal}
                title="Success"
                message="Your Comment submitted!"
                confirmText="OK"
                onConfirm={() => setShowSuccessModal(false)}
            />

            {/* Course Completion Celebration Modal */}
            {showCompletionModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000,
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-color)',
                        padding: '3rem',
                        borderRadius: '1.5rem',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        maxWidth: '450px',
                        width: '90%',
                        border: '1px solid var(--border-color)',
                        transform: 'scale(1)',
                        animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Background Decoration */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>

                        <div style={{ position: 'relative', zIndex: 1, minHeight: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                            {animationStage === 'check' && (
                                <div style={{ transform: 'scale(1.5)', marginBottom: '2rem' }}>
                                    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                                        <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                    </svg>
                                </div>
                            )}

                            {animationStage === 'trophy' && (
                                <div className="animate-pop" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                    <div className="animate-bounce">
                                        <Trophy size={80} color="#fbbf24" fill="#fbbf24" style={{ filter: 'drop-shadow(0 10px 10px rgba(251, 191, 36, 0.4))' }} />
                                    </div>

                                    {/* Star Bursts */}
                                    <Star size={24} fill="#fbbf24" color="#fbbf24" style={{ position: 'absolute', top: '-20%', right: '-30%', animation: 'starBurst 1s ease-out infinite' }} />
                                    <Star size={16} fill="#3b82f6" color="#3b82f6" style={{ position: 'absolute', top: '40%', left: '-40%', animation: 'starBurst 1.2s ease-out 0.2s infinite' }} />
                                    <Star size={20} fill="#10b981" color="#10b981" style={{ position: 'absolute', bottom: '-10%', right: '90%', animation: 'starBurst 1.5s ease-out 0.5s infinite' }} />
                                </div>
                            )}

                            <h2 style={{
                                fontSize: '2rem',
                                background: 'linear-gradient(to right, #10b981, #3b82f6)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                                opacity: animationStage === 'trophy' ? 1 : 0,
                                transform: animationStage === 'trophy' ? 'translateY(0)' : 'translateY(10px)',
                                transition: 'all 0.5s ease-out'
                            }}>
                                Course Completed!
                            </h2>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '1.1rem',
                                marginBottom: '2rem',
                                opacity: animationStage === 'trophy' ? 1 : 0,
                                transform: animationStage === 'trophy' ? 'translateY(0)' : 'translateY(10px)',
                                transition: 'all 0.5s ease-out 0.2s'
                            }}>
                                🎉 Congratulations on completing the course! Great job!
                            </p>

                            <button
                                className="btn"
                                style={{
                                    width: '100%',
                                    fontSize: '1.1rem',
                                    padding: '0.8rem',
                                    borderRadius: '1rem',
                                    boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
                                    opacity: animationStage === 'trophy' ? 1 : 0,
                                    transform: animationStage === 'trophy' ? 'translateY(0)' : 'translateY(10px)',
                                    transition: 'all 0.5s ease-out 0.4s'
                                }}
                                onClick={() => navigate('/student/courses')}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseView;
