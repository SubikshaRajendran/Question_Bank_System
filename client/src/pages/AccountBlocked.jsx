import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const AccountBlocked = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: 'var(--bg-color)',
            textAlign: 'center'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                color: 'var(--primary-color)'
            }}>
                <ShieldAlert size={100} strokeWidth={1.2} />
            </div>

            <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                color: 'var(--text-color)',
                marginBottom: '1rem',
                letterSpacing: '-1px',
                lineHeight: '1.2'
            }}>
                Account Blocked
            </h1>

            <p style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                marginBottom: '2.5rem',
                fontSize: '1.15rem',
                maxWidth: '600px'
            }}>
                Your access has been restricted by the administrator. Please contact the administrator to unblock your account.
            </p>

            <div style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                <button
                    className="btn"
                    onClick={() => navigate('/login/student')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 2rem',
                        fontSize: '1.1rem',
                        justifyContent: 'center'
                    }}
                >
                    <ArrowLeft size={20} />
                    Go to Login
                </button>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 2rem',
                        fontSize: '1.1rem',
                        justifyContent: 'center'
                    }}
                >
                    <Home size={20} />
                    Go to Home
                </button>
            </div>
        </div>
    );
};

export default AccountBlocked;
