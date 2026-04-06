import { Outlet, Link } from 'react-router-dom'
import './Layout.css'

export default function Layout() {
    return (
        <div className="app">
            <header className="header">
                <div className="container">
                    <Link to="/" className="logo">
                        <span className="logo-icon">⚡</span>
                        <span className="logo-text">NexusBuild</span>
                        <span className="beta-badge">BETA</span>
                    </Link>
                    <nav className="nav">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/builder" className="nav-link">PC Builder</Link>
                        <Link to="/about" className="nav-link">About</Link>
                    </nav>
                </div>
            </header>

            <main className="main">
                <Outlet />
            </main>

            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="logo-icon">⚡</span> NexusBuild
                            <span className="beta-badge-small">BETA</span>
                        </div>
                        <nav className="footer-nav">
                            <Link to="/legal">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                            <Link to="/disclosure">Affiliate Disclosure</Link>
                        </nav>
                    </div>
                    <div className="footer-beta-notice">
                        NexusBuild is currently in beta. Features and data may change.
                    </div>
                    <div className="footer-disclosure">
                        As an Amazon Associate, I earn from qualifying purchases.
                    </div>
                    <div className="footer-copyright">
                        © 2024 NexusBuild. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
