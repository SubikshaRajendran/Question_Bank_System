import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import { Search, Plus, Trash2, Edit, BookOpen, Filter, GripVertical, Save, X, ArrowUpDown, User } from 'lucide-react'; // Added User icon
import Toast from '../../components/Toast';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableCourseItem = ({ course }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: course._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        background: 'var(--card-bg)', // Ensure background is set for better drag visual
        zIndex: transform ? 999 : 'auto', // Lift up when dragging
        position: 'relative'
    };

    return (
        <div ref={setNodeRef} style={style} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-secondary)' }}>
                    <GripVertical size={20} />
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>{course.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {course.questions ? course.questions.length : 0} Questions
                    </p>
                </div>
            </div>
            <Link to={`/admin/course/edit/${course._id}`} className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <BookOpen size={16} /> View
            </Link>
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalCourses: 0, totalQuestions: 0, totalStudents: 0 });
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [page, setPage] = useState(1);
    const [isReorderMode, setIsReorderMode] = useState(false); // New state for Reorder Mode
    const [toast, setToast] = useState(null); // Toast state

    const itemsPerPage = 5;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
            setToast({ message: 'Failed to load data', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = courses;

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c => c.title.toLowerCase().includes(term));
        }

        // Difficulty Filter
        if (difficultyFilter) {
            result = result.filter(c => c.difficulty === difficultyFilter);
        }

        // Department Filter
        if (departmentFilter) {
            result = result.filter(c => c.department === departmentFilter);
        }

        setFilteredCourses(result);
        if (!isReorderMode) {
            setPage(1);
        }
    }, [searchTerm, difficultyFilter, departmentFilter, courses, isReorderMode]);

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setCourses((items) => {
                const oldIndex = items.findIndex((item) => item._id === active.id);
                const newIndex = items.findIndex((item) => item._id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const toggleReorderMode = () => {
        if (!isReorderMode) {
            // Turning ON
            setSearchTerm('');
            setDifficultyFilter('');
            setDepartmentFilter('');
            setIsReorderMode(true);
            setFilteredCourses(courses); // Reset filters to show all
        } else {
            // Turning OFF (Cancel)
            setIsReorderMode(false);
            loadData(); // Revert changes by reloading
        }
    };

    const saveOrder = async () => {
        const updates = courses.map((item, index) => ({
            _id: item._id,
            order: index
        }));

        try {
            await fetchApi('/courses/reorder', {
                method: 'PUT',
                body: JSON.stringify({ order: updates })
            });
            setToast({ message: 'Course order saved successfully!', type: 'success' }); // Use Toast
            setIsReorderMode(false);
        } catch (err) {
            console.error("Failed to save order", err);
            setToast({ message: "Failed to save new order", type: 'error' });
        }
    };

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const displayedCourses = isReorderMode ? courses : filteredCourses.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    if (loading) return <div className="container">Loading Dashboard...</div>;

    return (
        <div className="container">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Profile Icon Linked to Profile Page */}
                    <Link
                        to="/admin/profile"
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)' }}
                        title="Profile Settings"
                    >
                        <User size={20} />
                    </Link>
                    <h2 className="section-header" style={{ marginBottom: 0 }}>Admin Overview</h2>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem', maxWidth: '220px', margin: '0 auto 1.5rem auto' }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '0.75rem', boxShadow: 'var(--card-shadow)', textAlign: 'center' }}>
                    <div className="stat-number" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.totalCourses}</div>
                    <div className="stat-label" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Courses</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-header" style={{ marginBottom: 0 }}>Manage Courses</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {!isReorderMode ? (
                        <>
                            <button
                                onClick={toggleReorderMode}
                                className="btn btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            >
                                <ArrowUpDown size={18} /> Reorder
                            </button>
                            <Link to="/admin/course/new" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={18} /> Add Course
                            </Link>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={saveOrder}
                                className="btn btn-success"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: 'white' }}
                            >
                                <Save size={18} /> Save Order
                            </button>
                            <button
                                onClick={toggleReorderMode}
                                className="btn btn-danger"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ef4444', color: 'white' }}
                            >
                                <X size={18} /> Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters Bar - Hide in Reorder Mode */}
            {!isReorderMode && (
                <div className="filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
                        <Search size={22} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '3rem', padding: '0.8rem 1rem 0.8rem 3rem', fontSize: '1rem', width: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    <div style={{ position: 'relative', minWidth: '180px' }}>
                        <Filter size={20} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value)}
                            style={{ appearance: 'none', padding: '0.8rem', fontSize: '1rem', width: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                        >
                            <option value="">All Levels</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div style={{ position: 'relative', minWidth: '180px' }}>
                        <Filter size={20} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            style={{ appearance: 'none', padding: '0.8rem', fontSize: '1rem', width: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                        >
                            <option value="">All Departments</option>
                            <option value="CS Cluster">CS Cluster</option>
                            <option value="Core">Core</option>
                            <option value="General/Common">General/Common</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Course List */}
            <div>
                {displayedCourses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No courses found.</div>
                ) : (
                    isReorderMode ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={courses.map(c => c._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {courses.map((course) => (
                                    <SortableCourseItem key={course._id} course={course} />
                                ))}
                            </SortableContext>
                        </DndContext>
                    ) : (
                        displayedCourses.map(course => (
                            <div key={course._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
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
                    )
                )}
            </div>

            {/* Pagination - Hide in Reorder Mode */}
            {!isReorderMode && totalPages > 1 && (
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
