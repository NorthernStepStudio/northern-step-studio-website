import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home({ isEmbedded = false }) {
    const base = isEmbedded ? '' : '/';

    return (
        <div className="home">
            <section className="hero gradient-bg-hero">
                <div className="container hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Build Your
                            <br />
                            <span className="gradient-text">Dream PC</span>
                        </h1>
                        <p className="hero-subtitle">
                            The ultimate PC building companion. Check compatibility, browse
                            curated pricing and deals, and craft your perfect setup with
                            NexusBuild.
                        </p>
                        <div className="hero-buttons">
                            <Link to={base + 'builder'} className="btn btn-primary">
                                Start Building
                            </Link>
                            <Link to={base + 'guide'} className="btn btn-secondary">
                                Learn More
                            </Link>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-badges">
                            <div className="glass-card-white hero-badge animate-float">
                                <span className="badge-icon">FPS</span>
                                <div className="badge-content">
                                    <div className="badge-title">High FPS</div>
                                    <div className="badge-subtitle">240+ Hz</div>
                                </div>
                            </div>

                            <div
                                className="glass-card-white hero-badge animate-float"
                                style={{ animationDelay: '0.5s' }}
                            >
                                <span className="badge-icon">AI</span>
                                <div className="badge-content">
                                    <div className="badge-title">AI Optimized</div>
                                    <div className="badge-subtitle">Perfect Config</div>
                                </div>
                            </div>

                            <div
                                className="glass-card-white hero-badge animate-float"
                                style={{ animationDelay: '1s' }}
                            >
                                <span className="badge-icon">TEMP</span>
                                <div className="badge-content">
                                    <div className="badge-title">32C Low</div>
                                    <div className="badge-subtitle">Cool and Quiet</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <h2 className="section-title">Why NexusBuild?</h2>
                    <div className="features-grid">
                        <div className="glass-card feature-card">
                            <div className="feature-icon">AI</div>
                            <h3 className="feature-title">AI Powered</h3>
                            <p className="feature-text">
                                Get intelligent build recommendations tailored to your needs and
                                budget
                            </p>
                        </div>

                        <div className="glass-card feature-card">
                            <div className="feature-icon">$</div>
                            <h3 className="feature-title">Best Prices</h3>
                            <p className="feature-text">
                                Curated pricing data and featured deals across key PC categories
                            </p>
                        </div>

                        <div className="glass-card feature-card">
                            <div className="feature-icon">OK</div>
                            <h3 className="feature-title">Compatibility</h3>
                            <p className="feature-text">
                                Automatic compatibility checking ensures all parts work together
                            </p>
                        </div>

                        <div className="glass-card feature-card">
                            <div className="feature-icon">COM</div>
                            <h3 className="feature-title">Community</h3>
                            <p className="feature-text">
                                Share builds and get feedback from thousands of PC enthusiasts
                            </p>
                        </div>
                    </div>
                </div>
            </section>

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
                                Review current catalog pricing and curated deals before you buy
                            </p>
                        </div>

                        <div className="step">
                            <div className="step-number">4</div>
                            <h3 className="step-title">Build and Share</h3>
                            <p className="step-text">
                                Save your build and share it with the community
                            </p>
                        </div>
                    </div>
                </div>
            </section>

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
                                <Link to={base + 'testers?app=nexusbuild'} className="btn btn-primary">
                                    Request Test Access
                                </Link>
                                <Link to={base + 'builder'} className="btn btn-secondary">
                                    Open Web Builder
                                </Link>
                            </div>
                            <p className="app-note">
                                Already testing? Open the latest Expo build and use About - Build
                                Diagnostics before sending bug reports.
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

            <section className="cta">
                <div className="container">
                    <div className="glass-card cta-card">
                        <h2 className="cta-title">Ready to build your dream PC?</h2>
                        <p className="cta-text">
                            Join thousands of builders who trust NexusBuild
                        </p>
                        <Link to={base + 'builder'} className="btn btn-primary btn-lg">
                            Get Started Now -&gt;
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
