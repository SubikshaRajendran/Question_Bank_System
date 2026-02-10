import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { Link } from 'react-router-dom';

const StudentComments = () => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        loadComments();
    }, [user]);

    if (loading) return <div className="container">Loading comments...</div>;

    return (
        <div className="container">
            <h2 className="section-header">My Comments</h2>
            {comments.length === 0 ? (
                <div className="no-results">
                    <p>You haven't posted any comments yet.</p>
                </div>
            ) : (
                <div className="student-grid">
                    {comments.map(c => (
                        <div key={c._id} className="bento-box" style={{ display: 'block' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    {new Date(c.createdAt).toLocaleDateString()} • {c.courseId?.title || 'Unknown Course'}
                                </div>
                                <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
                                    Q: {c.questionId?.text || 'Question deleted'}
                                </div>
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

                            <div style={{ marginTop: '1rem' }}>
                                <Link to={`/course/${c.courseId?._id}#${c.questionId?._id}`} className="btn btn-sm btn-secondary">
                                    View in Course
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentComments;
