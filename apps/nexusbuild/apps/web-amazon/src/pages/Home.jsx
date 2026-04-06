import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero gradient-bg-hero">
                <div className="container hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Build Your<br />
                            <span className="gradient-text">Dream PC</span>
                        </h1>
                        <p className="hero-subtitle">
                            The ultimate PC building companion. Check compatibility, find the best prices,
                            and craft your perfect setup with NexusBuild.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/builder" className="btn btn-primary">
                                Start Building 🚀
                            </Link>
                            <Link to="/guide" className="btn btn-secondary">
                                Learn More
                            </Link>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-badges">
                            <div className="glass-card-white hero-badge animate-float">
                                <span className="badge-icon">🚀</span>
                                <div className="badge-content">
                                    <div className="badge-title">High FPS</div>
                                    <div className="badge-subtitle">240+ Hz</div>
                                </div>
                            </div>

                            <div className="glass-card-white hero-badge animate-float" style={{ animationDelay: '0.5s' }}>
                                <span className="badge-icon">⚡</span>
                                <div className="badge-content">
                                    <div className="badge-title">AI Optimized</div>
                                    <div className="badge-subtitle">Perfect Config</div>
                                </div>
                            </div>

                            <div className="glass-card-white hero-badge animate-float" style={{ animationDelay: '1s' }}>
                                <span className="badge-icon">❄️</span>
                                <div className="badge-content">
                                    <div className="badge-title">32°C Low</div>
                                    <div className="badge-subtitle">Cool & Quiet</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title">Why NexusBuild?</h2>
                    <div className="features-grid">
                        <div className="glass-card feature-card">
                            <div className="feature-icon">✨</div>
                            <h3 className="feature-title">AI Powered</h3>
                            <p className="feature-text">
                                Get intelligent build recommendations tailored to your needs and budget
                            </p>
                        </div>

                        <div className="glass-card feature-card">
                            <div className="feature-icon">💰</div>
                            <h3 className="feature-title">Best Prices</h3>
                            <p className="feature-text">
                                Real-time price tracking across multiple retailers to save you money
                            </p>
                        </div>

                        <div className="glass-card feature-card">
                            <div className="feature-icon">✅</div>
                            <h3 className="feature-title">Compatibility</h3>
                            <p className="feature-text">
                                Automatic compatibility checking ensures all parts work together
                            </p>
                        </div>

                        <div className="glass-card feature-card">
                            <div className="feature-icon">👥</div>
                            <h3 className="feature-title">Community</h3>
                            <p className="feature-text">
                                Share builds and get feedback from thousands of PC enthusiasts
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="steps-grid">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3 className="step-title">Choose Your Parts</h3>
                            <p className="step-text">
                                Browse our extensive database of PC components
                            </p>
                        </div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <h3 className="step-title">Check Compatibility</h3>
                            <p className="step-text">
                                Our system automatically verifies all parts work together
                            </p>
                        </div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <h3 className="step-title">Find Best Prices</h3>
                            <p className="step-text">
                                Compare prices across retailers to get the best deal
                            </p>
                        </div>

                        <div className="step">
                            <div className="step-number">4</div>
                            <h3 className="step-title">Build & Share</h3>
                            <p className="step-text">
                                Save your build and share it with the community
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile App Section */}
            <section className="app-download">
                <div className="container">
                    <div className="app-download-content">
                        <div className="app-info">
                            <h2 className="section-title">Get the Mobile App</h2>
                            <p className="app-description">
                                Build on the go! Track prices, compare parts, and get AI recommendations
                                right from your phone.
                            </p>
                            <div className="app-buttons">
                                <a
                                    href="https://apps.apple.com/app/nexusbuild"
                                    className="store-button app-store"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="store-icon">🍎</span>
                                    <div className="store-text">
                                        <span className="store-label">Download on the</span>
                                        <span className="store-name">App Store</span>
                                    </div>
                                </a>
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.nexusbuild"
                                    className="store-button play-store"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="store-icon">▶️</span>
                                    <div className="store-text">
                                        <span className="store-label">Get it on</span>
                                        <span className="store-name">Google Play</span>
                                    </div>
                                </a>
                            </div>
                            <p className="app-note">
                                <span className="coming-soon-badge">Coming Soon</span>
                                Join the waitlist for early access!
                            </p>
                        </div>
                        <div className="app-preview">
                            <div className="phone-mockup">
                                <div className="phone-screen">
                                    <div className="mock-header">NexusBuild</div>
                                    <div className="mock-content">
                                        <div className="mock-card"></div>
                                        <div className="mock-card"></div>
                                        <div className="mock-card short"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="glass-card cta-card">
                        <h2 className="cta-title">Ready to build your dream PC?</h2>
                        <p className="cta-text">
                            Join thousands of builders who trust NexusBuild
                        </p>
                        <Link to="/builder" className="btn btn-primary btn-lg">
                            Get Started Now →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
