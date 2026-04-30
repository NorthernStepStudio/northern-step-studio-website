import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

export default function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="navigation">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <span className="logo-icon">⚡</span>
                    <span className="logo-text">
                        Nexus<span className="logo-accent">Build</span>
                    </span>
                    <span className="preview-badge">PREVIEW</span>
                </Link>

                <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/builder" className="nav-link">PC Builder</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/disclosure" className="nav-link">Affiliate Disclosure</Link>
                </div>

                <div className="nav-actions">
                    <Link to="/contact" className="btn btn-ghost">Contact</Link>
                </div>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
}
