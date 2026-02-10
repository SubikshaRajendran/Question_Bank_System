import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import { Search, Plus, Trash2, Edit, BookOpen } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalCourses: 0, totalQuestions: 0, totalStudents: 0 });
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, coursesData] = await Promise.all([
                fetchApi('/analytics/admin/stats'),
                fetchApi('/courses')
            ]);
            setStats(statsData);
            setCourses(coursesData);
            setFilteredCourses(coursesData);
        } catch (err) {
            console.error("Failed to load admin data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = courses.filter(c => c.title.toLowerCase().includes(term));
        setFilteredCourses(filtered);
        setPage(1);
    }, [searchTerm, courses]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
        try {
            await fetchApi(`/courses/${id}`, { method: 'DELETE' });
            const newCourses = courses.filter(c => c._id !== id);
            setCourses(newCourses);
            // Stats might need refresh or simpler local update
            setStats(prev => ({ ...prev, totalCourses: prev.totalCourses - 1 }));
        } catch (err) {
            console.error("Failed to delete course", err);
            alert('Failed to delete course');
        }
    };

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const displayedCourses = filteredCourses.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    if (loading) return <div className="container">Loading Dashboard...</div>;

    return (
        <div className="container">
            <h2 className="section-header">Admin Overview</h2>

            {/* Stats */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', maxWidth: '300px', margin: '0 auto 2rem auto' }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--card-shadow)', textAlign: 'center' }}>
                    <div className="stat-number" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.totalCourses}</div>
                    <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>Total Courses</div>
                </div>
                {/* Only Courses stat was shown in HTML, but let's stick to what was there or what API provides. 
            HTML shows only one stat card. API provides others? 
            The HTML only had one stat-card for 'Total Courses'.
        */}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-header" style={{ marginBottom: 0 }}>Manage Courses</h2>
                <Link to="/admin/course/new" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Add Course
                </Link>
            </div>

            {/* Search */}
            <div className="search-container" style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                    type="text"
                    placeholder="Search courses by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                />
            </div>

            {/* Course List */}
            <div>
                {displayedCourses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No courses found.</div>
                ) : (
                    displayedCourses.map(course => (
                        <div key={course._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{course.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {course.questions ? course.questions.length : 0} Questions
                                </p>
                            </div>
                            <Link to={`/admin/course/edit/${course._id}`} className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <BookOpen size={16} /> View
                            </Link>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
                    <button
                        className="page-btn"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        className="page-btn"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
