import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Book, Code, Calculator, FlaskConical, Globe, Brain, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';

const CourseCard = ({ course }) => {
    const [showDesc, setShowDesc] = useState(false);
    const [registering, setRegistering] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const { title, description, difficulty, tags, progress = 0, isRegistered: initialIsRegistered, _id } = course;
    const [isRegistered, setIsRegistered] = useState(initialIsRegistered);

    // Difficulty Badge Color
    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'Easy': return 'difficulty-Easy';
            case 'Medium': return 'difficulty-Medium';
            case 'Hard': return 'difficulty-Hard';
            default: return '';
        }
    };

    // Icon Selection Logic
    const getIcon = () => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('math') || lowerTitle.includes('algebra')) return <Calculator size={40} color="#4f46e5" />;
        if (lowerTitle.includes('science') || lowerTitle.includes('physics') || lowerTitle.includes('chemistry')) return <FlaskConical size={40} color="#10b981" />;
        if (lowerTitle.includes('history') || lowerTitle.includes('geo')) return <Globe size={40} color="#f59e0b" />;
        if (lowerTitle.includes('code') || lowerTitle.includes('program') || lowerTitle.includes('data')) return <Code size={40} color="#ef4444" />;
        if (lowerTitle.includes('logic') || lowerTitle.includes('reasoning')) return <Brain size={40} color="#8b5cf6" />;
        return <Book size={40} color="#4f46e5" />;
    };

    // Progress Color Logic
    let progressClass = 'progress-blue';
    if (progress < 30) progressClass = 'progress-orange';
    else if (progress >= 100) progressClass = 'progress-green';

    // Button Logic
    const handleRegister = async () => {
        if (!user) return;
        setRegistering(true);
        try {
            await fetchApi(`/users/${user._id}/register-course`, {
                method: 'POST',
                body: JSON.stringify({ courseId: _id })
            });
            setIsRegistered(true);
        } catch (err) {
            console.error("Registration failed", err);
            alert("Failed to register for course: " + err.message);
        } finally {
            setRegistering(false);
        }
    };

    const handleMainClick = () => {
        if (isRegistered) {
            navigate(`/course/${_id}`);
        } else {
            handleRegister();
        }
    };

    let btnText = isRegistered ? 'Continue' : 'Register';
    if (isRegistered && progress === 100) btnText = 'Done';
    if (isRegistered && progress === 0) btnText = 'Start';

    return (
        <div className="bento-box" style={{ minHeight: '240px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {course.image && (
                <div style={{ width: '100%', aspectRatio: '16/9', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                    <img
                        src={`http://localhost:3000${course.image}`}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            )}
            <div className="course-card-content" style={{ padding: '0.8rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                    <div className="bento-meta" style={{ marginBottom: 0 }}>
                        {difficulty && (
                            <span className={`difficulty-badge ${getDifficultyColor(difficulty)}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                {difficulty}
                            </span>
                        )}
                    </div>
                </div>

                <h3 className="bento-title" style={{ fontSize: '1rem', marginBottom: '0.3rem', lineHeight: '1.2' }}>{title}</h3>

                {tags && (
                    <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                        {tags.map((tag, idx) => (
                            <span key={idx} className="tag" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>#{tag}</span>
                        ))}
                    </div>
                )}

                {/* Description Toggle */}
                <div className={`course-desc-hidden ${showDesc ? 'show-desc' : ''}`}>
                    {description || 'No description available.'}
                </div>

                {/* Progress Bar (Bottom Spacer Wrapper) */}
                {isRegistered ? (
                    <div className="bottom-spacer progress-wrapper" style={{ marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.1rem' }}>
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="progress-container" style={{ margin: '0.2rem 0', height: '0.4rem' }}>
                            <div className={`progress-bar ${progressClass}`} style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <div className="bottom-spacer" style={{ marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        Click register to start.
                    </div>
                )}

                <div className="bento-actions" style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowDesc(!showDesc)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    >
                        <Info size={14} /> Info
                    </button>
                    <button
                        className={`btn btn-sm ${!isRegistered ? 'btn-danger-dark' : ''}`}
                        style={{ flexGrow: 1, backgroundColor: !isRegistered ? '#10b981' : '', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={handleMainClick}
                        disabled={registering}
                    >
                        {registering ? '...' : btnText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
