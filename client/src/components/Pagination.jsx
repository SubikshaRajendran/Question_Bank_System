import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);
            
            if (end === totalPages) {
                start = Math.max(1, end - maxVisible + 1);
            }
            
            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="pagination-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '3rem',
            marginBottom: '2rem',
            padding: '1rem',
        }}>
            <button
                className="btn btn-secondary btn-sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    padding: '0.6rem',
                    borderRadius: '0.75rem',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <ChevronLeft size={20} />
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {getPageNumbers().map(number => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border-color)',
                            background: currentPage === number ? 'var(--primary-gradient)' : 'var(--card-bg)',
                            color: currentPage === number ? 'white' : 'var(--text-color)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: currentPage === number ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                            if (currentPage !== number) {
                                e.target.style.background = 'var(--bg-secondary)';
                                e.target.style.borderColor = 'var(--primary-color)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (currentPage !== number) {
                                e.target.style.background = 'var(--card-bg)';
                                e.target.style.borderColor = 'var(--border-color)';
                            }
                        }}
                    >
                        {number}
                    </button>
                ))}
            </div>

            <button
                className="btn btn-secondary btn-sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    padding: '0.6rem',
                    borderRadius: '0.75rem',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
