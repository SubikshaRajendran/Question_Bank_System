import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const QuizView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // answers shape: { "questionId": "A", "questionId2": "C" }
    const [answers, setAnswers] = useState({});

    // Result State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState(null); // { score, totalQuestions, percentage, performanceMessage, performanceLevel, attemptNumber, previousScore, difference }
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // History State
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const getPerformanceColor = (level) => {
        switch (level) {
            case 'excellent': return 'var(--success, #10b981)'; // Green
            case 'very_good': return 'var(--primary-color, #3b82f6)'; // Blue
            case 'good': return '#14b8a6'; // Teal
            case 'average': return 'var(--warning, #f59e0b)'; // Orange
            case 'poor': return 'var(--danger, #ef4444)'; // Red
            default: return 'var(--text-secondary)';
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [courseData, quizData] = await Promise.all([
                    fetchApi(`/courses/${id}`),
                    fetchApi(`/quiz/student/course/${id}`)
                ]);

                if (!courseData.course) throw new Error("Course not found");

                setCourse(courseData.course);
                setQuestions(quizData || []);
            } catch (err) {
                console.error("Failed to load quiz data", err);
            } finally {
                setLoading(false);
            }
        };

        if (user && id) {
            loadData();
        }
    }, [id, user]);

    const handleOptionSelect = (qId, optionAlphabet) => {
        if (quizResult) return; // Prevent changing answers after submission
        setAnswers({
            ...answers,
            [qId]: optionAlphabet
        });
    };

    const handleSubmit = async () => {
        // Validation check
        const unansweredCount = questions.length - Object.keys(answers).length;
        if (unansweredCount > 0) {
            if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const res = await fetchApi('/quiz/student/submit', {
                method: 'POST',
                body: JSON.stringify({
                    studentId: user._id,
                    courseId: id,
                    answers
                })
            });

            if (res.success) {
                setQuizResult({
                    score: res.score,
                    totalQuestions: res.totalQuestions,
                    percentage: res.percentage,
                    performanceMessage: res.performanceMessage,
                    performanceLevel: res.performanceLevel,
                    attemptNumber: res.attemptNumber,
                    previousScore: res.previousScore,
                    difference: res.difference
                });

                // Confetti if they pass!
                if (res.percentage >= 60) {
                    confetti({
                        particleCount: 150,
                        spread: 100,
                        origin: { y: 0.6 }
                    });
                }

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit quiz!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadHistory = async () => {
        setLoadingHistory(true);
        setShowHistory(true);
        try {
            const data = await fetchApi(`/quiz/student/course/${id}/attempts?studentId=${user._id}`);
            if (Array.isArray(data)) {
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to load attempt history", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '3rem', textAlign: 'center' }}>Loading Quiz Details...</div>;
    if (!course) return <div className="container">Course not found.</div>;

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link to={`/course/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem', width: 'fit-content' }}>
                    <ArrowLeft size={18} /> Back to Course
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {course.image && (
                        <img src={`${course.image}`} alt={course.title} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0' }}>Quiz: {course.title}</h1>
                        <span style={{ color: 'var(--text-secondary)' }}>{questions.length} Questions</span>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {questions.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>No Quiz Available</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>The instructor has not added a quiz for this course yet.</p>
                    <button className="btn btn-secondary" onClick={() => navigate(`/course/${id}`)}>Go Back</button>
                </div>
            )}

            {/* Results Header (If Submitted) */}
            {quizResult && (
                <div className="card" style={{
                    marginBottom: '2rem',
                    textAlign: 'center',
                    background: quizResult.percentage >= 60 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `2px solid ${quizResult.percentage >= 60 ? '#10b981' : '#ef4444'}`,
                    padding: '2rem'
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <span style={{
                            background: 'var(--bg-color)',
                            color: 'var(--text-secondary)',
                            padding: '0.5rem 1rem',
                            borderRadius: '2rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            border: '1px solid var(--border-color)'
                        }}>
                            Attempt {quizResult.attemptNumber}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        {quizResult.percentage >= 60 ? (
                            <CheckCircle size={64} color="#10b981" />
                        ) : (
                            <XCircle size={64} color="#ef4444" />
                        )}
                    </div>
                    <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: quizResult.percentage >= 60 ? '#10b981' : '#ef4444' }}>
                        {quizResult.percentage}%
                    </h2>
                    <p style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', fontWeight: 600 }}>
                        Current Score: {quizResult.score} / {quizResult.totalQuestions}
                    </p>

                    {quizResult.previousScore !== null && (
                        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'inline-block', textAlign: 'left' }}>
                            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Previous Score: <strong>{quizResult.previousScore} / {quizResult.totalQuestions}</strong></div>

                            {quizResult.difference > 0 && (
                                <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Improved by +{quizResult.difference} points since your last attempt. Great progress!
                                </div>
                            )}
                            {quizResult.difference < 0 && (
                                <div style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Decreased by {Math.abs(quizResult.difference)} points since your last attempt. Keep practicing.
                                </div>
                            )}
                            {quizResult.difference === 0 && (
                                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    No change from your last attempt.
                                </div>
                            )}
                        </div>
                    )}

                    {quizResult.previousScore === null && (
                        <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            This is your first quiz attempt.
                        </div>
                    )}

                    <div style={{
                        fontSize: '1.35rem',
                        fontWeight: 'bold',
                        marginBottom: '1.5rem',
                        color: getPerformanceColor(quizResult.performanceLevel),
                        padding: '1rem',
                        background: 'var(--bg-color)',
                        borderRadius: '0.5rem',
                        border: `1px solid ${getPerformanceColor(quizResult.performanceLevel)}`,
                        display: 'inline-block'
                    }}>
                        {quizResult.performanceMessage}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={loadHistory}>View Attempt History</button>
                        <button className="btn" onClick={() => navigate('/student/courses')}>Back to My Courses</button>
                    </div>
                </div>
            )}

            {/* Question Display & Navigator */}
            {!quizResult && questions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', marginBottom: '3rem' }}>

                    {/* Left: Current Question Area */}
                    <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                        <div className="card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
                                <span style={{ color: 'var(--primary-color)', marginRight: '0.5rem' }}>{currentQuestionIndex + 1}.</span>
                                {questions[currentQuestionIndex].question}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    { letter: 'A', text: questions[currentQuestionIndex].optionA },
                                    { letter: 'B', text: questions[currentQuestionIndex].optionB },
                                    { letter: 'C', text: questions[currentQuestionIndex].optionC },
                                    { letter: 'D', text: questions[currentQuestionIndex].optionD }
                                ].map((opt) => {
                                    const qId = questions[currentQuestionIndex]._id;
                                    const isSelected = answers[qId] === opt.letter;
                                    return (
                                        <div
                                            key={opt.letter}
                                            onClick={() => handleOptionSelect(qId, opt.letter)}
                                            style={{
                                                padding: '1rem 1.25rem',
                                                border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                                borderRadius: '0.75rem',
                                                background: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-color)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                transition: 'all 0.2s ease',
                                                fontWeight: isSelected ? 600 : 400
                                            }}
                                        >
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--text-secondary)'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                color: isSelected ? 'white' : 'var(--text-secondary)',
                                                background: isSelected ? 'var(--primary-color)' : 'transparent'
                                            }}>
                                                {opt.letter}
                                            </div>
                                            <div style={{ fontSize: '1rem', wordBreak: 'break-word' }}>{opt.text}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                            <button
                                className="btn btn-secondary"
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            >
                                Previous
                            </button>

                            {currentQuestionIndex < questions.length - 1 ? (
                                <button
                                    className="btn"
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    className="btn"
                                    disabled={isSubmitting || Object.keys(answers).length === 0}
                                    onClick={handleSubmit}
                                    style={{ background: 'var(--success)' }}
                                >
                                    {isSubmitting ? 'Grading...' : 'Submit Quiz'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Question Navigator Panel */}
                    <div className="card" style={{ flex: '1 1 250px', position: 'sticky', top: '2rem', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Navigator</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>Answered: <strong style={{ color: 'var(--success)' }}>{Object.keys(answers).length}</strong></span>
                            <span>Remaining: <strong>{questions.length - Object.keys(answers).length}</strong></span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                            {questions.map((q, i) => {
                                const isAnswered = !!answers[q._id];
                                const isCurrent = i === currentQuestionIndex;
                                return (
                                    <button
                                        key={q._id}
                                        onClick={() => setCurrentQuestionIndex(i)}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: '0.5rem',
                                            border: isCurrent ? '2px solid var(--primary-color)' : `1px solid ${isAnswered ? 'var(--success)' : 'var(--border-color)'}`,
                                            background: isCurrent ? 'var(--bg-color)' : isAnswered ? 'var(--success)' : 'var(--bg-color)',
                                            color: isAnswered && !isCurrent ? 'white' : 'var(--text-color)',
                                            fontWeight: isCurrent || isAnswered ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                        }}
                                        title={isAnswered ? 'Answered' : 'Not Answered'}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            )}

            {/* History Modal */}
            {showHistory && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Quiz Attempt History</h2>
                            <button onClick={() => setShowHistory(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        {loadingHistory ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading history...</div>
                        ) : history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No previous attempts found.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {history.map((attempt) => (
                                    <div key={attempt._id} style={{
                                        padding: '1rem',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '0.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Attempt {attempt.attemptNumber}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {new Date(attempt.date).toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem',
                                                color: attempt.percentage >= 60 ? 'var(--success)' : 'var(--danger)'
                                            }}>
                                                {attempt.score} / {attempt.totalQuestions}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {attempt.percentage}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizView;
