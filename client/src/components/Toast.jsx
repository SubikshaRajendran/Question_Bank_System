import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColor = type === 'success' ? '#10b981' : '#ef4444';
    const icon = type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />;

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: bgColor,
            color: 'white',
            padding: '1.5rem 2rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 9999,
            animation: 'fadeInScale 0.3s ease-out',
            minWidth: '350px',
            maxWidth: '90%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                {icon}
            </div>
            <span style={{ fontWeight: 500, flex: 1, fontSize: '1.1rem' }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem'
                }}
            >
                <X size={20} />
            </button>
            <style>{`
        @keyframes fadeInScale {
          from { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default Toast;
