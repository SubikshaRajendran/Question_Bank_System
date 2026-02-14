import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import Toast from '../../components/Toast';
import { User, Lock, Save, ArrowLeft, Camera, Mail, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    // Edit Mode States
    const [isAccountEditing, setIsAccountEditing] = useState(false);
    const [isProfileEditing, setIsProfileEditing] = useState(false);

    // Account Settings State
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountError, setAccountError] = useState('');

    // Profile Details State
    const [fullName, setFullName] = useState('');
    const [department, setDepartment] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const isProfileComplete = user?.fullName && user?.department && user?.phoneNumber;

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setFullName(user.fullName || '');
            setDepartment(user.department || '');
            setPhoneNumber(user.phoneNumber || '');
            setPreviewUrl(user.profilePicture || '');
        }
    }, [user]);

    const handleAccountUpdate = async (e) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            setAccountError("Passwords do not match");
            return;
        }
        setLoading(true);
        setAccountError('');

        const formData = new FormData();
        formData.append('username', username);
        if (newPassword) formData.append('newPassword', newPassword);

        try {
            const res = await fetch(`/api/users/${user._id}/profile`, {
                method: 'PUT',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                setToast({ message: 'Account settings updated!', type: 'success' });
                login(data.user, 'student');
                setNewPassword('');
                setConfirmPassword('');
                setIsAccountEditing(false); // Exit edit mode
            } else {
                setAccountError(data.message || 'Update failed');
            }
        } catch (err) {
            setAccountError(err.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('department', department);
        formData.append('phoneNumber', phoneNumber);
        if (profilePicFile) {
            formData.append('profilePicture', profilePicFile);
        }

        try {
            const res = await fetch(`/api/users/${user._id}/profile`, {
                method: 'PUT',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                setToast({ message: 'Profile details saved!', type: 'success' });
                login(data.user, 'student');
                setIsProfileEditing(false); // Exit edit mode
            } else {
                setToast({ message: data.message || 'Failed to save profile', type: 'error' });
            }
        } catch (err) {
            setToast({ message: err.message || 'Failed to save profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <button onClick={() => navigate('/student/dashboard')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <h2 style={{ marginBottom: '2rem' }}>Student Profile</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

                {/* Account Settings Section */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Account Settings</h3>
                        {!isAccountEditing && (
                            <button onClick={() => setIsAccountEditing(true)} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Edit Account">
                                <Pencil size={18} />
                            </button>
                        )}
                    </div>

                    {accountError && <div className="error-message" style={{ marginBottom: '1rem', color: 'red' }}>{accountError}</div>}

                    <form onSubmit={handleAccountUpdate}>
                        <div className="form-group">
                            <label>Email (Read Only)</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }} />
                                <input type="text" value={user?.email || ''} disabled style={{ width: '100%', paddingLeft: '2.5rem', background: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={!isAccountEditing}
                                required
                                style={{ width: '100%', cursor: isAccountEditing ? 'text' : 'default', backgroundColor: isAccountEditing ? 'var(--bg-color)' : 'var(--bg-secondary)' }}
                            />
                        </div>

                        {isAccountEditing && (
                            <>
                                <div className="form-group">
                                    <label>New Password (Optional)</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Leave blank to keep current"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                {newPassword && (
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setIsAccountEditing(false)} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn" disabled={loading}>
                                        <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Changes
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>

                {/* Profile Details Section */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>{isProfileComplete ? 'Edit Profile' : 'Complete My Profile'}</h3>
                        {!isProfileEditing && (
                            <button onClick={() => setIsProfileEditing(true)} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Edit Profile">
                                <Pencil size={18} />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleProfileUpdate}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', background: '#ccc', marginBottom: '1rem', position: 'relative' }}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                                        <User size={50} />
                                    </div>
                                )}
                            </div>
                            {isProfileEditing && (
                                <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Camera size={18} /> Change Photo
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={!isProfileEditing}
                                    style={{ width: '100%', cursor: isProfileEditing ? 'text' : 'default', backgroundColor: isProfileEditing ? 'var(--bg-color)' : 'var(--bg-secondary)' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    disabled={!isProfileEditing}
                                    style={{ width: '100%', cursor: isProfileEditing ? 'text' : 'default', backgroundColor: isProfileEditing ? 'var(--bg-color)' : 'var(--bg-secondary)' }}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={!isProfileEditing}
                                    style={{ width: '100%', cursor: isProfileEditing ? 'text' : 'default', backgroundColor: isProfileEditing ? 'var(--bg-color)' : 'var(--bg-secondary)' }}
                                />
                            </div>
                        </div>

                        {isProfileEditing && (
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setIsProfileEditing(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn" disabled={loading}>
                                    <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Profile Details
                                </button>
                            </div>
                        )}
                    </form>
                </div>

            </div>
        </div>
    );
};

export default StudentProfile;
