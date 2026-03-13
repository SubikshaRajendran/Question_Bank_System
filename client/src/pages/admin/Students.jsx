import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import { Eye, Search, AlertCircle, ShieldAlert } from 'lucide-react';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTab, setFilterTab] = useState('All'); // 'All', 'Active' (Enabled), 'Blocked'
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [counts, setCounts] = useState({ All: 0, Active: 0, Blocked: 0 });
    const [toast, setToast] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        setPage(1);
    }, [searchTerm, filterTab]);

    useEffect(() => {
        // Initial load and whenever dependencies change
        fetchStudents();

        // Auto-refresh every 10 seconds silently for real-time activity status
        const intervalId = setInterval(() => {
            fetchStudents(false);
        }, 10000);

        return () => clearInterval(intervalId);
    }, [page, searchTerm, filterTab]);

    const fetchStudents = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const data = await fetchApi(`/users/admin/students?page=${page}&limit=10&search=${encodeURIComponent(searchTerm)}&filter=${filterTab}`);
            setStudents(data.students || []);
            setTotalPages(data.totalPages || 1);
            setCounts(data.counts || { All: 0, Active: 0, Blocked: 0 });
        } catch (err) {
            console.error('Failed to fetch students:', err);
            setError('Failed to load students.');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredStudents = students; // Filtering is now done on server side

    const handleUnblock = async (studentId) => {
        try {
            const data = await fetchApi(`/users/admin/student/${studentId}/block`, {
                method: 'PUT',
                body: JSON.stringify({ isBlocked: false })
            });

            if (data.success) {
                // Update local state to remove the block flag instantly
                setStudents(students.map(s => s._id === studentId ? { ...s, isBlocked: false } : s));
                setToast({ message: 'Student has been unblocked. The student must register again.', type: 'success' });
            } else {
                setToast({ message: data.message || 'Failed to unblock student', type: 'error' });
            }
        } catch (err) {
            console.error('Failed to unblock student', err);
            setToast({ message: err.message || 'Error occurred.', type: 'error' });
        }
    };

    const openDetailsPage = (studentId) => {
        navigate(`/admin/student/${studentId}`);
    };

    const stats = {
        total: counts.All,
        activeNow: counts.Online, // Use backend count instead of local filtering
        activeWeek: counts.Active // Approximate or we could fetch more specific stats
    };

    return (
        <div className="container">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Registered Students</h2>
                </div>

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

            {/* Filter Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                marginBottom: '2.5rem', 
                background: 'rgba(0,0,0,0.03)', 
                padding: '0.4rem', 
                borderRadius: '1rem',
                width: 'fit-content',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid var(--border-color)'
            }}>
                {['All', 'Active', 'Blocked'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilterTab(tab)}
                        style={{
                            padding: '0.75rem 1.75rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: filterTab === tab
                                ? (tab === 'Blocked' ? '#ef4444' : 'var(--primary-color)')
                                : 'transparent',
                            color: filterTab === tab ? 'white' : 'var(--text-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: filterTab === tab ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                            fontSize: '1rem',
                            transform: filterTab === tab ? 'scale(1.02)' : 'scale(1)'
                        }}
                    >
                        {tab === 'Blocked' && filterTab === tab && <ShieldAlert size={18} />}
                        {tab === 'Active' ? 'Enabled' : tab}
                        <span style={{ 
                            background: filterTab === tab ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '9999px', 
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            marginLeft: '0.25rem'
                        }}>
                            {tab === 'All' ? counts.All : tab === 'Active' ? counts.Active : counts.Blocked}
                        </span>
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--card-shadow)', border: 'var(--glass-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Total Students</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{stats.total}</div>
                </div>
                <div 
                    className="stat-card" 
                    onClick={() => navigate('/admin/students/online')}
                    style={{ 
                        background: 'var(--card-bg)', 
                        padding: '1.5rem', 
                        borderRadius: '1rem', 
                        boxShadow: 'var(--card-shadow)', 
                        border: 'var(--glass-border)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Online Now</div>
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
                    <div style={{ padding: '4rem 0', position: 'relative' }}>
                        <Loader message="Loading students..." />
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

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {student.isBlocked && (
                                            <>
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: 'white',
                                                    backgroundColor: 'var(--danger)',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px'
                                                }}>
                                                    Blocked
                                                </span>
                                                <button
                                                    onClick={() => handleUnblock(student._id)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                                                    title="Unblock User"
                                                >
                                                    Unblock
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => openDetailsPage(student._id)}
                                            title="View Profile"
                                            style={{
                                                color: student.isBlocked ? 'var(--danger)' : '#10b981',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0.2rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'opacity 0.2s',
                                                opacity: 0.8
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
                                        >
                                            <Eye size={22} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
                    <button
                        className="page-btn"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        className="page-btn"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                    >
                        Next
                    </button>
                </div>
            )}

        </div>
    );
};

export default Students;
