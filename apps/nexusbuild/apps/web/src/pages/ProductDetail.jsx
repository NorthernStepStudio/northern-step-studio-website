import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import appsCatalogData from '@shared/constants/appsCatalog.json';
import { useAppMedia } from '../hooks/useAppMedia';

const { appCatalogBySlug } = appsCatalogData;
const getAppBySlug = (slug) => appCatalogBySlug?.[String(slug ?? '').trim().toLowerCase()] || null;

export default function ProductDetail() {
    const { slug } = useParams();
    const [copied, setCopied] = useState(false);
    const app = useMemo(() => getAppBySlug(slug), [slug]);
    const { heroImage, gallery, features } = useAppMedia(slug);

    if (!app) {
        return (
            <div className="container" style={{ padding: '5rem 0' }}>
                <div
                    className="glass-card"
                    style={{
                        padding: '2rem',
                        borderRadius: '24px',
                        maxWidth: '760px',
                        margin: '0 auto',
                    }}
                >
                    <h1 style={{ marginTop: 0 }}>Product not found</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                        We could not find that app in the catalog.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <Link to="../" className="btn btn-primary">
                            Back Home
                        </Link>
                        <Link to="../testers" className="btn btn-secondary">
                            Request Access
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const shareDemoLink = async () => {
        try {
            const url = new URL(`../demo/${app.slug}`, window.location.href).toString();
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch (error) {
            console.error('Failed to copy demo link', error);
            setCopied(false);
        }
    };

    const statusTone =
        app.status === 'LIVE'
            ? { bg: 'rgba(34,197,94,0.14)', color: '#4ade80' }
            : app.status === 'BETA'
                ? { bg: 'rgba(245,158,11,0.14)', color: '#fbbf24' }
                : { bg: 'rgba(148,163,184,0.14)', color: '#cbd5e1' };

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
                            Product detail
                        </div>

                        <h1 className="hero-title" style={{ marginBottom: '1rem' }}>
                            {app.name}
                            <br />
                            <span className="gradient-text">{app.tagline}</span>
                        </h1>

                        <p className="hero-subtitle" style={{ maxWidth: '60ch' }}>
                            {app.description}
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.75rem',
                                marginBottom: '1.6rem',
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '999px',
                                    background: statusTone.bg,
                                    color: statusTone.color,
                                    fontSize: '0.82rem',
                                    fontWeight: 800,
                                }}
                            >
                                {app.statusLabel}
                            </span>
                            <span style={{ color: 'var(--color-text-muted)' }}>
                                Private demos stay off the public preview URL.
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <Link to={`../demo/${app.slug}`} className="btn btn-primary">
                                Open Demo
                            </Link>
                            <Link to={`../testers?app=${app.slug}`} className="btn btn-secondary">
                                Request Access
                            </Link>
                            {app.status !== 'LIVE' ? (
                                <button
                                    type="button"
                                    onClick={shareDemoLink}
                                    className="btn btn-secondary"
                                >
                                    {copied ? 'Demo Link Copied' : 'Share Demo Link'}
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div
                            className="glass-card"
                            style={{
                                padding: '1rem',
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
                                    marginBottom: '0.75rem',
                                }}
                            >
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    Catalog preview
                                </div>
                                <div
                                    style={{
                                        padding: '0.35rem 0.7rem',
                                        borderRadius: '999px',
                                        background: 'rgba(74,158,255,0.15)',
                                        color: '#7dd3fc',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                    }}
                                >
                                    {app.statusLabel}
                                </div>
                            </div>

                            <img
                                src={heroImage || app.heroImage}
                                alt={`${app.name} preview`}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <h2 className="section-title">Feature summary</h2>
                    <div className="features-grid">
                        {features.slice(0, 4).map((feature) => (
                            <div key={feature.title} className="glass-card feature-card">
                                <div className="feature-icon" style={{ fontSize: '0.9rem' }}>
                                    {feature.title.slice(0, 2).toUpperCase()}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-text">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">Media gallery</h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1rem',
                        }}
                    >
                        {gallery.map((shot) => (
                            <figure
                                key={shot.caption || shot.alt}
                                className="glass-card"
                                style={{
                                    margin: 0,
                                    borderRadius: '22px',
                                    overflow: 'hidden',
                                    background: 'rgba(255,255,255,0.04)',
                                }}
                            >
                                <img
                                    src={shot.src}
                                    alt={shot.alt}
                                    loading="lazy"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        aspectRatio: '4 / 3',
                                        objectFit: 'cover',
                                    }}
                                />
                                <figcaption
                                    style={{
                                        padding: '0.9rem 1rem',
                                        color: 'var(--color-text-secondary)',
                                        fontSize: '0.92rem',
                                    }}
                                >
                                    {shot.caption}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            <section className="cta">
                <div className="container">
                    <div className="glass-card cta-card">
                        <h2 className="cta-title">Need the live access workflow?</h2>
                        <p className="cta-text">
                            Use the safe demo link for public sharing and send qualified testers to the private queue.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
                            <Link to={`../demo/${app.slug}`} className="btn btn-primary btn-lg">
                                Open Demo
                            </Link>
                            <Link to={`../testers?app=${app.slug}`} className="btn btn-secondary btn-lg">
                                Request Access
                            </Link>
                            {app.status !== 'LIVE' ? (
                                <button
                                    type="button"
                                    onClick={shareDemoLink}
                                    className="btn btn-secondary btn-lg"
                                >
                                    {copied ? 'Demo Link Copied' : 'Share Demo Link'}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
