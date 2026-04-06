import React from 'react';

export default function LegalPlaceholder({ title }) {
    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <h1>{title}</h1>
            <p>This is a placeholder for the {title} page. Legal content goes here.</p>
        </div>
    );
}
