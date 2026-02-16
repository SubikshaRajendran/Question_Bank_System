import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { Link } from 'react-router-dom';
import { Flag, ArrowRight, BookOpen, Trash2, ArrowLeft, ExternalLink } from 'lucide-react';

const ReviewLater = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

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

    // Group questions by course
    const questionsByCourse = questions.reduce((acc, q) => {
        const course = q.courseId || q.course;
        if (!course) return acc;

        const courseId = course._id;
        if (!acc[courseId]) {
            acc[courseId] = {
                course: course,
                questions: []
            };
        }
        acc[courseId].questions.push(q);
        return acc;
    }, {});

    const courseList = Object.values(questionsByCourse);

    if (loading) return <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>Loading...</div>;

    // View: Specific Course Questions
    if (selectedCourseId) {
        const courseData = questionsByCourse[selectedCourseId];

        // If no questions left for this course (after unflagging), go back
        if (!courseData || courseData.questions.length === 0) {
            setSelectedCourseId(null);
            return null; // Will re-render with the list view
        }

        const { course, questions: courseQuestions } = courseData;

        return (
            <div className="container">
                <button
                    onClick={() => setSelectedCourseId(null)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        marginBottom: '1.5rem',
                        padding: 0,
                        fontSize: '1rem'
                    }}
                >
                    <ArrowLeft size={20} /> Back to Courses
                </button>

                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {course.title}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        You have {courseQuestions.length} flagged question{courseQuestions.length !== 1 ? 's' : ''} in this course.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {courseQuestions.map(q => (
                        <div key={q._id} className="question-card" style={{
                            padding: '1.5rem',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '1rem',
                            boxShadow: 'var(--card-shadow)'
                        }}>
                            <div style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                {q.text}
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--border-color)',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <Link
                                    to={`/course/${course._id}#${q._id}`}
                                    className="btn btn-sm btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                                >
                                    <ExternalLink size={16} />
                                    View in Course
                                </Link>

                                <button
                                    onClick={() => handleUnflag(q._id)}
                                    className="btn btn-sm"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: 'var(--danger)',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid transparent'
                                    }}
                                >
                                    <Trash2 size={16} />
                                    Unflag Question
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // View: Course List
    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Flag className="text-primary" /> Review Later
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Manage your flagged questions grouped by course.
                </p>
            </div>

            {courseList.length === 0 ? (
                <div className="no-results" style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--card-bg)',
                    borderRadius: '1rem',
                    border: '1px dashed var(--border-color)'
                }}>
                    <Flag size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Flagged Questions</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Items you flag for review will appear here.
                    </p>
                    <Link to="/student/courses" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {courseList.map(({ course, questions }) => (
                        <div key={course._id} className="course-card-modern" style={{
                            background: 'var(--card-bg)',
                            borderRadius: '1.5rem',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '1rem',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    <BookOpen size={16} />
                                    Course
                                </div>
                                <h3 style={{
                                    fontSize: '1.4rem',
                                    fontWeight: '700',
                                    marginBottom: '0.5rem',
                                    color: 'var(--text-color)'
                                }}>
                                    {course.title}
                                </h3>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    color: '#f59e0b',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    marginTop: '0.5rem'
                                }}>
                                    <Flag size={14} fill="currentColor" />
                                    {questions.length} Flagged Question{questions.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <div style={{
                                padding: '1rem 1.5rem',
                                background: 'var(--bg-secondary)',
                                borderTop: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => setSelectedCourseId(course._id)}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    View Flagged Questions <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewLater;
