import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Eye, Trash2, X, MessageCircleQuestion, MessageSquare } from 'lucide-react';

const AdminComments = () => {
    const location = useLocation();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'question'); // 'question' | 'general'
    const [viewingComment, setViewingComment] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state?.tab]);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const data = await fetchApi('/comments/admin');
            setComments(data);
        } catch (err) {
            console.error("Failed to load comments", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (cId) => {
        if (!replyText.trim()) return;
        try {
            const updatedComment = await fetchApi(`/comments/${cId}/reply`, {
                method: 'PUT',
                body: JSON.stringify({ reply: replyText })
            });

            setComments(comments.map(c => c._id === cId ? updatedComment : c));
            setReplyingId(null);
            setReplyText('');
            setShowSuccessModal(true);

            // Update viewingComment if open
            if (viewingComment && viewingComment._id === cId) {
                setViewingComment(updatedComment);
            }
        } catch (err) {
            console.error("Failed to send reply", err);
            alert("Failed to send reply");
        }
    };

    const handleDelete = async () => {
        if (!viewingComment) return;
        try {
            await fetchApi(`/comments/${viewingComment._id}`, { method: 'DELETE' });
            setComments(comments.filter(c => c._id !== viewingComment._id));
            setViewingComment(null);
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("Failed to delete comment", err);
            alert("Failed to delete comment");
        }
    };

    // Filter comments based on tab
    const questionComments = comments.filter(c => c.type !== 'general');
    const generalComments = comments.filter(c => c.type === 'general');

    // Group by course for Question Comments
    const groupedComments = questionComments.reduce((acc, comment) => {
        const courseTitle = comment.courseId?.title || 'Unknown Course';
        if (!acc[courseTitle]) acc[courseTitle] = [];
        acc[courseTitle].push(comment);
        return acc;
    }, {});

    if (loading) return <div className="container">Loading comments...</div>;

    const renderCommentCard = (c) => (
        <div key={c._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                    <span style={{ fontWeight: 600 }}>{c.userId?.username || c.userId?.name || 'Unknown User'}</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.9rem' }}>({c.userId?.email})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                    <button
                        className="btn btn-sm btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => setViewingComment(c)}
                    >
                        <Eye size={14} /> View
                    </button>
                </div>
            </div>

            {c.type !== 'general' && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Question:</div>
                    <div style={{ fontWeight: 500 }}>{c.questionId?.text || 'Question deleted'}</div>
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    {c.type === 'general' ? 'General Comment / Suggestion:' : 'Student Comment:'}
                </div>
                <div style={{ fontStyle: 'italic' }}>"{c.text}"</div>
            </div>

            {c.reply ? (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>Replying:</div>
                    <div>{c.reply}</div>
                </div>
            ) : (
                <div style={{ marginTop: '1rem' }}>
                    {replyingId === c._id ? (
                        <div>
                            <textarea
                                rows="3"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            ></textarea>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-sm" onClick={() => handleReply(c._id)}>Send Reply</button>
                                <button className="btn btn-sm btn-secondary" onClick={() => setReplyingId(null)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button className="btn btn-sm btn-secondary" onClick={() => {
                            setReplyingId(c._id);
                            setReplyText('');
                        }}>Reply</button>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="container">
            <h2 className="section-header">Student Comments & Doubts</h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    className={`tab-btn ${activeTab === 'question' ? 'active' : ''}`}
                    onClick={() => setActiveTab('question')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.75rem 0',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: activeTab === 'question' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'question' ? '2px solid var(--primary-color)' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <MessageCircleQuestion size={18} /> Question Doubts
                    <span style={{ background: 'var(--bg-secondary)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', color: 'var(--text-color)' }}>
                        {questionComments.length}
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
                        gap: '0.5rem',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <MessageSquare size={18} /> General Comments
                    <span style={{ background: 'var(--bg-secondary)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', color: 'var(--text-color)' }}>
                        {generalComments.length}
                    </span>
                </button>
            </div>

            {activeTab === 'question' ? (
                <>
                    {Object.keys(groupedComments).length === 0 ? (
                        <div className="no-results">No question-related comments found.</div>
                    ) : (
                        Object.entries(groupedComments).map(([courseTitle, courseComments]) => (
                            <div key={courseTitle} style={{ marginBottom: '2rem' }}>
                                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{courseTitle}</h3>
                                <div className="student-grid" style={{ gridTemplateColumns: '1fr' }}>
                                    {courseComments.map(c => renderCommentCard(c))}
                                </div>
                            </div>
                        ))
                    )}
                </>
            ) : (
                <>
                    {generalComments.length === 0 ? (
                        <div className="no-results">No general comments found.</div>
                    ) : (
                        <div className="student-grid" style={{ gridTemplateColumns: '1fr' }}>
                            {generalComments.map(c => renderCommentCard(c))}
                        </div>
                    )}
                </>
            )}

            {/* Success Modal */}
            <ConfirmationModal
                isOpen={showSuccessModal}
                title="Success"
                message="Reply sent!"
                confirmText="OK"
                onConfirm={() => setShowSuccessModal(false)}
            />

            {/* Detailed View Modal */}
            {viewingComment && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem',
                        width: '90%', maxWidth: '600px',
                        maxHeight: '90vh', overflowY: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <h3>Comment Details</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn btn-sm btn-danger"
                                    style={{ background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                                <button onClick={() => setViewingComment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{viewingComment.userId?.username || viewingComment.userId?.name || 'Unknown User'}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{new Date(viewingComment.createdAt).toLocaleString()}</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{viewingComment.userId?.email}</div>

                            {viewingComment.type !== 'general' && (
                                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Related Question:</div>
                                    <div style={{ fontWeight: 500 }}>{viewingComment.questionId?.text || 'Question deleted'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Course: {viewingComment.courseId?.title}</div>
                                </div>
                            )}

                            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Student Wrote:</div>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{viewingComment.text}</div>
                            </div>
                        </div>

                        {viewingComment.reply ? (
                            <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '8px', border: '1px solid #059669' }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#065f46' }}>Admin Reply:</div>
                                <div style={{ whiteSpace: 'pre-wrap', color: '#064e3b', fontWeight: 500 }}>{viewingComment.reply}</div>
                            </div>
                        ) : (
                            <div>
                                <h4 style={{ marginBottom: '0.5rem' }}>Reply to Student</h4>
                                <textarea
                                    rows="4"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply here..."
                                    style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                ></textarea>
                                <button className="btn" onClick={() => handleReply(viewingComment._id)}>Send Reply</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                title="Delete Comment"
                message="Are you sure you want to permanently delete this comment? This action cannot be undone."
                confirmText="Delete"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};

export default AdminComments;
