import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Set Account
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const showError = (msg) => {
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // if (!email.endsWith('@bitsathy.ac.in')) {
        //     showError('Only @bitsathy.ac.in emails are allowed');
        //     setLoading(false);
        //     return;
        // }

        try {
            const data = await fetchApi('/auth/student/register-init', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            if (data.success) {
                setStep(2);
            } else {
                showError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            showError(err.message || 'Error sending OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await fetchApi('/auth/student/register-verify', {
                method: 'POST',
                body: JSON.stringify({ email, otp })
            });

            if (data.success) {
                setStep(3);
            } else {
                showError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            showError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (username.length < 3) {
            showError('Username must be at least 3 characters');
            setLoading(false);
            return;
        }
        if (password.length < 4) {
            showError('Password must be at least 4 characters');
            setLoading(false);
            return;
        }

        try {
            const data = await fetchApi('/auth/student/register-complete', {
                method: 'POST',
                body: JSON.stringify({ email, otp, username, password })
            });

            if (data.success) {
                login(data.user, 'student');
                navigate('/student/dashboard');
            } else {
                showError(data.message || 'Registration failed');
            }
        } catch (err) {
            showError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <div className={`card ${shake ? 'shake' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '0.5rem', display: 'flex' }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h2 style={{ flex: 1, textAlign: 'center', margin: 0 }}>
                        {step === 1 ? 'Student Registration' : step === 2 ? 'Verify Email' : 'Set Account'}
                    </h2>
                    {step > 1 && <div style={{ width: '40px' }}></div>} {/* Spacer for centering */}
                </div>

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Enter the 6-digit code sent to<br /><strong>{email}</strong>
                        </p>
                        <div className="form-group">
                            <label htmlFor="otp">OTP Code</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                required
                                placeholder="000000"
                                maxLength={6}
                                style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.5rem' }}
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}

                {/* Step 3: Account Details */}
                {step === 3 && (
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Choose a username"
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Create password"
                                    disabled={loading}
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
                        <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Complete Registration'}
                        </button>
                    </form>
                )}

                {error && (
                    <div className="error-message" style={{ color: 'var(--danger)', marginTop: '1rem', textAlign: 'center', fontWeight: 500 }}>
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                        <Link to="/login/student" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
