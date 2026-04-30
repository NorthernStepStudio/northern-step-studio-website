import React from 'react';
import './Footer.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="amazon-disclosure">
                <div className="container">
                    <p>
                        <strong>Affiliate Disclosure:</strong> As an Amazon Associate, I earn
                        from qualifying purchases. NexusBuild is a participant in the Amazon
                        Services LLC Associates Program.
                    </p>
                </div>
            </div>

            <div className="container footer-container">
                <div className="footer-section">
                    <h3 className="footer-title">
                        <span className="logo-icon">NB</span>
                        Nexus<span className="logo-accent">Build</span>
                        <span className="preview-badge">PREVIEW</span>
                    </h3>
                    <p className="footer-text">
                        NexusBuild is in Preview. We are building the ultimate PC building
                        companion for enthusiasts and professionals.
                    </p>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Tools</h4>
                    <ul className="footer-links">
                        <li><a href="/builder">PC Builder</a></li>
                        <li><a href="/about">About Us</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Legal</h4>
                    <ul className="footer-links">
                        <li><a href="/disclosure">Affiliate Disclosure</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
                        <li><a href="/cookie">Cookie Policy</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Contact</h4>
                    <ul className="footer-links">
                        <li><a href="/contact">Contact Us</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p className="footer-copyright">
                        © {currentYear} NexusBuild. All rights reserved. | NexusBuild is
                        currently in Preview.
                    </p>
                </div>
            </div>
        </footer>
    );
}
