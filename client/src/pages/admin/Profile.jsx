import React, { useState, useEffect, useRef } from 'react';
import { fetchApi } from '../../utils/api';
import Toast from '../../components/Toast';
import { User, Lock, Save, ArrowLeft, Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminProfile = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = Verify, 2 = Edit
    const [currentAdminUsername, setCurrentAdminUsername] = useState('');

    // Form States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Editable States
    const [isUsernameEditable, setIsUsernameEditable] = useState(false);
    const [isPasswordEditable, setIsPasswordEditable] = useState(false);

    const usernameInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load username from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.username) {
                    setCurrentAdminUsername(parsed.username);
                    setNewUsername(parsed.username);
                }
            } catch (e) {
                console.error("Error parsing stored user", e);
            }
        }
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetchApi('/auth/admin/verify-password', {
                method: 'POST',
                body: JSON.stringify({ username: currentAdminUsername, password: currentPassword })
            });
            if (res.success) {
                setStep(2);
            } else {
                setError(res.message || 'Incorrect password');
            }
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (newPassword && newPassword.length < 4) {
            setError("Password must be at least 4 characters");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetchApi('/auth/admin/update-profile', {
                method: 'PUT',
                body: JSON.stringify({
                    currentUsername: currentAdminUsername,
                    newUsername,
                    newPassword: newPassword || undefined
                })
            });
            if (res.success) {
                setToast({ message: 'Profile updated successfully!', type: 'success' });
                // Update localStorage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    parsed.username = res.username;
                    localStorage.setItem('user', JSON.stringify(parsed));
                }
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 1500);
            } else {
                setError(res.message || 'Update failed');
            }
        } catch (err) {
            setError(err.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '50%' }}>
                        <User size={32} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Admin Profile</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage your account settings</p>
                    </div>
                </div>

                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleVerify}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ marginBottom: '1rem' }}>For security, please verify your identity by entering your current password.</p>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    autoFocus
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleUpdate}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                    ref={usernameInputRef}
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => {
                                        if (isUsernameEditable) setNewUsername(e.target.value);
                                    }}
                                    readOnly={!isUsernameEditable}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingRight: '2.5rem',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-color)',
                                        color: 'var(--text-color)',
                                        opacity: 1,
                                        cursor: isUsernameEditable ? 'text' : 'default',
                                        outline: isUsernameEditable ? '' : 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsUsernameEditable(!isUsernameEditable);
                                        if (!isUsernameEditable) {
                                            setTimeout(() => usernameInputRef.current?.focus(), 0);
                                        }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '4px'
                                    }}
                                    title={isUsernameEditable ? "Close edit" : "Edit username"}
                                    tabIndex="-1"
                                >
                                    {isUsernameEditable ? <X size={18} /> : <Edit2 size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ margin: '2rem 0', borderTop: '1px solid var(--border-color)' }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Change Password</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsPasswordEditable(!isPasswordEditable);
                                    if (!isPasswordEditable) {
                                        setTimeout(() => passwordInputRef.current?.focus(), 0);
                                    } else {
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}
                                title={isPasswordEditable ? "Close change password" : "Edit password"}
                            >
                                {isPasswordEditable ? <X size={18} /> : <Edit2 size={18} />}
                            </button>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>New Password (Optional)</label>
                            <input
                                ref={passwordInputRef}
                                type="password"
                                value={newPassword}
                                onChange={(e) => {
                                    if (isPasswordEditable) setNewPassword(e.target.value);
                                }}
                                readOnly={!isPasswordEditable}
                                placeholder={isPasswordEditable ? "Enter new password" : "••••••••"}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-color)',
                                    opacity: 1,
                                    cursor: isPasswordEditable ? 'text' : 'default',
                                    outline: isPasswordEditable ? '' : 'none'
                                }}
                            />
                        </div>

                        {(newPassword || isPasswordEditable) && (
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        if (isPasswordEditable) setConfirmPassword(e.target.value);
                                    }}
                                    readOnly={!isPasswordEditable}
                                    required={!!newPassword}
                                    placeholder={isPasswordEditable ? "Confirm new password" : "••••••••"}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-color)',
                                        color: 'var(--text-color)',
                                        opacity: 1,
                                        cursor: isPasswordEditable ? 'text' : 'default',
                                        outline: isPasswordEditable ? '' : 'none'
                                    }}
                                />
                            </div>
                        )}

                        {(isUsernameEditable || isPasswordEditable) && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
                                    <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminProfile;
