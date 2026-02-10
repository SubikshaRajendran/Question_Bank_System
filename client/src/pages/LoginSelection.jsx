import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

const LoginSelection = () => {
    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem', maxWidth: '900px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Choose Login Type</h2>
            <p className="subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Please select your portal to continue
            </p>

            <div className="login-selection-grid">
                <Link to="/login/student" className="card login-card">
                    <div className="card-icon">
                        <GraduationCap size={48} />
                    </div>
                    <h3>Student Login</h3>
                    <p>Access courses and questions</p>
                    <div className="card-action">
                        Login <ArrowRight size={16} />
                    </div>
                </Link>

                <Link to="/login/admin" className="card login-card">
                    <div className="card-icon">
                        <Shield size={48} />
                    </div>
                    <h3>Admin Login</h3>
                    <p>Manage courses and content</p>
                    <div className="card-action">
                        Login <ArrowRight size={16} />
                    </div>
                </Link>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <Link to="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>
            </div>
        </div>
    );
};

export default LoginSelection;
