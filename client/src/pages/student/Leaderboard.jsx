import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const data = await fetchApi('/quiz/student/leaderboard');
                setLeaderboard(data || []);
            } catch (err) {
                console.error("Failed to load leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadLeaderboard();
        }
    }, [user]);

    if (loading) {
        return <div className="container" style={{ marginTop: '3rem', textAlign: 'center' }}>Loading Leaderboard...</div>;
    }

    const topThree = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <Trophy size={40} color="var(--warning)" /> Global Leaderboard
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Based on average historical quiz percentages.</p>
            </div>

            {/* Top 3 Section */}
            {topThree.length > 0 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    gap: '2rem',
                    marginBottom: '4rem',
                    flexWrap: 'wrap'
                }}>
                    {/* Rank 2 */}
                    {topThree[1] && (
                        <div className="card" style={{ flex: '1', minWidth: '200px', maxWidth: '280px', textAlign: 'center', padding: '2rem 1.5rem', borderTop: '4px solid #94a3b8', transform: 'translateY(1rem)' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '50%' }}>
                                    <Medal size={48} color="#94a3b8" />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{topThree[1].studentName}</h3>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{topThree[1].averagePercentage}%</div>
                        </div>
                    )}

                    {/* Rank 1 */}
                    {topThree[0] && (
                        <div className="card" style={{ flex: '1', minWidth: '220px', maxWidth: '320px', textAlign: 'center', padding: '3rem 1.5rem', borderTop: '4px solid #fbbf24', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', zIndex: 10 }}>
                            <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#fbbf24', color: 'white', padding: '0.25rem 1rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                1st Place
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <div style={{ background: '#fef3c7', padding: '1.25rem', borderRadius: '50%' }}>
                                    <Trophy size={56} color="#fbbf24" style={{ fill: '#fbbf24' }} />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{topThree[0].studentName}</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{topThree[0].averagePercentage}%</div>
                        </div>
                    )}

                    {/* Rank 3 */}
                    {topThree[2] && (
                        <div className="card" style={{ flex: '1', minWidth: '200px', maxWidth: '280px', textAlign: 'center', padding: '2rem 1.5rem', borderTop: '4px solid #b45309', transform: 'translateY(1.5rem)' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <div style={{ background: '#ffedd5', padding: '1rem', borderRadius: '50%' }}>
                                    <Award size={48} color="#b45309" />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{topThree[2].studentName}</h3>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{topThree[2].averagePercentage}%</div>
                        </div>
                    )}
                </div>
            )}

            {/* Rest of the Leaderboard Table */}
            {leaderboard.length > 0 ? (
                <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', width: '80px', textAlign: 'center' }}>Rank</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', width: '60%' }}>Student Name</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Average Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((student) => {
                                    const isMe = student.studentId === user._id;
                                    return (
                                        <tr
                                            key={student.studentId}
                                            style={{
                                                borderBottom: '1px solid var(--border-color)',
                                                background: isMe ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                                                {student.rank <= 3 ? (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%',
                                                        background: student.rank === 1 ? '#fbbf24' : student.rank === 2 ? '#94a3b8' : '#b45309',
                                                        color: 'white', fontSize: '0.85rem'
                                                    }}>
                                                        {student.rank}
                                                    </span>
                                                ) : (
                                                    student.rank
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: isMe ? 600 : 400 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {student.studentName}
                                                    {isMe && <span style={{ background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 'bold' }}>You</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: 600, color: 'var(--primary-color)' }}>
                                                {student.averagePercentage}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Trophy size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>No Scores Yet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Be the first one to complete a quiz and claim the #1 spot!</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
