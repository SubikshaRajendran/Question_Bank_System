import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { Users, Search, Calendar, Mail, CheckCircle, Clock } from 'lucide-react';


const StudentActivity = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const data = await fetchApi('/users');
            if (Array.isArray(data)) {
                setStudents(data);
            } else {
                throw new Error('Invalid data format received');
            }
        } catch (err) {
            console.error('Failed to load students:', err);
            setError(`Failed to load student activity data. (${err.message})`);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
    (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Helpers
    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        }
        if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return days === 1 ? 'Yesterday' : `${days} days ago`;
        }

        // Fallback to strict format for older dates
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
    };

    // Stats Calculation
    const getStats = () => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();

        const activeToday = students.filter(s => s.lastLogin && new Date(s.lastLogin).getTime() >= todayStart).length;
        const activeWeek = students.filter(s => s.lastLogin && new Date(s.lastLogin).getTime() >= weekStart).length;

        return { total: students.length, activeToday, activeWeek };
    };

    const stats = getStats();

    if (loading) return <div className="text-center p-5">Loading student activity...</div>;
    if (error) return <div className="text-center p-5 text-danger">{error}</div>;

    const currentActiveCount = students.filter(student =>
        student.isOnline && student.lastLogin && (new Date() - new Date(student.lastLogin) < 2 * 60 * 1000)
    ).length;

    return (
        <div className="student-activity-page">
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                        <Users size={32} />
                        Student Activity
                    </h1>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>Track registered students and their recent login activity.</p>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--card-shadow)', border: 'var(--glass-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Total Students</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{stats.total}</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--card-shadow)', border: 'var(--glass-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Active Today</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.activeToday}</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--card-shadow)', border: 'var(--glass-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Active This Week</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.activeWeek}</div>
                </div>
            </div>

            {/* Active Now Info Box */}
            <div style={{
                background: currentActiveCount > 0 ? 'rgba(16, 185, 129, 0.08)' : 'var(--card-bg)',
                border: currentActiveCount > 0 ? '1px solid rgba(16, 185, 129, 0.2)' : 'var(--glass-border)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-color)',
                fontSize: '0.95rem',
                fontWeight: '500',
                boxShadow: currentActiveCount === 0 ? 'var(--card-shadow)' : 'none'
            }}>
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentActiveCount > 0 ? '#10b981' : '#4b5563',
                    boxShadow: currentActiveCount > 0 ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none'
                }}></div>
                {currentActiveCount} student{currentActiveCount !== 1 ? 's' : ''} active
            </div>

            {/* Search Bar */}
            <div className="search-section" style={{ marginBottom: '2rem' }}>
                <div className="search-box-modern" style={{
                    background: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    maxWidth: '100%'
                }}>
                    <Search size={22} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search students by name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '1rem',
                            background: 'transparent',
                            color: 'var(--text-color)'
                        }}
                    />
                </div>
            </div>

            {/* Student List (Card Style) */}
            <div className="student-list">
                {filteredStudents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredStudents.map(student => {
                            // Active if isOnline is true AND lastLogin was within 2 minutes
                            const isActive = student.isOnline && student.lastLogin && (new Date() - new Date(student.lastLogin) < 2 * 60 * 1000);
                            let relativeTime = formatRelativeTime(student.lastLogin);
                            if (!isActive && relativeTime === 'Just now') {
                                relativeTime = '1 min ago';
                            }

                            return (
                                <div key={student._id} className="student-row-card" style={{
                                    background: 'var(--card-bg)',
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    boxShadow: 'var(--card-shadow)',
                                    border: 'var(--glass-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '1rem',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '250px', flex: 1 }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{
                                                width: '45px',
                                                height: '45px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem'
                                            }}>
                                                {student.username ? student.username.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '0',
                                                right: '0',
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: isActive ? '#10b981' : '#94a3b8',
                                                border: '2px solid var(--card-bg)'
                                            }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-color)' }}>
                                                {student.username || 'Unknown'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                <Mail size={14} />
                                                {student.email}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Activity */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: isActive ? '#10b981' : '#94a3b8',
                                            boxShadow: isActive ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'
                                        }}></div>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                            {isActive ? (
                                                'Active Now'
                                            ) : (
                                                relativeTime
                                            )}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-results" style={{ textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '1rem' }}>
                        <Users size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>No students found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try searching for a different name or email.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentActivity;
