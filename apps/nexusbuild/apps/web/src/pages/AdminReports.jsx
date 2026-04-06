import React, { useEffect, useState } from 'react';
import { API_ORIGIN, reportsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Simple admin check (should be enforced by backend mostly)
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (user && !user.is_admin && !user.is_moderator) {
            setError('Unauthorized: Admin or moderator access only.');
            setLoading(false);
            return;
        }

        loadReports();
    }, [user, isAuthenticated]);

    const loadReports = async () => {
        try {
            setLoading(true);
            const data = await reportsAPI.getAll();
            setReports(data.data || data); // handle axios response wrapper if any, mostly api.js returns data directly
        } catch (err) {
            console.error(err);
            setError('Failed to load reports. Ensure you are an admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            await reportsAPI.delete(id);
            setReports(reports.filter(r => r.id !== id));
        } catch (err) {
            alert('Failed to delete report');
        }
    };

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading reports...</div>;

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        return imageUrl.startsWith('http') ? imageUrl : `${API_ORIGIN}${imageUrl}`;
    };

    if (error) return (
        <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
            <h2 style={{ color: '#e53e3e' }}>{error}</h2>
            <button onClick={() => navigate('/')} style={{ marginTop: '1rem', padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Go Home</button>
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Bug Reports & Feedback</h1>

            {reports.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.6, padding: '2rem' }}>No reports found. Good job! 🎉</div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {reports.map(report => (
                        <div key={report.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold', color: '#667eea' }}>@{report.username}</span>
                                    <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{new Date(report.created_at).toLocaleString()}</span>
                                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: report.status === 'open' ? 'rgba(236, 201, 75, 0.2)' : 'rgba(72, 187, 120, 0.2)', color: report.status === 'open' ? '#ecc94b' : '#48bb78', fontSize: '0.7rem', textTransform: 'uppercase' }}>{report.status}</span>
                                </div>
                                <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{report.description}</p>
                            </div>

                            {report.image_url && (
                                <div style={{ width: '200px', height: '150px', background: 'black', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <a href={getImageUrl(report.image_url)} target="_blank" rel="noopener noreferrer">
                                        <img src={getImageUrl(report.image_url)} alt="Bug Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </a>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <button
                                    onClick={() => handleDelete(report.id)}
                                    style={{ background: 'transparent', border: '1px solid #e53e3e', color: '#e53e3e', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
