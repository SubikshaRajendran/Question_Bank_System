import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ mode }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const isStudent = mode === 'student';
    const title = isStudent ? 'Student Login' : 'Admin Login';
    const endpoint = isStudent ? '/auth/student/login' : '/auth/admin/login';
    const redirectPath = isStudent ? '/student/dashboard' : '/admin/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setShake(false);

        // Domain Validation for Students - REMOVED
        // if (isStudent && !email.endsWith('@bitsathy.ac.in')) {
        //     setError('Only @bitsathy.ac.in emails are allowed');
        //     setShake(true);
        //     setTimeout(() => setShake(false), 500);
        //     setLoading(false);
        //     return;
        // }

        try {
            const data = await fetchApi(endpoint, {
                method: 'POST',
                body: JSON.stringify({ email, password, username }),
            });

            if (data.success) {
                login(data.user, isStudent ? 'student' : 'admin');
                navigate(redirectPath);
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'Invalid credentials');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <div className={`card ${shake ? 'shake' : ''}`}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{title}</h2>

                <form onSubmit={handleSubmit}>
                    {/* Username Field - Only for Admin */}
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
                                disabled={loading}
                                autoComplete="username"
                            />
                        </div>
                    )}

                    {/* Email Field - Only for Student */}
                    {isStudent && (
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter student email"
                                disabled={loading}
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

                    <button
                        type="submit"
                        className="btn"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span> Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                {error && (
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
        </div>
    );
};

export default Login;
