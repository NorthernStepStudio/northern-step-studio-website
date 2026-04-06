import React, { useEffect, useState } from 'react';
import { dealsAPI } from '../services/api';

export default function Deals() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDeals = async () => {
            try {
                setLoading(true);
                setError(null);
                const nextDeals = await dealsAPI.getAll();
                setDeals(nextDeals);
            } catch (err) {
                console.error('Failed to load deals', err);
                setError('Unable to load deal pricing right now.');
            } finally {
                setLoading(false);
            }
        };

        loadDeals();
    }, []);

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '3rem', background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Hot Deals
            </h1>

            <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#aaa', marginBottom: '3rem' }}>
                Pricing uses live retailer data when available, with a curated fallback catalog when external scraping is unavailable.
            </p>

            {loading && (
                <div style={{ textAlign: 'center', opacity: 0.8 }}>Loading deals...</div>
            )}

            {!loading && error && (
                <div style={{ textAlign: 'center', color: '#f87171' }}>{error}</div>
            )}

            {!loading && !error && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', padding: '0 1rem' }}>
                    {deals.map((deal) => (
                        <div key={deal.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ minHeight: '170px', background: 'linear-gradient(135deg, rgba(255,107,107,0.18), rgba(254,202,87,0.12))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {deal.category}
                                    </div>
                                    <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{deal.name}</div>
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                                <div style={{ display: 'inline-block', background: deal.discount ? '#e53e3e' : 'rgba(255,255,255,0.12)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold', width: 'fit-content' }}>
                                    {deal.discount ? `-${deal.discount}%` : 'Live Price'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>${Number(deal.salePrice || deal.price || 0).toFixed(2)}</span>
                                    {deal.originalPrice ? (
                                        <span style={{ textDecoration: 'line-through', color: '#718096' }}>${Number(deal.originalPrice).toFixed(2)}</span>
                                    ) : null}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                    {deal.manufacturer || 'PCPartPicker'}
                                </div>
                                <a
                                    href={deal.url || '#'}
                                    target={deal.url ? '_blank' : undefined}
                                    rel={deal.url ? 'noopener noreferrer' : undefined}
                                    style={{
                                        width: '100%',
                                        marginTop: 'auto',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        background: 'white',
                                        color: '#1a202c',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        textDecoration: 'none',
                                        opacity: deal.url ? 1 : 0.6,
                                        pointerEvents: deal.url ? 'auto' : 'none',
                                    }}
                                >
                                    View Deal
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
