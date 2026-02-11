import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { Check, Flag } from 'lucide-react';
import confetti from 'canvas-confetti';
import ConfirmationModal from '../../components/ConfirmationModal';

const CourseView = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [readQIds, setReadQIds] = useState([]);
    const [flaggedQIds, setFlaggedQIds] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Stats
    const [progress, setProgress] = useState(0);

    // Comment State
    const [commentingQId, setCommentingQId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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


    const markRead = async (qId) => {
        try {
            await fetchApi(`/users/${user._id}/read-question`, {
                method: 'POST',
                body: JSON.stringify({ questionId: qId })
            });
            setReadQIds(prev => {
                const updated = [...prev, qId];
                if (updated.length === questions.length) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
                return updated;
            });
        } catch (err) {
            console.error(err);
        }
    };

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

            {course.image && (
                <div style={{ height: '300px', borderRadius: '1rem', overflow: 'hidden', marginBottom: '2rem', boxShadow: 'var(--card-shadow)' }}>
                    <img
                        src={`${course.image}`}
                        alt={course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            )}

            <h2>{course.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{course.description}</p>

            {/* Progress */}
            <div className="progress-container">
                <div className="progress-bar progress-blue" style={{ width: `${progress}%` }}></div>
            </div>
            <p style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{progress}% Completed</p>

            <div className="course-layout">
                {/* Sidebar */}
                <aside className="sidebar">
                    <input
                        type="text"
                        placeholder="Search in this course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', marginBottom: '1rem' }}
                    />

                    <h4 style={{ marginBottom: '1rem' }}>Filters</h4>

                    {['all', 'unread', 'flagged', 'recent'].map(type => {
                        let label = '';
                        if (type === 'all') label = 'All Questions';
                        else if (type === 'unread') label = 'Unread Only';
                        else if (type === 'flagged') label = 'Flagged Only';
                        else if (type === 'recent') label = 'Recently Added';

                        return (
                            <div
                                key={type}
                                onClick={() => setFilterType(type)}
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: filterType === type ? 'bold' : 'normal',
                                    color: filterType === type ? 'var(--primary-color)' : 'inherit'
                                }}
                            >
                                {label}
                            </div>
                        );
                    })}
                </aside>

                {/* Content */}
                <main>
                    {filteredQuestions.length === 0 ? (
                        <p>No questions found.</p>
                    ) : (
                        filteredQuestions.map(q => {
                            const isRead = readQIds.includes(q._id);
                            const isFlagged = flaggedQIds.includes(q._id);

                            return (
                                <div id={q._id} key={q._id} className="question-card">
                                    <p dangerouslySetInnerHTML={{
                                        __html: searchTerm ? q.text.replace(new RegExp(`(${searchTerm})`, 'gi'), '<span class="highlight">$1</span>') : q.text
                                    }} style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--text-color)' }}></p>

                                    <div className="question-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        {isRead ? (
                                            <span style={{ color: 'var(--success)', border: '1px solid var(--success)', padding: '0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                <Check size={16} /> Read
                                            </span>
                                        ) : (
                                            <button className="btn btn-secondary btn-sm" onClick={() => markRead(q._id)}>
                                                Mark as Read
                                            </button>
                                        )}

                                        <button
                                            className="btn btn-secondary btn-sm"
                                            style={isFlagged ? { borderColor: 'var(--danger)', color: 'var(--danger)' } : {}}
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
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                                            <textarea
                                                rows="2"
                                                placeholder="Type your question or comment here..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                            ></textarea>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleAddComment(q._id)}
                                                >
                                                    Submit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => {
                                                        setCommentingQId(null);
                                                        setCommentText('');
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </main>
            </div>
            {/* Success Modal */}
            <ConfirmationModal
                isOpen={showSuccessModal}
                title="Success"
                message="Your Comment submitted!"
                confirmText="OK"
                onConfirm={() => setShowSuccessModal(false)}
            />
        </div>
    );
};

export default CourseView;
