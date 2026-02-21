import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import { ArrowLeft, UserCheck, ShieldBan, AlertCircle, User } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminStudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Block/Unblock Confirmation
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                setLoading(true);
                const data = await fetchApi(`/users/admin/student/${id}`);
                setStudent(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch student:', err);
                setError(err.message || 'Failed to load student details.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDetails();
    }, [id]);

    const handleToggleBlock = async () => {
        if (!student) return;

        try {
            setActionLoading(true);
            const newStatus = !student.isBlocked;
            const res = await fetchApi(`/users/admin/student/${student._id}/block`, {
                method: 'PUT',
                body: JSON.stringify({ isBlocked: newStatus }),
            });

            if (res.success) {
                // Update local state immediately without refresh or back navigation
                setStudent(prev => ({ ...prev, isBlocked: newStatus }));
            }
        } catch (err) {
            console.error('Failed to update student status:', err);
        } finally {
            setShowBlockModal(false);
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <span className="spinner"></span> Loading student profile...
                </div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="container" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/admin/students')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={18} /> Back
                    </button>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)' }}>
                    <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5, margin: '0 auto' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Error Loading Profile</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{error || 'Student not found.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header / Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/admin/students')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={18} /> Back
                </button>

                <button
                    onClick={() => setShowBlockModal(true)}
                    disabled={actionLoading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: '500',
                        borderRadius: '0.5rem',
                        border: `1px solid ${student.isBlocked ? 'var(--success)' : 'var(--danger)'}`,
                        color: student.isBlocked ? 'var(--success)' : 'var(--danger)',
                        background: 'transparent',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        opacity: actionLoading ? 0.7 : 1,
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                        if (!actionLoading) e.currentTarget.style.background = student.isBlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                    title={student.isBlocked ? "Unblock Account" : "Block Account"}
                >
                    {student.isBlocked ? (
                        <><UserCheck size={18} /> Unblock Account</>
                    ) : (
                        <><ShieldBan size={18} /> Block Account</>
                    )}
                </button>
            </div>

            {/* Profile Content Card */}
            <div className="card" style={{ padding: '2.5rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>Student Profile</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Top Row: Avatar Context */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        {student.profilePicture ? (
                            <img
                                src={student.profilePicture}
                                alt="Profile"
                                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
                            />
                        ) : (
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '3px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', boxShadow: 'var(--card-shadow)' }}>
                                <User size={50} />
                            </div>
                        )}
                    </div>

                    {/* Data Grid container aligned exactly exactly to user guidelines */}
                    <div style={{ display: 'grid', gap: '1.25rem', fontSize: '1.05rem' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Full Name:</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{student.fullName || '-'}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Username:</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{student.username || '-'}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Email:</span>
                            <span style={{ color: 'var(--text-color)' }}>{student.email || '-'}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Roll Number:</span>
                            <span style={{ color: 'var(--text-color)' }}>{student.rollNumber || '-'}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Department:</span>
                            <span style={{ color: 'var(--text-color)' }}>{student.department || '-'}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Phone Number:</span>
                            <span style={{ color: 'var(--text-color)' }}>{student.phoneNumber || '-'}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Activity Status:</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                {(() => {
                                    const isActive = student.isOnline && student.lastLogin &&
                                        (new Date() - new Date(student.lastLogin) < 2 * 60 * 1000);

                                    return (
                                        <>
                                            <div style={{
                                                width: '10px', height: '10px', borderRadius: '50%',
                                                background: isActive ? '#10b981' : '#94a3b8',
                                                boxShadow: isActive ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'
                                            }}></div>
                                            <span style={{ color: isActive ? 'var(--success)' : 'var(--text-secondary)' }}>
                                                {isActive ? 'Active (online)' : 'Offline'}
                                            </span>
                                        </>
                                    );
                                })()}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Account Status:</span>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                backgroundColor: student.isBlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: student.isBlocked ? 'var(--danger)' : 'var(--success)'
                            }}>
                                {student.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Registered Date:</span>
                            <span style={{ color: 'var(--text-color)' }}>{new Date(student.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Last Login Date & Time:</span>
                            <span style={{ color: 'var(--text-color)' }}>
                                {student.lastLogin
                                    ? new Date(student.lastLogin).toLocaleString()
                                    : 'Never Logged In'}
                            </span>
                        </div>

                    </div>
                </div>
            </div>

            {/* Block/Unblock Confirmation Modal */}
            <ConfirmationModal
                isOpen={showBlockModal}
                title={student?.isBlocked ? "Unblock Student" : "Block Student"}
                message={student?.isBlocked
                    ? `Are you sure you want to unblock ${student?.username}? They will be allowed to log in again.`
                    : `Are you sure you want to block ${student?.username}? This will immediately prevent them from logging in.`
                }
                onConfirm={handleToggleBlock}
                onCancel={() => setShowBlockModal(false)}
            />
        </div>
    );
};

export default AdminStudentProfile;
