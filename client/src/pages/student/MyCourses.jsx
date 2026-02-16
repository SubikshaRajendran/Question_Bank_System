import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import CourseCard from '../../components/CourseCard';
import { Sparkles, BookOpen, CheckCircle } from 'lucide-react';

const MyCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('in-progress'); // Default to 'in-progress'

    useEffect(() => {
        const loadCourses = async () => {
            if (!user) return;
            try {
                const data = await fetchApi(`/users/${user._id}/registered-courses`);
                setCourses(data);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, [user]);

    if (loading) return <div className="container">Loading...</div>;

    const counts = {
        new: courses.filter(c => (c.progress || 0) === 0).length,
        inProgress: courses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length,
        completed: courses.filter(c => (c.progress || 0) === 100).length
    };

    return (
        <div className="container">
            <h2 className="section-header">My Registered Courses</h2>
            {/* Tabs */}
            <div className="course-tabs" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <button
                    className={`course-tab ${activeTab === 'new' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new')}
                >
                    <Sparkles size={18} />
                    <span>New</span>
                    <span className="tab-count">{counts.new}</span>
                </button>
                <button
                    className={`course-tab ${activeTab === 'in-progress' ? 'active' : ''}`}
                    onClick={() => setActiveTab('in-progress')}
                >
                    <BookOpen size={18} />
                    <span>In Progress</span>
                    <span className="tab-count">{counts.inProgress}</span>
                </button>
                <button
                    className={`course-tab ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    <CheckCircle size={18} />
                    <span>Completed</span>
                    <span className="tab-count">{counts.completed}</span>
                </button>
            </div>

            {(() => {
                const filteredCourses = courses.filter(course => {
                    const progress = course.progress || 0;
                    if (activeTab === 'new') return progress === 0;
                    if (activeTab === 'in-progress') return progress > 0 && progress < 100;
                    if (activeTab === 'completed') return progress === 100;
                    return true;
                });

                if (filteredCourses.length === 0) {
                    return (
                        <div className="no-results fade-in" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                                {activeTab === 'new' ? '🌱' : activeTab === 'in-progress' ? '📚' : '🏆'}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                {activeTab === 'new' ? 'No new courses yet' : activeTab === 'in-progress' ? 'No courses in progress' : 'No completed courses yet'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {activeTab === 'new' ? 'Check out the course catalog to start learning!' :
                                    activeTab === 'in-progress' ? 'Start a course to see it here.' :
                                        'Keep learning to reach your goals!'}
                            </p>
                        </div>
                    );
                }

                return (
                    <div className="student-grid fade-in" key={activeTab}>
                        {filteredCourses.map(course => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                );
            })()}
        </div>
    );
};

export default MyCourses;
