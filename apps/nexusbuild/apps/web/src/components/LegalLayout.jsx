import React from 'react';

export default function LegalLayout({ title, lastUpdated, children }) {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem', textAlign: 'left' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{title}</h1>
            {lastUpdated && <p style={{ color: '#aaa', marginBottom: '2rem' }}>Last Updated: {lastUpdated}</p>}
            <div style={{ lineHeight: '1.8', color: '#ddd' }}>
                {children}
            </div>
        </div>
    );
}
