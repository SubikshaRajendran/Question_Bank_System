import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Moon, Sun, Menu, X } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLoginMenu, setShowLoginMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowLoginMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <>
            <nav className="navbar">
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.8rem', fontWeight: '800' }}>
                    <BookOpen size={32} strokeWidth={2.5} />
                    <span style={{ letterSpacing: '-0.5px' }}>
                        {user ? (user.role === 'student' ? 'QB Student' : 'QB Admin') : 'QB System'}
                    </span>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    {showMobileMenu ? <X size={28} /> : <Menu size={28} />}
                </button>

                <ul className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
                    {/* Public Nav */}
                    {!user && (
                        <>
                            <li><Link to="/" className={isActive('/')} onClick={() => setShowMobileMenu(false)}>Home</Link></li>
                            <li><Link to="/about" className={isActive('/about')} onClick={() => setShowMobileMenu(false)}>About</Link></li>

                            {/* Mobile Only Login Links */}
                            <li className="mobile-only">
                                <Link to="/login/student" onClick={() => setShowMobileMenu(false)}>Student Login</Link>
                            </li>
                            <li className="mobile-only">
                                <Link to="/login/admin" onClick={() => setShowMobileMenu(false)}>Admin Login</Link>
                            </li>

                            {/* Desktop Dropdown */}
                            <li className="login-dropdown-wrapper desktop-only" ref={dropdownRef}>
                                <button
                                    className="btn"
                                    onClick={(e) => { e.stopPropagation(); setShowLoginMenu(!showLoginMenu); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    Login
                                </button>
                                {showLoginMenu && (
                                    <div className="login-dropdown-menu" style={{ minWidth: '160px' }}>
                                        <Link
                                            to="/login/student"
                                            className="login-dropdown-item"
                                            onClick={() => setShowLoginMenu(false)}
                                        >
                                            Student Login
                                        </Link>
                                        <Link
                                            to="/login/admin"
                                            className="login-dropdown-item"
                                            onClick={() => setShowLoginMenu(false)}
                                        >
                                            Admin Login
                                        </Link>
                                    </div>
                                )}
                            </li>
                        </>
                    )}

                    {/* Student Nav */}
                    {user && user.role === 'student' && (
                        <>
                            <li><Link to="/student/dashboard" className={isActive('/student/dashboard')} onClick={() => setShowMobileMenu(false)}>Dashboard</Link></li>
                            <li><Link to="/student/courses" className={isActive('/student/courses')} onClick={() => setShowMobileMenu(false)}>My Courses</Link></li>
                            <li><Link to="/student/review" className={isActive('/student/review')} onClick={() => setShowMobileMenu(false)}>Review Later</Link></li>
                            <li><Link to="/student/comments" className={isActive('/student/comments')} onClick={() => setShowMobileMenu(false)}>My Comments</Link></li>
                            <li><button onClick={handleLogout} className="nav-btn-logout">Logout</button></li>
                        </>
                    )}

                    {/* Admin Nav */}
                    {user && user.role === 'admin' && (
                        <>
                            <li><Link to="/admin/dashboard" className={isActive('/admin/dashboard')} onClick={() => setShowMobileMenu(false)}>Dashboard</Link></li>
                            <li><Link to="/admin/comments" className={isActive('/admin/comments')} onClick={() => setShowMobileMenu(false)}>Student Comments</Link></li>
                            <li><button onClick={handleLogout} className="nav-btn-logout">Logout</button></li>
                        </>
                    )}
                </ul>
            </nav>

            <div className="container">
                <Outlet />
            </div>

            <footer className="main-footer" style={{ textAlign: 'center' }}>
                <p>&copy; 2026 Question Bank System. All rights reserved.</p>
            </footer>
        </>
    );
};

export default Layout;
