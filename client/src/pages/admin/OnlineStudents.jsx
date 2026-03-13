import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import { Eye, Search, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';

const OnlineStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOnline, setTotalOnline] = useState(0);
    const [toast, setToast] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchOnlineStudents();
        const intervalId = setInterval(() => {
            fetchOnlineStudents(false);
        }, 10000); // Refresh every 10s
        return () => clearInterval(intervalId);
    }, [page, searchTerm]);

    const fetchOnlineStudents = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const data = await fetchApi(`/users/admin/students?page=${page}&limit=10&search=${encodeURIComponent(searchTerm)}&filter=Online`);
            setStudents(data.students || []);
            setTotalPages(data.totalPages || 1);
            setTotalOnline(data.counts?.Online || 0);
        } catch (err) {
            console.error('Failed to fetch online students:', err);
            setError('Failed to load online students.');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const openDetailsPage = (studentId) => {
        navigate(`/admin/student/${studentId}`);
    };

    const formatLastActive = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const diff = Math.floor((new Date() - date) / 1000); // seconds
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="container">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => navigate('/admin/students')} 
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div style={{ flexGrow: 1 }}>
                    <h2 style={{ margin: 0 }}>Online Now</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                        {totalOnline} student{totalOnline !== 1 ? 's' : ''} currently active
                    </p>
                </div>

                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search online students..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="form-group"
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '9999px', border: '1px solid var(--border-color)', margin: 0, outline: 'none' }}
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="student-list">
                {loading ? (
                    <div style={{ padding: '4rem 0', position: 'relative' }}>
                        <Loader message="Fetching online status..." />
                    </div>
                ) : error ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
                ) : students.length === 0 ? (
                    <div className="no-results" style={{ textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '1rem', border: 'var(--glass-border)' }}>
                        <Clock size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>No students online</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Currently, there are no students actively using the system.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {students.map(student => (
                            <div key={student._id} className="student-row-card" style={{
                                background: 'var(--card-bg)',
                                padding: '1.25rem',
                                borderRadius: '1rem',
                                boxShadow: 'var(--card-shadow)',
                                border: 'var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                transition: 'transform 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            {student.username ? student.username.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div 
                                            className="status-dot-pulse"
                                            style={{
                                                position: 'absolute',
                                                bottom: '0',
                                                right: '0',
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: '#10b981',
                                                border: '2px solid var(--card-bg)',
                                                zIndex: 1
                                            }} 
                                        />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{student.username}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{student.department || 'N/A Department'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last Activity</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{formatLastActive(student.lastLogin)}</div>
                                    </div>
                                    <button
                                        onClick={() => openDetailsPage(student._id)}
                                        style={{ color: '#10b981', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                    >
                                        <Eye size={22} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
                    <button
                        className="page-btn"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px', opacity: page === 1 ? 0.5 : 1 }}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        className="page-btn"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px', opacity: page === totalPages ? 0.5 : 1 }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default OnlineStudents;
