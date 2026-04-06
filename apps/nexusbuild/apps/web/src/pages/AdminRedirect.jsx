import React, { useEffect } from 'react';

const WEB_ADMIN_URL = 'https://northernstepstudio.com/apps/nexusbuild/app/admin';

export default function AdminRedirect({ isEmbedded = false, mode = 'admin' }) {
    useEffect(() => {
        const timer = window.setTimeout(() => {
            window.location.assign(WEB_ADMIN_URL);
        }, 800);

        return () => window.clearTimeout(timer);
    }, []);

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div
                style={{
                    maxWidth: '720px',
                    margin: '0 auto',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '2rem',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.45rem 0.8rem',
                        borderRadius: '999px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    Migration Notice
                </div>

                <h1 style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    NexusBuild {mode === 'moderator' ? 'moderation' : 'admin'} moved to the NSS website
                </h1>
                <p style={{ lineHeight: 1.7, opacity: 0.85 }}>
                    This route now redirects to the dedicated Northern Step Studio admin console
                    for NexusBuild. If the redirect does not happen automatically, use the button
                    below.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                    <a
                        href={WEB_ADMIN_URL}
                        style={{
                            padding: '0.9rem 1.4rem',
                            borderRadius: '999px',
                            background: '#667eea',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 700,
                        }}
                    >
                        Open Web Admin
                    </a>
                    <a
                        href={isEmbedded ? '.' : '/'}
                        style={{
                            padding: '0.9rem 1.4rem',
                            borderRadius: '999px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Back to NexusBuild
                    </a>
                </div>

                <p style={{ marginTop: '1rem', opacity: 0.65, fontSize: '0.95rem' }}>
                    Target: {WEB_ADMIN_URL}
                </p>
            </div>
        </div>
    );
}
