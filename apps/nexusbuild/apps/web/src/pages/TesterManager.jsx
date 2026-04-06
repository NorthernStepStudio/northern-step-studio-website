import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import appsCatalogData from '@shared/constants/appsCatalog.json';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { appCatalog, appCatalogBySlug } = appsCatalogData;
const getAppBySlug = (slug) => appCatalogBySlug?.[String(slug ?? '').trim().toLowerCase()] || null;

const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' },
];

const appOptions = [
    { value: 'all', label: 'All apps' },
    ...appCatalog.map((app) => ({ value: app.slug, label: app.name })),
];

const pillStyle = (tone) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.7rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: 800,
    background: tone.bg,
    color: tone.color,
});

const statusTone = (status) => {
    if (status === 'approved') return { bg: 'rgba(34,197,94,0.14)', color: '#4ade80' };
    if (status === 'denied') return { bg: 'rgba(239,68,68,0.14)', color: '#fca5a5' };
    return { bg: 'rgba(245,158,11,0.14)', color: '#fcd34d' };
};

export default function TesterManager() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [testers, setTesters] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        denied: 0,
        byApp: [],
    });
    const [statusFilter, setStatusFilter] = useState('all');
    const [appFilter, setAppFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [draftNotes, setDraftNotes] = useState({});
    const [notice, setNotice] = useState('');

    const isAdmin = user?.is_admin === true;

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const params = {};
                if (statusFilter !== 'all') params.status = statusFilter;
                if (appFilter !== 'all') params.app_slug = appFilter;
                if (search.trim()) params.search = search.trim();

                const [testerResponse, statsResponse] = await Promise.all([
                    adminAPI.getTesters(params),
                    adminAPI.getTesterStats(),
                ]);

                setTesters(testerResponse.testers || []);
                setStats(statsResponse);
            } catch (error) {
                console.error('Failed to load tester queue', error);
                setNotice('Unable to load tester requests.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [isAuthenticated, isAdmin, statusFilter, appFilter, search]);

    const filteredCountLabel = useMemo(() => {
        if (loading) return 'Loading queue...';
        return `${testers.length} request${testers.length === 1 ? '' : 's'}`;
    }, [loading, testers.length]);

    const updateTester = async (id, status) => {
        try {
            const note = draftNotes[id] || '';
            const response = await adminAPI.updateTester(id, {
                status,
                admin_notes: note,
            });
            const updatedTester = response.tester || response.data?.tester || response.data;
            setTesters((current) =>
                current.map((tester) => (tester.id === id ? updatedTester : tester))
            );
            setNotice(`Tester ${status} successfully.`);
        } catch (error) {
            console.error('Failed to update tester', error);
            setNotice('Failed to update tester request.');
        }
    };

    const deleteTester = async (id) => {
        if (!window.confirm('Delete this tester request?')) {
            return;
        }

        try {
            await adminAPI.deleteTester(id);
            setTesters((current) => current.filter((tester) => tester.id !== id));
            setNotice('Tester request deleted.');
        } catch (error) {
            console.error('Failed to delete tester', error);
            setNotice('Failed to delete tester request.');
        }
    };

    if (!isAdmin) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>Unauthorized</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Admin access is required to manage the tester queue.
                </p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0 4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.35rem 0.7rem',
                            borderRadius: '999px',
                            background: 'rgba(125,211,252,0.15)',
                            color: '#7dd3fc',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            marginBottom: '0.9rem',
                        }}
                    >
                        Admin queue
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Tester manager</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                        Review access requests, approve testers, and keep the public demo link safe.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link to="../../testers" className="btn btn-secondary">
                        Open Signup Page
                    </Link>
                    <Link to="../../demo/nexusbuild" className="btn btn-primary">
                        Open Demo
                    </Link>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.25rem',
                }}
            >
                {[
                    { label: 'Pending', value: stats.pending, tone: 'rgba(245,158,11,0.14)' },
                    { label: 'Approved', value: stats.approved, tone: 'rgba(34,197,94,0.14)' },
                    { label: 'Denied', value: stats.denied, tone: 'rgba(239,68,68,0.14)' },
                    { label: 'Total', value: stats.total, tone: 'rgba(74,158,255,0.14)' },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="glass-card"
                        style={{ padding: '1rem 1.1rem', borderRadius: '18px', background: item.tone }}
                    >
                        <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                            {item.label}
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{item.value}</div>
                    </div>
                ))}
            </div>

            <div
                className="glass-card"
                style={{
                    padding: '1rem',
                    borderRadius: '22px',
                    marginBottom: '1.2rem',
                    background: 'rgba(255,255,255,0.04)',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.85rem',
                    }}
                >
                    <label style={{ display: 'grid', gap: '0.35rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            Status
                        </span>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label style={{ display: 'grid', gap: '0.35rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            App
                        </span>
                        <select value={appFilter} onChange={(e) => setAppFilter(e.target.value)} style={selectStyle}>
                            {appOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label style={{ display: 'grid', gap: '0.35rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            Search
                        </span>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Email, name, reason, app"
                            style={selectStyle}
                        />
                    </label>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <div
                            style={{
                                padding: '0.85rem 1rem',
                                borderRadius: '14px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'var(--color-text-secondary)',
                                width: '100%',
                            }}
                        >
                            {filteredCountLabel}
                        </div>
                    </div>
                </div>
            </div>

            {notice ? (
                <div
                    style={{
                        marginBottom: '1rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '14px',
                        background: 'rgba(74,158,255,0.12)',
                        border: '1px solid rgba(74,158,255,0.22)',
                        color: '#bfdbfe',
                    }}
                >
                    {notice}
                </div>
            ) : null}

            {loading ? (
                <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Loading tester requests...
                </div>
            ) : testers.length === 0 ? (
                <div
                    className="glass-card"
                    style={{
                        padding: '2rem',
                        borderRadius: '22px',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.04)',
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>No requests match the current filters.</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                        Clear the filters or wait for a new request to enter the queue.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {testers.map((tester) => {
                        const app = tester.app || getAppBySlug(tester.appSlug);
                        const tone = statusTone(tester.status);
                        const demoPath = tester.appSlug ? `../../demo/${tester.appSlug}` : '../../demo/nexusbuild';

                        return (
                            <div
                                key={tester.id}
                                className="glass-card"
                                style={{
                                    padding: '1rem',
                                    borderRadius: '22px',
                                    background: 'rgba(255,255,255,0.04)',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                        gap: '1rem',
                                        alignItems: 'start',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginBottom: '0.65rem' }}>
                                            <span style={pillStyle(tone)}>{tester.status}</span>
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '0.35rem 0.65rem',
                                                    borderRadius: '999px',
                                                    background: 'rgba(255,255,255,0.08)',
                                                    color: 'white',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {app?.name || tester.appLabel || 'All apps'}
                                            </span>
                                        </div>

                                        <h3 style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                                            {tester.name}
                                        </h3>
                                        <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.7rem' }}>
                                            {tester.email}
                                        </div>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                            Requested {new Date(tester.createdAt || tester.created_at || Date.now()).toLocaleString()}
                                        </div>
                                        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.85rem', lineHeight: 1.6 }}>
                                            {tester.reason || 'No reason provided.'}
                                        </p>
                                    </div>

                                    <div
                                        style={{
                                            padding: '0.95rem',
                                            borderRadius: '18px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                        }}
                                    >
                                        <div style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>
                                            Admin notes
                                        </div>
                                        <textarea
                                            rows={4}
                                            value={draftNotes[tester.id] ?? tester.adminNotes ?? ''}
                                            onChange={(e) =>
                                                setDraftNotes((current) => ({
                                                    ...current,
                                                    [tester.id]: e.target.value,
                                                }))
                                            }
                                            placeholder="Optional note for the tester"
                                            style={{ ...selectStyle, minHeight: '110px', resize: 'vertical' }}
                                        />
                                        <div style={{ marginTop: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                            <Link to={demoPath} className="btn btn-secondary" style={{ padding: '0.7rem 0.95rem' }}>
                                                View Demo
                                            </Link>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.65rem',
                                            alignItems: 'stretch',
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => updateTester(tester.id, 'approved')}
                                            className="btn btn-primary"
                                            style={{ width: '100%' }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateTester(tester.id, 'denied')}
                                            className="btn btn-secondary"
                                            style={{ width: '100%' }}
                                        >
                                            Deny
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteTester(tester.id)}
                                            style={{
                                                width: '100%',
                                                padding: '0.85rem 1rem',
                                                borderRadius: '999px',
                                                border: '1px solid rgba(239,68,68,0.35)',
                                                background: 'transparent',
                                                color: '#fca5a5',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <section style={{ marginTop: '2rem' }}>
                <div className="container" style={{ padding: 0 }}>
                    <h2 className="section-title" style={{ marginBottom: '1rem' }}>
                        Requests by app
                    </h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1rem',
                        }}
                    >
                        {stats.byApp.map((bucket) => (
                            <div
                                key={bucket.appSlug || 'all'}
                                className="glass-card"
                                style={{
                                    padding: '1rem',
                                    borderRadius: '18px',
                                    background: 'rgba(255,255,255,0.04)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.45rem' }}>
                                    <strong>{bucket.appLabel}</strong>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{bucket.total}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    <span>Pending {bucket.pending}</span>
                                    <span>Approved {bucket.approved}</span>
                                    <span>Denied {bucket.denied}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

const selectStyle = {
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
};
