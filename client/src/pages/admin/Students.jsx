import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import { Eye, Search, AlertCircle } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        // Initial load
        fetchStudents();

        // Auto-refresh every 10 seconds silently for real-time activity status
        const intervalId = setInterval(() => {
            fetchStudents(false);
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchStudents = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const data = await fetchApi('/users/admin/students');
            setStudents(data);
        } catch (err) {
            console.error('Failed to fetch students:', err);
            setError('Failed to load students.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredStudents = students.filter(student =>
        student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openDetailsPage = (studentId) => {
        navigate(`/admin/student/${studentId}`);
    };

    const getStats = () => {
        const now = new Date();
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();

        const activeNow = students.filter(student =>
            student.isOnline && student.lastLogin && (new Date() - new Date(student.lastLogin) < 2 * 60 * 1000)
        ).length;

        const activeWeek = students.filter(s => s.lastLogin && new Date(s.lastLogin).getTime() >= weekStart).length;

        return { total: students.length, activeNow, activeWeek };
    };

    const stats = getStats();

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Registered Students</h2>

                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="form-group"
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '9999px', border: '1px solid var(--border-color)', margin: 0, outline: 'none' }}
                        autoComplete="off"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--card-shadow)', border: 'var(--glass-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Total Students</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{stats.total}</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--card-shadow)', border: 'var(--glass-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Active Now</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.activeNow}</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--card-shadow)', border: 'var(--glass-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Active This Week</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.activeWeek}</div>
                </div>
            </div>

            {/* Student List (Card Style) */}
            <div className="student-list">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="spinner"></span> Loading students...
                        </div>
                    </div>
                ) : error ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="no-results" style={{ textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '1rem' }}>
                        <AlertCircle size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>No students found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try searching for a different name.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredStudents.map(student => {
                            const isActive = student.isOnline && student.lastLogin && (new Date() - new Date(student.lastLogin) < 2 * 60 * 1000);

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
                                                background: 'var(--primary-gradient)',
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
                                                {student.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button
                                            onClick={() => openDetailsPage(student._id)}
                                            className="btn-icon-soft"
                                            title="View Profile"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Students;
