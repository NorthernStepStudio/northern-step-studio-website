import React from 'react';

export default function Doomed() {
    return (
        <div className="home">
            <section className="hero gradient-bg-hero" style={{ paddingBottom: '2rem' }}>
                <div className="container hero-container" style={{ alignItems: 'stretch' }}>
                    <div className="hero-content" style={{ maxWidth: '620px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h1 className="hero-title" style={{ marginBottom: '1rem' }}>
                            DOOMED
                        </h1>

                        <p className="hero-subtitle" style={{ maxWidth: '60ch', marginBottom: '2rem' }}>
                            A silly dungeon roguelike where you pick a doomed hero, enter the dungeon, fight enemies, collect loot, and try to survive.
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <a href="/games/nexus-roguelike/" className="btn btn-primary">
                                Play Now
                            </a>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div
                            className="glass-card"
                            style={{
                                padding: '1rem',
                                borderRadius: '28px',
                                background:
                                    'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
                                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                            }}
                        >
                            <img
                                src="https://northernstepstudio.com/assets/games/doomed/hero.png"
                                alt="DOOMED game preview"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x300?text=DOOMED';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
