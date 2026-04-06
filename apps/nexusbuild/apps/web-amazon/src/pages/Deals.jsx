import React from 'react';

export default function Deals() {
    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '3rem', background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Hot Deals & Flash Sales
            </h1>

            <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#aaa', marginBottom: '4rem' }}>
                Hand-picked discounts on the best hardware. Updated daily.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', padding: '0 2rem' }}>
                {/* Mock Deals */}
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ height: '200px', background: '#2d3748', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
                            Product Image {i}
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'inline-block', background: '#e53e3e', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                -20% OFF
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Example Gaming Component</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>$239.99</span>
                                <span style={{ textDecoration: 'line-through', color: '#718096' }}>$299.99</span>
                            </div>
                            <button style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'white', color: '#1a202c', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                View Deal
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
