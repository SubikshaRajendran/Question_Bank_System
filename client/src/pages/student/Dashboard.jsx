import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import CourseCard from '../../components/CourseCard';
import { Search, Filter } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const data = await fetchApi(`/users/${user._id}/dashboard-data`);
                // data.allCourses has isRegistered flag and progress merged
                setCourses(data.allCourses || []);
                setFilteredCourses(data.allCourses || []);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    useEffect(() => {
        let result = courses;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.title.toLowerCase().includes(term) ||
                (c.description && c.description.toLowerCase().includes(term))
            );
        }

        if (difficultyFilter) {
            result = result.filter(c => c.difficulty === difficultyFilter);
        }

        if (departmentFilter) {
            result = result.filter(c => c.department === departmentFilter);
        }

        setFilteredCourses(result);
    }, [searchTerm, difficultyFilter, departmentFilter, courses]);

    if (loading) {
        return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading courses...</div>;
    }

    return (
        <div className="container">
            <h2 style={{ marginBottom: '2rem' }}>Learning Dashboard</h2>

            {/* Filters Bar */}
            <div className="filters-bar">
                <div style={{ position: 'relative', flexGrow: 1, maxWidth: '600px' }}>
                    <Search size={22} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '3rem', padding: '1rem 1rem 1rem 3rem', fontSize: '1.1rem', width: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                    />
                </div>

                <div style={{ position: 'relative', minWidth: '200px' }}>
                    <Filter size={20} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        style={{ appearance: 'none', padding: '1rem', fontSize: '1.1rem', width: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                    >
                        <option value="">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                <div style={{ position: 'relative', minWidth: '200px' }}>
                    <Filter size={20} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        style={{ appearance: 'none', padding: '1rem', fontSize: '1.1rem', width: '100%', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                    >
                        <option value="">All Departments</option>
                        <option value="CS Cluster">CS Cluster</option>
                        <option value="Core">Core</option>
                        <option value="General/Common">General/Common</option>
                    </select>
                </div>
            </div>

            {filteredCourses.length === 0 ? (
                <div className="no-results">
                    <h3>No courses found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="student-grid">
                    {filteredCourses.map(course => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
