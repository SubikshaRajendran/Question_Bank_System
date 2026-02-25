import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import CourseCard from '../../components/CourseCard';
import { Search, Filter, User, Bell, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
    const notifDropdownRef = useRef(null);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
                setIsNotifDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const data = await fetchApi(`/users/${user._id}/dashboard-data`);
                setCourses(data.allCourses || []);
                setFilteredCourses(data.allCourses || []);

                const notifs = await fetchApi(`/notifications/user/${user._id}`);
                setNotifications(notifs);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    useEffect(() => {
        let result = courses;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.title.toLowerCase().includes(term) ||
                (c.description && c.description.toLowerCase().includes(term))
            );
        }

        if (difficultyFilter) {
            result = result.filter(c => c.difficulty === difficultyFilter);
        }

        if (departmentFilter) {
            result = result.filter(c => c.department === departmentFilter);
        }

        setFilteredCourses(result);
    }, [searchTerm, difficultyFilter, departmentFilter, courses]);

    const handleNotificationClick = async (notif) => {
        try {
            await fetchApi(`/notifications/${notif._id}/read`, { method: 'PUT' });
            setNotifications(notifications.filter(n => n._id !== notif._id));
            setIsNotifDropdownOpen(false);

            if (notif.type === 'reply') {
                const comment = notif.commentId;
                if (comment && comment.type === 'question') {
                    // Redirect to the Student Comments page on the 'questions' tab
                    navigate('/student/comments', {
                        state: { tab: 'questions', highlightComment: comment._id }
                    });
                } else if (comment && comment.type === 'general') {
                    // Redirect to the Student Comments page on the 'general' tab
                    navigate('/student/comments', {
                        state: { tab: 'general', highlightComment: comment._id }
                    });
                } else {
                    navigate('/student/comments');
                }
            } else if (notif.type === 'new_question' && notif.courseId) {
                if (notif.questionId) {
                    navigate(`/course/${notif.courseId._id}#${notif.questionId}`, {
                        state: { highlightComment: notif.questionId }
                    });
                } else {
                    navigate(`/course/${notif.courseId._id}`);
                }
            }
        } catch (error) {
            console.error("Error marking notification read", error);
        }
    };

    if (loading) {
        return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading courses...</div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Profile Icon / Dropdown */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="btn btn-secondary"
                            style={{
                                padding: 0,
                                borderRadius: '50%',
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer'
                            }}
                            title="Profile Menu"
                        >
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={30} />
                            )}
                        </button>

                        {isDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '110%',
                                left: '0',
                                backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                minWidth: '150px'
                            }}>
                                <Link
                                    to="/student/profile"
                                    onClick={() => setIsDropdownOpen(false)}
                                    style={{
                                        display: 'block',
                                        padding: '0.5rem 1rem',
                                        color: 'var(--text-color)',
                                        textDecoration: 'none',
                                        borderRadius: '4px',
                                        transition: 'background 0.2s',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-secondary)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    Go to Profile
                                </Link>
                            </div>
                        )}
                    </div>
                    <h2 style={{ margin: 0 }}>Learning Dashboard</h2>

                    {/* Notification and Trophy Icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
                        <div style={{ position: 'relative' }} ref={notifDropdownRef}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                                style={{ position: 'relative', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Notifications"
                            >
                                <Bell size={24} />
                                {notifications.length > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-5px', right: '-5px',
                                        background: 'var(--danger)', color: 'white', borderRadius: '50%',
                                        width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: 'bold'
                                    }}>
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {isNotifDropdownOpen && (
                                <div style={{
                                    position: 'absolute', top: '110%', left: 0,
                                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                                    borderRadius: '8px', padding: '0.5rem', minWidth: '300px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Notifications</h4>
                                    {notifications.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                                            {notifications.map(notif => (
                                                <div
                                                    key={notif._id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    style={{
                                                        padding: '0.75rem', background: 'var(--bg-secondary)',
                                                        borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s',
                                                        fontSize: '0.9rem'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                                >
                                                    <strong>{notif.message}</strong>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0, padding: '0.5rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>No new notifications</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Trophy Icon */}
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/student/leaderboard')}
                            style={{ position: 'relative', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Achievements"
                        >
                            <Trophy size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                <div style={{ position: 'relative', flexGrow: 1, minWidth: '300px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '3rem', padding: '0.75rem 1rem 0.75rem 2.8rem', fontSize: '1rem', width: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    />
                </div>

                <div style={{ position: 'relative', minWidth: '200px' }}>
                    <Filter size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        style={{ appearance: 'none', padding: '0.75rem 1rem', fontSize: '1rem', width: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                    >
                        <option value="">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                <div style={{ position: 'relative', minWidth: '200px' }}>
                    <Filter size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        style={{ appearance: 'none', padding: '0.75rem 1rem', fontSize: '1rem', width: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                    >
                        <option value="">All Departments</option>
                        <option value="CS Cluster">CS Cluster</option>
                        <option value="Core">Core</option>
                        <option value="General/Common">General/Common</option>
                    </select>
                </div>
            </div>

            {filteredCourses.length === 0 ? (
                <div className="no-results">
                    <h3>No courses found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="student-grid">
                    {filteredCourses.map(course => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
