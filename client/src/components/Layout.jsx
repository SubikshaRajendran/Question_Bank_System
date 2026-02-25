import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Moon, Sun, Menu, X, Bell } from 'lucide-react';
import { fetchApi } from '../utils/api';
import logo from '../assets/logo.png';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLoginMenu, setShowLoginMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const dropdownRef = React.useRef(null);
    const notificationRef = React.useRef(null);

    React.useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Fetch notifications for Admin
    React.useEffect(() => {
        let interval;
        const fetchNotifications = async () => {
            if (user && user.role === 'admin') {
                try {
                    const data = await fetchApi('/comments/admin/unread');
                    setUnreadNotifications(data || []);
                } catch (err) {
                    console.error("Failed to fetch notifications:", err);
                }
            }
        };

        if (user && user.role === 'admin') {
            fetchNotifications(); // Initial fetch
            interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [user]);

    // Heartbeat for Student Activity Tracking
    React.useEffect(() => {
        let heartbeatInterval;
        const sendHeartbeat = async () => {
            if (user && user.role === 'student' && user._id) {
                try {
                    await fetchApi('/auth/student/heartbeat', {
                        method: 'POST',
                        body: JSON.stringify({ userId: user._id })
                    });
                } catch (err) {
                    // Ignore heartbeat failures silently
                }
            }
        };

        if (user && user.role === 'student') {
            sendHeartbeat(); // Optional immediate fetch
            heartbeatInterval = setInterval(sendHeartbeat, 60000); // Heartbeat every 1 minute
        }

        return () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        };
    }, [user]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowLoginMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (notif) => {
        try {
            await fetchApi(`/comments/admin/mark-read/${notif._id}`, { method: 'PUT' });
            setUnreadNotifications(prev => prev.filter(n => n._id !== notif._id));
            setShowNotifications(false);

            // Navigate to comments with state to highlight it or switch tabs
            navigate('/admin/comments', { state: { tab: notif.type === 'question' ? 'question' : 'general' } });
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="layout-wrapper">
            <nav className="navbar">
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={logo} alt="Logo" style={{ height: '52px', width: 'auto' }} />
                    <span style={{ fontSize: '22px', fontWeight: '600', color: 'var(--brand-text-primary)', letterSpacing: '-0.5px' }}>
                        Question Bank System
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
                            <li>
                                <button onClick={handleLogout} className="nav-btn-logout">
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </li>
                        </>
                    )}

                    {/* Admin Nav */}
                    {user && user.role === 'admin' && (
                        <>
                            <li><Link to="/admin/dashboard" className={isActive('/admin/dashboard')} onClick={() => setShowMobileMenu(false)}>Dashboard</Link></li>
                            <li><Link to="/admin/students" className={isActive('/admin/students')} onClick={() => setShowMobileMenu(false)}>Students</Link></li>
                            <li><Link to="/admin/comments" className={isActive('/admin/comments')} onClick={() => setShowMobileMenu(false)}>Comments</Link></li>
                            <li className="notification-dropdown-wrapper desktop-only" ref={notificationRef} style={{ position: 'relative' }}>
                                <button
                                    className="nav-btn-icon"
                                    onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'inherit',
                                        display: 'flex', alignItems: 'center', position: 'relative', padding: '0.4rem'
                                    }}
                                    title="Notifications"
                                >
                                    <Bell size={20} />
                                    {unreadNotifications.length > 0 && (
                                        <span style={{
                                            position: 'absolute', top: '0', right: '0',
                                            background: 'var(--danger)', color: 'white',
                                            fontSize: '0.65rem', fontWeight: 'bold',
                                            padding: '0.1rem 0.35rem', borderRadius: '9999px',
                                            transform: 'translate(25%, -25%)'
                                        }}>
                                            {unreadNotifications.length}
                                        </span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="login-dropdown-menu" style={{
                                        minWidth: '320px', right: 0, left: 'auto', padding: 0,
                                        maxHeight: '400px', overflowY: 'auto'
                                    }}>
                                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            Notifications
                                        </div>
                                        {unreadNotifications.length === 0 ? (
                                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                No new notifications
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                {unreadNotifications.map(notif => {
                                                    const username = notif.userId ? notif.userId.username : 'Student';
                                                    const notificationText = notif.type === 'general'
                                                        ? `New comment from ${username}`
                                                        : `New doubt from ${username}`;

                                                    return (
                                                        <div
                                                            key={notif._id}
                                                            onClick={() => handleNotificationClick(notif)}
                                                            style={{
                                                                padding: '1rem', borderBottom: '1px solid var(--border-color)',
                                                                cursor: 'pointer', transition: 'background-color 0.2s',
                                                                display: 'flex', alignItems: 'center', gap: '0.75rem'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        >
                                                            <div style={{
                                                                width: '8px', height: '8px', borderRadius: '50%',
                                                                backgroundColor: 'var(--primary-color)', flexShrink: 0
                                                            }}></div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                <p style={{
                                                                    fontSize: '0.9rem', color: 'var(--text-color)', margin: 0,
                                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                                }}>
                                                                    {notificationText}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                            <li>
                                <button onClick={handleLogout} className="nav-btn-logout">
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </li>
                        </>
                    )}
                    {/* Theme Toggle in Nav */}
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                            onClick={toggleTheme}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}
                            aria-label="Toggle Theme"
                            title="Toggle Dark Mode"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="container main-content">
                <Outlet />
            </div>

            <footer className="main-footer" style={{ textAlign: 'center' }}>
                <p>&copy; 2026 Question Bank System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
