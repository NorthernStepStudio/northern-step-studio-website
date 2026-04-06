import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { buildAppPath } from '../utils/appRoutes';
import './Navigation.css';

export default function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const rootPath = buildAppPath(currentPath, '');

    return (
        <nav className="navigation">
            <div className="nav-container">
                <Link to={rootPath} className="nav-logo">
                    <span className="logo-icon">âš¡</span>
                    <span className="logo-text">
                        Nexus<span className="logo-accent">Build</span>
                    </span>
                </Link>

                <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                    <Link to={rootPath} className="nav-link">Home</Link>
                    <Link to={buildAppPath(currentPath, 'builder')} className="nav-link">Build Your Dream PC</Link>
                    <Link to={buildAppPath(currentPath, 'builds')} className="nav-link">Builds</Link>
                    <Link to={buildAppPath(currentPath, 'deals')} className="nav-link">Deals</Link>
                    <Link to={buildAppPath(currentPath, 'guide')} className="nav-link">Guide</Link>
                </div>

                <div className="nav-actions">
                    {isAuthenticated ? (
                        <>
                            <Link to={buildAppPath(currentPath, 'profile')} className="nav-user">
                                {user?.profile_image ? (
                                    <img src={user.profile_image} alt={user.username} className="nav-avatar" />
                                ) : (
                                    <span className="nav-avatar-placeholder">{user?.username?.[0]?.toUpperCase()}</span>
                                )}
                                <span className="nav-username">{user?.username}</span>
                            </Link>
                            <button onClick={logout} className="btn btn-ghost">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to={buildAppPath(currentPath, 'login')} className="btn btn-ghost">Login</Link>
                            <Link to={buildAppPath(currentPath, 'register')} className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
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
