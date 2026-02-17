import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { Link } from 'react-router-dom';
import { Plus, X, MessageCircleQuestion, MessageSquare } from 'lucide-react';

const StudentComments = () => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'general'

    useEffect(() => {
        loadComments();
    }, [user]);

    const loadComments = async () => {
        if (!user) return;
        try {
            const data = await fetchApi(`/comments/student/${user._id}`);
            setComments(data);
        } catch (err) {
            console.error("Failed to load comments", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const data = await fetchApi('/comments', {
                method: 'POST',
                body: JSON.stringify({
                    userId: user._id,
                    text: newComment
                })
            });

            // Re-fetch to get consistent data structure
            setComments([data, ...comments]);
            setNewComment('');
            setShowModal(false);
        } catch (err) {
            alert(err.message || 'Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const questionDoubts = comments.filter(c => c.type !== 'general' && c.questionId);
    const generalComments = comments.filter(c => c.type === 'general');

    if (loading) return <div className="container">Loading comments...</div>;

    return (
        <div className="container">
            <h2 className="section-header" style={{ marginBottom: '1.5rem' }}>My Comments</h2>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '2.5rem' }}>
                <button
                    className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questions')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.75rem 0',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: activeTab === 'questions' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'questions' ? '2px solid var(--primary-color)' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <MessageCircleQuestion size={18} /> Question Doubts
                    <span style={{ background: 'var(--bg-secondary)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                        {questionDoubts.length}
                    </span>
                </button>
                <button
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.75rem 0',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: activeTab === 'general' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'general' ? '2px solid var(--primary-color)' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <MessageSquare size={18} /> General Comments
                    <span style={{ background: 'var(--bg-secondary)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                        {generalComments.length}
                    </span>
                </button>
            </div>

            {/* Question Doubts Tab */}
            {activeTab === 'questions' && (
                <div>
                    {questionDoubts.length === 0 ? (
                        <div className="no-results">
                            <p>No question doubts found.</p>
                        </div>
                    ) : (
                        <div className="student-grid">
                            {questionDoubts.map(c => (
                                <div key={c._id} className="bento-box" style={{ display: 'block' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                            <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{c.courseId?.title || 'Unknown Course'}</span>
                                        </div>

                                        <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '1rem', lineHeight: '1.4' }}>
                                            Q: {c.questionId?.text}
                                        </div>

                                        <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', fontSize: '0.95rem', borderLeft: '3px solid var(--text-secondary)' }}>
                                            "{c.text}"
                                        </div>
                                    </div>

                                    {c.reply ? (
                                        <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '3px solid var(--success)' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)', marginBottom: '0.25rem' }}>
                                                Admin Reply:
                                            </div>
                                            <div style={{ fontSize: '0.95rem' }}>{c.reply}</div>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }}></div>
                                            Awaiting reply...
                                        </div>
                                    )}

                                    {c.courseId && c.questionId && (
                                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                            <Link to={`/course/${c.courseId._id}#${c.questionId._id}`} className="btn btn-sm btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                                                View in Course
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* General Comments Tab */}
            {activeTab === 'general' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                        <button className="btn" onClick={() => setShowModal(true)}>
                            <Plus size={18} style={{ marginRight: '0.5rem' }} />
                            New General Comment
                        </button>
                    </div>

                    {generalComments.length === 0 ? (
                        <div className="no-results">
                            <p>No general comments yet.</p>
                        </div>
                    ) : (
                        <div className="student-grid">
                            {generalComments.map(c => (
                                <div key={c._id} className="bento-box" style={{ display: 'block' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                            <span className="tag" style={{ background: '#e0e7ff', color: '#4338ca' }}>General</span>
                                        </div>

                                        <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', fontSize: '0.95rem', borderLeft: '3px solid var(--text-secondary)' }}>
                                            "{c.text}"
                                        </div>
                                    </div>

                                    {c.reply ? (
                                        <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '3px solid var(--success)' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)', marginBottom: '0.25rem' }}>
                                                Admin Reply:
                                            </div>
                                            <div style={{ fontSize: '0.95rem' }}>{c.reply}</div>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }}></div>
                                            Awaiting reply...
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* General Comment Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem',
                        width: '90%', maxWidth: '500px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid var(--border-color)',
                        animation: 'popIn 0.2s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>New General Comment</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddComment}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Your Comment / Suggestion</label>
                                <textarea
                                    rows="4"
                                    placeholder="Type your suggestion, feedback, or general query here..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    required
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-color)',
                                        color: 'var(--text-color)',
                                        fontFamily: 'inherit'
                                    }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentComments;
