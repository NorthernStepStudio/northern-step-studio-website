import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import appsCatalogData from '@shared/constants/appsCatalog.json';
import { testerAPI } from '../services/api';

const { appCatalog, appCatalogBySlug } = appsCatalogData;
const getAppBySlug = (slug) => appCatalogBySlug?.[String(slug ?? '').trim().toLowerCase()] || null;
const allAppsOption = { value: '', label: 'All apps' };

export default function TesterSignup() {
    const [searchParams] = useSearchParams();
    const initialAppSlug = useMemo(() => {
        const requested = getAppBySlug(searchParams.get('app'));
        return requested?.slug || appCatalog[0]?.slug || '';
    }, [searchParams]);

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        appSlug: initialAppSlug,
        reason: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const requested = getAppBySlug(searchParams.get('app'));
        if (requested) {
            setFormData((current) => ({
                ...current,
                appSlug: requested.slug,
            }));
        }
    }, [searchParams]);

    const selectedApp = getAppBySlug(formData.appSlug) || null;

    const handleChange = (field) => (event) => {
        setFormData((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await testerAPI.submitRequest({
                email: formData.email,
                name: formData.name,
                app_slug: formData.appSlug || null,
                reason: formData.reason,
            });

            const tester = response.tester || response.data?.tester || response.data || null;
            if (tester?.email) {
                const cacheKey = `nstep:testers:${tester.email.toLowerCase()}:${tester.appSlug || 'all'}`;
                localStorage.setItem(cacheKey, 'submitted');
            }

            setSuccess({
                name: formData.name,
                email: formData.email,
                appLabel: tester?.appLabel || selectedApp?.name || 'All apps',
            });
            setFormData((current) => ({
                ...current,
                reason: '',
            }));
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to submit tester request';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="home">
            <section className="hero gradient-bg-hero" style={{ paddingBottom: '2rem' }}>
                <div className="container hero-container" style={{ alignItems: 'stretch' }}>
                    <div className="hero-content" style={{ maxWidth: '620px' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.45rem 0.8rem',
                                borderRadius: '999px',
                                background: 'rgba(125, 211, 252, 0.15)',
                                color: '#7dd3fc',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                marginBottom: '1.2rem',
                            }}
                        >
                            Private tester pipeline
                        </div>

                        <h1 className="hero-title" style={{ marginBottom: '1rem' }}>
                            Request access to
                            <br />
                            <span className="gradient-text">NexusBuild previews</span>
                        </h1>

                        <p className="hero-subtitle" style={{ maxWidth: '58ch' }}>
                            Tell us what you want to test. We will notify you when the request is
                            approved and keep the access flow out of the public preview URL.
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                gap: '0.75rem',
                                marginTop: '1.6rem',
                                maxWidth: '680px',
                            }}
                        >
                            {[
                                { label: '1', text: 'Submit the form' },
                                { label: '2', text: 'We review and approve' },
                                { label: '3', text: 'You get the access email' },
                            ].map((step) => (
                                <div
                                    key={step.label}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '18px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '999px',
                                            background: 'linear-gradient(135deg, #4a9eff 0%, #00d4ff 100%)',
                                            color: '#08111f',
                                            fontWeight: 900,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '0.75rem',
                                        }}
                                    >
                                        {step.label}
                                    </div>
                                    <div style={{ color: 'white', fontWeight: 700, lineHeight: 1.35 }}>
                                        {step.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hero-visual" style={{ alignSelf: 'center' }}>
                        <div
                            className="glass-card"
                            style={{
                                padding: '1.4rem',
                                borderRadius: '28px',
                                background:
                                    'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
                                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: '0.78rem',
                                            letterSpacing: '0.14em',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: '0.35rem',
                                        }}
                                    >
                                        Tester signup
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                                        Access request form
                                    </h2>
                                </div>
                                <div
                                    style={{
                                        padding: '0.45rem 0.75rem',
                                        borderRadius: '999px',
                                        background: 'rgba(34,197,94,0.14)',
                                        color: '#4ade80',
                                        fontSize: '0.78rem',
                                        fontWeight: 800,
                                    }}
                                >
                                    Queue
                                </div>
                            </div>

                            {success ? (
                                <div
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: '18px',
                                        background: 'rgba(34,197,94,0.12)',
                                        border: '1px solid rgba(34,197,94,0.22)',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.45rem',
                                            padding: '0.35rem 0.7rem',
                                            borderRadius: '999px',
                                            background: 'rgba(34,197,94,0.18)',
                                            color: '#86efac',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            marginBottom: '0.9rem',
                                        }}
                                    >
                                        Request received
                                    </div>
                                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                                        Access will be granted shortly.
                                    </h3>
                                    <p style={{ marginBottom: '1rem' }}>
                                        We have your request for <strong>{success.appLabel}</strong>.
                                        We will email <strong>{success.email}</strong> once the
                                        request is approved.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <Link
                                            to={`../demo/${selectedApp?.slug || 'nexusbuild'}`}
                                            className="btn btn-primary"
                                        >
                                            View Safe Demo
                                        </Link>
                                        <Link to="../builder" className="btn btn-secondary">
                                            Open Builder
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                                        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                            Email
                                        </span>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange('email')}
                                            required
                                            placeholder="you@example.com"
                                            style={inputStyle}
                                        />
                                    </label>

                                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                                        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                            Name
                                        </span>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange('name')}
                                            required
                                            placeholder="Your name"
                                            style={inputStyle}
                                        />
                                    </label>

                                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                                        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                            App
                                        </span>
                                        <select
                                            value={formData.appSlug}
                                            onChange={handleChange('appSlug')}
                                            style={inputStyle}
                                        >
                                            {allAppsOption.value === '' && (
                                                <option value="">{allAppsOption.label}</option>
                                            )}
                                            {appCatalog.map((app) => (
                                                <option key={app.slug} value={app.slug}>
                                                    {app.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                                        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                            Why do you want access?
                                        </span>
                                        <textarea
                                            rows={5}
                                            value={formData.reason}
                                            onChange={handleChange('reason')}
                                            placeholder="Tell us what you want to test and what feedback you can give."
                                            style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                                        />
                                    </label>

                                    {error ? (
                                        <div
                                            style={{
                                                padding: '0.85rem 1rem',
                                                borderRadius: '14px',
                                                background: 'rgba(239,68,68,0.12)',
                                                border: '1px solid rgba(239,68,68,0.22)',
                                                color: '#fecaca',
                                                fontSize: '0.95rem',
                                            }}
                                        >
                                            {error}
                                        </div>
                                    ) : null}

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                        style={{ width: '100%', padding: '1rem 1.4rem' }}
                                    >
                                        {submitting ? 'Submitting...' : 'Request Access'}
                                    </button>

                                    <p
                                        style={{
                                            margin: 0,
                                            color: 'var(--color-text-muted)',
                                            fontSize: '0.92rem',
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        Submissions are limited to one request per email and app. If
                                        you already sent one, we will keep the latest status in the
                                        queue.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <h2 className="section-title">Featured apps in the queue</h2>
                    <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                        {appCatalog.map((app) => (
                            <div
                                key={app.slug}
                                className="glass-card feature-card"
                                style={{
                                    textAlign: 'left',
                                    borderRadius: '22px',
                                    overflow: 'hidden',
                                    background:
                                        'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
                                }}
                            >
                                <div
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '18px',
                                        marginBottom: '1rem',
                                        background:
                                            'linear-gradient(135deg, rgba(74,158,255,0.16), rgba(0,212,255,0.08))',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '0.75rem',
                                        }}
                                    >
                                        <strong>{app.name}</strong>
                                        <span
                                            style={{
                                                padding: '0.3rem 0.65rem',
                                                borderRadius: '999px',
                                                background: 'rgba(255,255,255,0.08)',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                            }}
                                        >
                                            {app.statusLabel}
                                        </span>
                                    </div>
                                    <p style={{ marginBottom: 0, color: 'var(--color-text-secondary)' }}>
                                        {app.tagline}
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gap: '0.65rem' }}>
                                    {app.features.slice(0, 3).map((feature) => (
                                        <div
                                            key={feature.title}
                                            style={{
                                                paddingBottom: '0.65rem',
                                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                                            }}
                                        >
                                            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                                                {feature.title}
                                            </div>
                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                                {feature.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
};
