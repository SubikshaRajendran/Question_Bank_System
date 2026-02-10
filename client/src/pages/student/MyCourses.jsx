import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import CourseCard from '../../components/CourseCard';

const MyCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            if (!user) return;
            try {
                const data = await fetchApi(`/users/${user._id}/registered-courses`);
                setCourses(data);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, [user]);

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <h2 className="section-header">My Registered Courses</h2>
            {courses.length === 0 ? (
                <div className="no-results">
                    <p>You haven't registered for any courses yet.</p>
                </div>
            ) : (
                <div className="student-grid">
                    {courses.map(course => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;
