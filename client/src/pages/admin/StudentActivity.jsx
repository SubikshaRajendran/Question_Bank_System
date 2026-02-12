import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { Users, Search, Calendar, Mail } from 'lucide-react';


const StudentActivity = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            // Fetch all users from the new endpoint we created in users.js
            // The endpoint is GET /api/users
            const data = await fetchApi('/users');
            if (Array.isArray(data)) {
                setStudents(data);
            } else {
                throw new Error('Invalid data format received');
            }
        } catch (err) {
            console.error('Failed to load students:', err);
            setError(`Failed to load student activity data. (${err.message})`);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
    (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );



    // Format "dd-mm-yyyy (hh:mm am/pm)"
    const formatStrict = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        return `${day}-${month}-${year} (${hours}:${minutes} ${ampm})`;
    };


    if (loading) return <div className="text-center p-5">Loading student activity...</div>;
    if (error) return <div className="text-center p-5 text-danger">{error}</div>;

    return (
        <div className="student-activity-page">
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <h1>
                    <Users size={32} />
                    Student Activity
                </h1>
                <p>Track registered students and their recent login activity.</p>
            </header>

            <div className="actions-bar" style={{ marginBottom: '2rem' }}>
                <div className="search-box" style={{ flex: 1, maxWidth: '600px' }}>
                    <Search size={24} />
                    <input
                        type="text"
                        placeholder="Search by name, username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ fontSize: '1.1rem', padding: '0.8rem' }}
                    />
                </div>
            </div>

            <div className="card">
                {filteredStudents.length > 0 ? (
                    <>
                        <div className="table-responsive">
                            <table className="data-table" style={{ borderCollapse: 'separate', borderSpacing: '0 10px', tableLayout: 'fixed', width: '100%' }}> {/* Spacing between rows */}
                                <thead>
                                    <tr>
                                        <th style={{ width: '25%', textAlign: 'left', paddingLeft: '1rem' }}>Username</th>
                                        <th style={{ width: '50%', textAlign: 'left', paddingLeft: '1rem' }}>Email</th>
                                        <th style={{ width: '25%', textAlign: 'left', paddingLeft: '1rem' }}>Recent Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => (
                                        <tr key={student._id}>
                                            <td style={{ paddingLeft: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                                                    {student.username || student.name || 'Unknown'}
                                                </div>
                                            </td>
                                            <td style={{ paddingLeft: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', maxWidth: '100%' }}>
                                                    <Mail size={16} style={{ flexShrink: 0 }} />
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={student.email}>
                                                        {student.email}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ paddingLeft: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Calendar size={16} className="text-muted" />
                                                    {formatStrict(student.lastLogin)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Total Students: {filteredStudents.length}
                        </div>
                    </>
                ) : (
                    <div className="text-center p-5" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        No student found
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentActivity;
