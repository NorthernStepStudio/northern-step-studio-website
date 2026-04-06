import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBuild } from '../contexts/BuildContext';

export default function Builds({ isEmbedded = false }) {
    const base = isEmbedded ? '' : '/';
    const { isAuthenticated } = useAuth();
    const { savedBuilds, loadUserBuilds, loading } = useBuild();

    useEffect(() => {
        if (isAuthenticated) {
            loadUserBuilds();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>Your Builds</h1>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                    Sign in to save and review your build library.
                </p>
                <Link to={base + "login"} style={{ display: 'inline-block', padding: '0.8rem 1.2rem', borderRadius: '999px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textDecoration: 'none', fontWeight: 700 }}>
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Your Builds</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                        Saved builds from your account and local builder.
                    </p>
                </div>
                <Link to={base + "builder"} style={{ display: 'inline-block', padding: '0.8rem 1.2rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', fontWeight: 700 }}>
                    Create New Build
                </Link>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', opacity: 0.8 }}>Loading builds...</div>
            )}

            {!loading && savedBuilds.length === 0 && (
                <div style={{ padding: '2rem', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>No builds saved yet.</p>
                    <Link to={base + "builder"} style={{ color: '#a3bffa', textDecoration: 'none', fontWeight: 700 }}>
                        Start with the builder
                    </Link>
                </div>
            )}

            {!loading && savedBuilds.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {savedBuilds.map((build) => (
                        <div key={build.id} style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                                <h3 style={{ margin: 0 }}>{build.name}</h3>
                                <div style={{ color: '#48bb78', fontWeight: 700 }}>
                                    ${Number(build.total_price || 0).toFixed(2)}
                                </div>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                {Object.values(build.parts || {}).length} parts
                            </div>
                            <div style={{ display: 'grid', gap: '0.4rem' }}>
                                {Object.entries(build.parts || {}).slice(0, 4).map(([category, part]) => (
                                    <div key={`${build.id}-${category}`} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#a3bffa', textTransform: 'uppercase' }}>{category}</span>
                                        <span style={{ color: '#e2e8f0' }}>{part?.name}</span>
                                    </div>
                                ))}
                            </div>
                            {build.created_at && (
                                <div style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.8rem' }}>
                                    Saved {new Date(build.created_at).toLocaleString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
