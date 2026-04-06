import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import appsCatalogData from '@shared/constants/appsCatalog.json';
import { useAppMedia } from '../hooks/useAppMedia';

const { appCatalogBySlug } = appsCatalogData;
const getAppBySlug = (slug) => appCatalogBySlug?.[String(slug ?? '').trim().toLowerCase()] || null;

export default function DemoPage() {
    const { slug } = useParams();
    const app = useMemo(() => getAppBySlug(slug), [slug]);
    const { heroImage, gallery, features, videoUrl } = useAppMedia(slug);

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
                    <h1 style={{ marginTop: 0 }}>Demo not found</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                        We could not find a public demo for that app.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <Link to="../testers" className="btn btn-primary">
                            Request Access
                        </Link>
                        <Link to=".." className="btn btn-secondary">
                            Back Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const appUrl = `../testers?app=${app.slug}`;

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
                            Safe public demo
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
                                    background: 'rgba(255,255,255,0.08)',
                                    color: 'white',
                                    fontSize: '0.82rem',
                                    fontWeight: 800,
                                }}
                            >
                                {app.statusLabel}
                            </span>
                            <span style={{ color: 'var(--color-text-muted)' }}>
                                Read-only, sandboxed, and public-safe.
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <Link to={appUrl} className="btn btn-primary">
                                Request Full Access
                            </Link>
                            <Link to={`../apps/${app.slug}`} className="btn btn-secondary">
                                View Product Detail
                            </Link>
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
                                    Demo preview
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
                                    Read only
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
                    <h2 className="section-title">Highlights</h2>
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

            <section className="how-it-works" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="container">
                    <h2 className="section-title">Screenshot gallery</h2>
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

            {videoUrl ? (
                <section className="how-it-works">
                    <div className="container">
                        <h2 className="section-title">Demo video</h2>
                        <div className="glass-card" style={{ borderRadius: '22px', overflow: 'hidden' }}>
                            <video controls poster={heroImage || app.heroImage} style={{ width: '100%', display: 'block' }}>
                                <source src={videoUrl} />
                            </video>
                        </div>
                    </div>
                </section>
            ) : null}

            <section className="cta">
                <div className="container">
                    <div className="glass-card cta-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <h2 className="cta-title">Need the full build?</h2>
                        <p className="cta-text">
                            Request tester access for {app.name} and keep the private preview out of the public link.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
                            <Link to={appUrl} className="btn btn-primary btn-lg">
                                Request Full Access
                            </Link>
                            <Link to={`../apps/${app.slug}`} className="btn btn-secondary btn-lg">
                                Open Product Detail
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
