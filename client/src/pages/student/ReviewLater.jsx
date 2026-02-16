import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { Link } from 'react-router-dom';

const ReviewLater = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadQuestions = async () => {
            if (!user) return;
            try {
                const data = await fetchApi(`/users/${user._id}/flagged-questions`);
                setQuestions(data);
            } catch (err) {
                console.error("Failed to load flagged questions", err);
            } finally {
                setLoading(false);
            }
        };
        loadQuestions();
    }, [user]);

    const handleUnflag = async (qId) => {
        try {
            await fetchApi(`/users/${user._id}/flag-question`, {
                method: 'POST',
                body: JSON.stringify({ questionId: qId })
            });
            // Remove from list
            setQuestions(prev => prev.filter(q => q._id !== qId));
        } catch (err) {
            console.error("Failed to unflag question", err);
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <h2 className="section-header">Review Later</h2>
            {questions.length === 0 ? (
                <div className="no-results">
                    <p>No flagged questions.</p>
                </div>
            ) : (
                <div>
                    {questions.map(q => {
                        const course = q.courseId || q.course; // Handle potential field name differences
                        return (
                            <div key={q._id} className="question-card">
                                <Link
                                    to={`/course/${course?._id}#${q._id}`}
                                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                                >
                                    <div style={{ marginBottom: '1rem', fontWeight: 500, fontSize: '1.1rem' }}>
                                        {q.text}
                                    </div>
                                </Link>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <Link
                                        to={`/course/${course?._id}#${q._id}`}
                                        style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'none' }}
                                        className="view-course-link"
                                    >
                                        View in Course: {course ? course.title : 'Unknown'}
                                    </Link>

                                    <button
                                        className="btn btn-sm btn-danger-outline"
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent Link click
                                            handleUnflag(q._id);
                                        }}
                                        style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent' }}
                                    >
                                        Unflag
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReviewLater;
