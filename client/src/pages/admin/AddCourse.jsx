import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Check } from 'lucide-react';

const AddCourse = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [department, setDepartment] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const isFormValid = title.trim() && description.trim() && department;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('difficulty', difficulty);
            formData.append('department', department);
            if (image) {
                formData.append('image', image);
            }

            // Note: fetchApi wrapper might default to JSON. We need to handle FormData.
            // If fetchApi sets Content-Type to application/json automatically, we need to override or bypass it.
            // Let's assume fetchApi handles it or we use raw fetch for FormData if needed.
            // Actually, fetch automatically sets Content-Type for FormData (multipart/form-data with boundary).
            // We should check fetchApi implementation. If it forces JSON headers, we might need a flag.

            // Let's use raw fetch with token from auth context/storage if possible, or modify fetchApi.
            // For now, let's try fetchApi. If it fails, we fix fetchApi.
            // Wait, fetchApi usually does: headers: { 'Content-Type': 'application/json' ... }
            // We need to NOT set Content-Type for FormData.

            const token = localStorage.getItem('token');
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No Content-Type header, browser sets it for FormData
                },
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create course');
            }

            setShowSuccess(true);
        } catch (err) {
            console.error("Failed to create course", err);
            alert('Error creating course: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <h2>Create New Course</h2>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Course Name</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Course Image (Optional)</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            style={{ padding: '0.5rem' }}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="difficulty">Difficulty</label>
                        <select
                            id="difficulty"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="department">Department</label>
                        <select
                            id="department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                        >
                            <option value="">Select Department</option>
                            <option value="CS Cluster">CS Cluster</option>
                            <option value="Core">Core</option>
                            <option value="General/Common">General/Common</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="submit"
                            className="btn"
                            disabled={!isFormValid || loading}
                            style={{ opacity: !isFormValid || loading ? 0.5 : 1, cursor: !isFormValid || loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                        <Link to="/admin/dashboard" className="btn btn-secondary">Cancel</Link>
                    </div>
                </form>
            </div>

            {showSuccess && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--card-bg)', // Use theme var
                        color: 'var(--text-color)',
                        padding: '2rem',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}>
                        <div style={{ marginBottom: '1rem', color: '#10b981', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                                <Check size={48} />
                            </div>
                        </div>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Success!</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                            Course created successfully.
                        </p>
                        <button
                            className="btn"
                            onClick={() => navigate('/admin/dashboard')}
                            style={{ width: '100%' }}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddCourse;
