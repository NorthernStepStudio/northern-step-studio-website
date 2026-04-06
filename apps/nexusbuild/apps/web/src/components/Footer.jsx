import React from 'react';
import { Link } from 'react-router-dom';
import { buildAppPath } from '../utils/appRoutes';
import './Footer.css';

export default function Footer() {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-section">
                    <h3 className="footer-title">
                        <span className="logo-icon">NB</span>
                        Nexus<span className="logo-accent">Build</span>
                    </h3>
                    <p className="footer-text">
                        The ultimate PC building companion for enthusiasts and professionals.
                    </p>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Product</h4>
                    <ul className="footer-links">
                        <li><Link to={buildAppPath(currentPath, 'builder')}>PC Builder</Link></li>
                        <li><Link to={buildAppPath(currentPath, 'builds')}>Community Builds</Link></li>
                        <li><Link to={buildAppPath(currentPath, 'deals')}>Hot Deals</Link></li>
                        <li><Link to={buildAppPath(currentPath, 'guide')}>Build Guide</Link></li>
                        <li><Link to={buildAppPath(currentPath, 'testers?app=nexusbuild')}>Request Access</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Company</h4>
                    <ul className="footer-links">
                        <li><Link to={buildAppPath(currentPath, 'about')}>About Us</Link></li>
                        <li><Link to={buildAppPath(currentPath, 'contact')}>Contact</Link></li>
                        <li><Link to={buildAppPath(currentPath, 'privacy')}>Privacy Policy</Link></li>
                        <li><Link to={buildAppPath(currentPath, 'terms')}>Terms of Service</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-heading">Connect</h4>
                    <div className="social-links">
                        <a href="#" className="social-link" aria-label="Discord">Discord</a>
                        <a href="#" className="social-link" aria-label="X">X</a>
                        <a href="#" className="social-link" aria-label="GitHub">GitHub</a>
                        <a href="#" className="social-link" aria-label="YouTube">YouTube</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p className="footer-copyright">
                        Â© {currentYear} NexusBuild. All rights reserved. Built for PC enthusiasts.
                    </p>
                </div>
            </div>
        </footer>
    );
}
