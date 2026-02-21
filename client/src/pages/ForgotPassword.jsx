import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import { Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const data = await fetchApi('/auth/student/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });

            if (data.success) {
                setSuccess(data.message);
                setStep(2);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError(err.message || 'Error communicating with server');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const data = await fetchApi('/auth/student/reset-password', {
                method: 'POST',
                body: JSON.stringify({ email, otp, newPassword }),
            });

            if (data.success) {
                setSuccess(data.message);
                setTimeout(() => {
                    navigate('/login/student');
                }, 2000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError(err.message || 'Error communicating with server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Forgot Password</h2>

                {error && (
                    <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontWeight: 500 }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message" style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center', fontWeight: 500 }}>
                        {success}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter registered email"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            disabled={loading}
                        >
                            {loading ? <span className="spinner"></span> : null}
                            Send OTP
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                placeholder="6-digit OTP"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Enter new password"
                                    disabled={loading}
                                    minLength="4"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm new password"
                                    disabled={loading}
                                    minLength="4"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            disabled={loading}
                        >
                            {loading ? <span className="spinner"></span> : null}
                            Reset Password
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link to="/login/student" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
