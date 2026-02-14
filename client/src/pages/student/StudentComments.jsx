import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';

const StudentComments = () => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

            // Re-fetch to get consistent data structure (populated fields if any, though none for general)
            // or just prepend carefully. Let's re-fetch for simplicity or prepend.
            // data returned is the comment object
            setComments([data, ...comments]);
            setNewComment('');
            setShowModal(false);
        } catch (err) {
            alert(err.message || 'Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container">Loading comments...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="section-header" style={{ marginBottom: 0 }}>My Comments</h2>
                <button className="btn" onClick={() => setShowModal(true)}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    New
                </button>
            </div>

            {comments.length === 0 ? (
                <div className="no-results">
                    <p>You haven't posted any comments yet.</p>
                </div>
            ) : (
                <div className="student-grid">
                    {comments.map(c => (
                        <div key={c._id} className="bento-box" style={{ display: 'block' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                    {c.type === 'general' ? (
                                        <span className="tag" style={{ background: '#e0e7ff', color: '#4338ca' }}>General</span>
                                    ) : (
                                        <span>{c.courseId?.title || 'Unknown Course'}</span>
                                    )}
                                </div>

                                {c.type !== 'general' && (
                                    <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
                                        Q: {c.questionId?.text || 'Question deleted'}
                                    </div>
                                )}

                                <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '4px', fontSize: '0.95rem' }}>
                                    "{c.text}"
                                </div>
                            </div>

                            {c.reply ? (
                                <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '3px solid var(--primary-color)' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '0.25rem' }}>
                                        Admin Reply:
                                    </div>
                                    <div style={{ fontSize: '0.95rem' }}>{c.reply}</div>
                                </div>
                            ) : (
                                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    Awaiting reply...
                                </div>
                            )}

                            {c.type !== 'general' && c.courseId && (
                                <div style={{ marginTop: '1rem' }}>
                                    <Link to={`/course/${c.courseId._id}#${c.questionId?._id}`} className="btn btn-sm btn-secondary">
                                        View in Course
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
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
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>New General Comment</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddComment}>
                            <div className="form-group">
                                <label>Your Comment / Suggestion</label>
                                <textarea
                                    rows="4"
                                    placeholder="Type your suggestion, feedback, or general query here..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    required
                                    autoFocus
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn" disabled={submitting}>
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
