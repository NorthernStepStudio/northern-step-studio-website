import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI, dealsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const tabs = ['dashboard', 'reports', 'users', 'builds', 'parts', 'deals'];

export default function AdminConsole({ mode = 'admin' }) {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ users: 0, builds: 0, parts: 0, reports: 0 });
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [builds, setBuilds] = useState([]);
    const [parts, setParts] = useState([]);
    const [deals, setDeals] = useState([]);

    const isAdmin = user?.is_admin === true;
    const isModerator = user?.is_moderator === true;
    const hasAccess = isAdmin || isModerator;

    const pageTitle = useMemo(() => {
        if (mode === 'moderator') return 'Moderator Console';
        return 'Admin Console';
    }, [mode]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!hasAccess) {
            setLoading(false);
            return;
        }
        loadStats();
    }, [isAuthenticated, hasAccess]);

    useEffect(() => {
        if (!hasAccess) return;
        setLoading(true);
        const load = async () => {
            try {
                if (activeTab === 'reports') {
                    const data = await adminAPI.getReports();
                    setReports(Array.isArray(data.data) ? data.data : data.data || data);
                } else if (activeTab === 'users') {
                    const data = await adminAPI.getUsers();
                    setUsers(Array.isArray(data.data) ? data.data : data.data || data);
                } else if (activeTab === 'builds') {
                    const data = await adminAPI.getBuilds();
                    setBuilds(Array.isArray(data.data) ? data.data : data.data || data);
                } else if (activeTab === 'parts') {
                    const data = await adminAPI.getParts();
                    setParts(Array.isArray(data.data) ? data.data : data.data || data);
                } else if (activeTab === 'deals') {
                    const data = await dealsAPI.getAll();
                    setDeals(Array.isArray(data.data) ? data.data : data.data || data);
                }
            } catch (error) {
                console.error('Admin load error', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [activeTab, hasAccess]);

    const loadStats = async () => {
        try {
            const response = await adminAPI.getStats();
            const data = response.data || response;
            setStats({
                users: data.users || 0,
                builds: data.builds || 0,
                parts: data.parts || 0,
                reports: data.reports || 0,
            });
        } catch (error) {
            console.error('Stats load failed', error);
        }
    };

    const updateReportStatus = async (id, status) => {
        try {
            await adminAPI.updateReport(id, { status });
            setReports(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
        } catch (error) {
            alert('Failed to update report');
        }
    };

    const deleteReport = async (id) => {
        if (!window.confirm('Delete this report?')) return;
        try {
            await adminAPI.deleteReport(id);
            setReports(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            alert('Failed to delete report');
        }
    };

    const updateUser = async (id, updates) => {
        try {
            const response = await adminAPI.updateUser(id, updates);
            const updated = response.data?.user || response.user;
            if (updated) {
                setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)));
            }
        } catch (error) {
            alert('Failed to update user');
        }
    };

    const deleteBuild = async (id) => {
        if (!window.confirm('Delete this build?')) return;
        try {
            await adminAPI.deleteBuild(id);
            setBuilds(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            alert('Failed to delete build');
        }
    };

    if (!hasAccess) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Unauthorized: admin or moderator only.</h2>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '1rem' }}>{pageTitle}</h1>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: activeTab === tab ? 'rgba(102,126,234,0.3)' : 'rgba(255,255,255,0.05)',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'dashboard' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {['Users', 'Builds', 'Parts', 'Reports'].map((label, index) => (
                        <div key={label} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{label}</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                                {[stats.users, stats.builds, stats.parts, stats.reports][index]}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loading && activeTab !== 'dashboard' && (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            )}

            {!loading && activeTab === 'reports' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {reports.map(report => (
                        <div key={report.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div>@{report.username || 'Anonymous'}</div>
                                <div style={{ opacity: 0.6 }}>{new Date(report.created_at).toLocaleString()}</div>
                            </div>
                            <div style={{ marginBottom: '0.75rem' }}>{report.description}</div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <select
                                    value={report.status || 'pending'}
                                    onChange={(e) => updateReportStatus(report.id, e.target.value)}
                                >
                                    <option value="pending">pending</option>
                                    <option value="in_progress">in_progress</option>
                                    <option value="resolved">resolved</option>
                                </select>
                                <button
                                    onClick={() => deleteReport(report.id)}
                                    style={{ border: '1px solid #e53e3e', color: '#e53e3e', background: 'transparent', padding: '0.35rem 0.8rem', borderRadius: '6px' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && activeTab === 'users' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {users.map(u => (
                        <div key={u.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div>{u.username} ({u.email})</div>
                                <div style={{ opacity: 0.7 }}>{u.role}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ opacity: 0.7 }}>Builds: {u.builds_count || 0}</span>
                                {isAdmin && (
                                    <>
                                        <button onClick={() => updateUser(u.id, { is_admin: !u.is_admin })}>
                                            {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                                        </button>
                                        <button
                                            onClick={() => updateUser(u.id, { is_moderator: !u.is_moderator })}
                                            disabled={u.is_admin}
                                        >
                                            {u.is_moderator ? 'Revoke Mod' : 'Make Mod'}
                                        </button>
                                        <button onClick={() => updateUser(u.id, { is_suspended: !u.is_suspended })}>
                                            {u.is_suspended ? 'Unsuspend' : 'Suspend'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && activeTab === 'builds' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {builds.map(b => (
                        <div key={b.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div>{b.name}</div>
                                <div style={{ opacity: 0.7 }}>@{b.user?.username || 'Unknown'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span style={{ opacity: 0.7 }}>${Number(b.total_price || 0).toFixed(0)}</span>
                                {isAdmin && (
                                    <button onClick={() => deleteBuild(b.id)} style={{ border: '1px solid #e53e3e', color: '#e53e3e', background: 'transparent', padding: '0.35rem 0.8rem', borderRadius: '6px' }}>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && activeTab === 'parts' && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {parts.map(p => (
                        <div key={p.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>{p.name}</div>
                                <div style={{ opacity: 0.7 }}>{p.category}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && activeTab === 'deals' && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {deals.map(d => (
                        <div key={d.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>{d.name}</div>
                                <div style={{ opacity: 0.7 }}>{d.discount}% off</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
