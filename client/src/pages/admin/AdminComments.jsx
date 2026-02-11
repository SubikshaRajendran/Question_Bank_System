import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        } catch (err) {
            console.error("Failed to send reply", err);
            alert("Failed to send reply");
        }
    };

    // Group by course
    const groupedComments = comments.reduce((acc, comment) => {
        const courseTitle = comment.courseId?.title || 'Unknown Course';
        if (!acc[courseTitle]) acc[courseTitle] = [];
        acc[courseTitle].push(comment);
        return acc;
    }, {});

    if (loading) return <div className="container">Loading comments...</div>;

    return (
        <div className="container">
            <h2 className="section-header">Student Comments & Doubts</h2>

            {Object.keys(groupedComments).length === 0 ? (
                <div className="no-results">No comments found.</div>
            ) : (
                Object.entries(groupedComments).map(([courseTitle, courseComments]) => (
                    <div key={courseTitle} style={{ marginBottom: '2rem' }}>
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{courseTitle}</h3>
                        <div className="student-grid" style={{ gridTemplateColumns: '1fr' }}>
                            {courseComments.map(c => (
                                <div key={c._id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div>
                                            <span style={{ fontWeight: 600 }}>{c.userId?.name || 'Unknown User'}</span>
                                            <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.9rem' }}>({c.userId?.email})</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '4px' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Question:</div>
                                        <div style={{ fontWeight: 500 }}>{c.questionId?.text || 'Question deleted'}</div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Student Comment:</div>
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
                            ))}
                        </div>
                    </div>
                ))
            )}
            {/* Success Modal */}
            <ConfirmationModal
                isOpen={showSuccessModal}
                title="Success"
                message="Reply sent!"
                confirmText="OK"
                onConfirm={() => setShowSuccessModal(false)}
            />
        </div>
    );
};

export default AdminComments;
