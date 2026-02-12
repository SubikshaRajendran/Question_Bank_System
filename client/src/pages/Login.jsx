import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ mode }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); // Added username state
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const isStudent = mode === 'student';
    const role = isStudent ? 'student' : 'admin';
    const title = isStudent ? 'Student Login' : 'Admin Login';
    const endpoint = isStudent ? '/auth/student/login' : '/auth/admin/login';
    const redirectPath = isStudent ? '/student/dashboard' : '/admin/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setShake(false);

        try {
            const data = await fetchApi(endpoint, {
                method: 'POST',
                body: JSON.stringify({ email, password, username }), // Sending username as well
            });

            if (data.success) {
                login(data.user, role);
                navigate(redirectPath);
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (err) {
            // If the error message is "Invalid Admin Credentials", we want to show that specifically.
            // The API now returns precise messages, so we can just use err.message.
            setError(err.message || 'Invalid credentials');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <div className={`card ${shake ? 'shake' : ''}`}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{title}</h2>

                <form onSubmit={handleSubmit}>
                    {/* Username field for Students - Moved to top */}
                    {isStudent && (
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

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={`Enter ${role} email`}
                            disabled={loading}
                            autoComplete="email"
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
            </div>
        </div>
    );
};

export default Login;
