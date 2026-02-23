import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { Eye, EyeOff, AlertTriangle, GraduationCap, User } from 'lucide-react';

const Login = ({ mode }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const isStudent = mode === 'student';
    const title = isStudent ? 'Student Login' : 'Admin Login';
    const endpoint = isStudent ? '/auth/student/login' : '/auth/admin/login';
    const redirectPath = isStudent ? '/student/dashboard' : '/admin/dashboard';

    useEffect(() => {
        if (isStudent) {
            const storedFails = parseInt(localStorage.getItem('failedLoginAttempts') || '0');
            const storedLockout = parseInt(localStorage.getItem('loginLockoutUntil') || '0');

            if (storedLockout > Date.now()) {
                setLockoutUntil(storedLockout);
                setFailedAttempts(storedFails);
            } else if (storedLockout > 0) {
                localStorage.removeItem('failedLoginAttempts');
                localStorage.removeItem('loginLockoutUntil');
                setFailedAttempts(0);
                setLockoutUntil(null);
            } else {
                setFailedAttempts(storedFails);
            }
        }
    }, [isStudent]);

    useEffect(() => {
        let timer;
        if (lockoutUntil && lockoutUntil > Date.now()) {
            timer = setInterval(() => {
                if (Date.now() > lockoutUntil) {
                    setLockoutUntil(null);
                    setFailedAttempts(0);
                    localStorage.removeItem('failedLoginAttempts');
                    localStorage.removeItem('loginLockoutUntil');
                    clearInterval(timer);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [lockoutUntil]);

    const isLockedOut = lockoutUntil && lockoutUntil > Date.now();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLockedOut) return;

        setError('');
        setLoading(true);
        setShake(false);

        try {
            const data = await fetchApi(endpoint, {
                method: 'POST',
                body: JSON.stringify({ email, password, username }),
            });

            if (data.success) {
                if (isStudent) {
                    localStorage.removeItem('failedLoginAttempts');
                    localStorage.removeItem('loginLockoutUntil');
                }
                login(data.user, isStudent ? 'student' : 'admin');
                navigate(redirectPath);
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (err) {
            const errorMsg = err.message || 'Invalid credentials';

            // Check if account is blocked and redirect
            if (errorMsg.toLowerCase().includes('account has been blocked')) {
                navigate('/account-blocked');
                return;
            }

            setError(errorMsg);
            setShake(true);
            setTimeout(() => setShake(false), 500);

            if (isStudent) {
                const newFails = failedAttempts + 1;
                setFailedAttempts(newFails);
                localStorage.setItem('failedLoginAttempts', newFails.toString());

                if (newFails >= 5) {
                    const lockTime = Date.now() + 5 * 60 * 1000;
                    setLockoutUntil(lockTime);
                    localStorage.setItem('loginLockoutUntil', lockTime.toString());
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const renderLoginForm = () => (
        <div className={`card ${shake ? 'shake' : ''}`}>
            <div className="login-header-wrapper">
                {isStudent && (
                    <div className="login-header-icon">
                        <GraduationCap size={20} className="icon-accent-cap" />
                        <User size={22} className="icon-base-user" />
                    </div>
                )}
                <h2 style={{ margin: 0 }}>{title}</h2>
            </div>

            {isLockedOut && (
                <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--danger)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'var(--danger)'
                }}>
                    <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.4 }}>
                        Too many failed login attempts. Please try again after 5 minutes.
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {!isStudent && (
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter username"
                            disabled={loading || isLockedOut}
                            autoComplete="username"
                        />
                    </div>
                )}

                {isStudent && (
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter student email"
                            disabled={loading || isLockedOut}
                            autoComplete="email"
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter password"
                            disabled={loading || isLockedOut}
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

                {isStudent && (
                    <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                        <Link to="/forgot-password" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 500 }}>
                            Forgot Password?
                        </Link>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn"
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: isLockedOut ? 0.6 : 1 }}
                    disabled={loading || isLockedOut}
                >
                    {loading ? (
                        <>
                            <span className="spinner" style={{ marginRight: '8px' }}></span> Logging in...
                        </>
                    ) : (
                        'Login'
                    )}
                </button>
            </form>

            {error && !isLockedOut && (
                <div className="error-message" style={{ color: 'var(--danger)', marginTop: '1rem', textAlign: 'center', fontWeight: 500 }}>
                    {error}
                </div>
            )}

            {isStudent && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>New user? </span>
                    <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
                        Register
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            {renderLoginForm()}
        </div>
    );
};

export default Login;
