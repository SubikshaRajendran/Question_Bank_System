import React from 'react';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Yes', cancelText = 'No' }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'var(--card-bg)',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: 'var(--card-shadow-hover)',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center',
                border: 'var(--glass-border)'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>{title}</h3>
                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="btn btn-secondary"
                            style={{ minWidth: '80px' }}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className="btn"
                        style={{ minWidth: '80px' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
