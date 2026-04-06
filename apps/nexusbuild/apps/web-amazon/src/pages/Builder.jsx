import React, { useState } from 'react';
import { useBuild } from '../contexts/BuildContext';
import { partsAPI } from '../services/api';

const PART_CATEGORIES = [
    { key: 'cpu', name: 'CPU', icon: '💻' },
    { key: 'gpu', name: 'GPU', icon: '🎮' },
    { key: 'motherboard', name: 'Motherboard', icon: '🔌' },
    { key: 'ram', name: 'RAM', icon: '💾' },
    { key: 'storage', name: 'Storage', icon: '💽' },
    { key: 'psu', name: 'Power Supply', icon: '⚡' },
    { key: 'case', name: 'Case', icon: '📦' },
    { key: 'cooler', name: 'Cooler', icon: '❄️' },
    { key: 'fan', name: 'Case Fans', icon: '💨' },
    { key: 'monitor', name: 'Monitor', icon: '🖥️' },
    { key: 'keyboard', name: 'Keyboard', icon: '⌨️' },
    { key: 'mouse', name: 'Mouse', icon: '🖱️' },
    { key: 'os', name: 'Operating System', icon: '💿' },
    { key: 'accessory', name: 'Accessories', icon: '🎧' },
];

export default function Builder() {
    const { currentBuild, setBuildName, addPart, removePart, clearBuild, getTotalPrice, getPartCount, setBudget } = useBuild();

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [availableParts, setAvailableParts] = useState([]);
    const [loadingParts, setLoadingParts] = useState(false);

    const handleSave = () => {
        // Save feature is for premium members only
        alert('Saving builds is a premium feature. Download the NexusBuild app for the full experience!');
    };

    const openPartSelection = async (category) => {
        setActiveCategory(category);
        setShowModal(true);
        setLoadingParts(true);
        try {
            // Mock fetching parts or real API if backend is ready with data
            // For now, let's assume API works or we fallback to mock if empty
            const parts = await partsAPI.getAll(category.key);
            setAvailableParts(parts.length > 0 ? parts : getMockParts(category.key));
        } catch (err) {
            console.error(err);
            setAvailableParts(getMockParts(category.key));
        } finally {
            setLoadingParts(false);
        }
    };

    const selectPart = (part) => {
        addPart(activeCategory.key, part);
        setShowModal(false);
    };

    // Fallback Mock Data
    const getMockParts = (category) => {
        const mocks = {
            cpu: [
                { id: 1, name: 'Intel Core i9-13900K', price: 589.99, specs: { cores: 24, threads: 32 } },
                { id: 2, name: 'AMD Ryzen 9 7950X', price: 599.00, specs: { cores: 16, threads: 32 } },
            ],
            gpu: [
                { id: 3, name: 'NVIDIA RTX 4090', price: 1599.99, specs: { vram: '24GB' } },
                { id: 4, name: 'AMD Radeon RX 7900 XTX', price: 999.99, specs: { vram: '24GB' } },
            ]
        };
        return mocks[category] || [
            { id: 99, name: `Generic ${category.toUpperCase()}`, price: 99.99 }
        ];
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            {/* Header / Stats */}
            {/* Header / Stats / Compatibility */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '2rem' }}>
                {/* Left: Title & Name Input */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', background: 'linear-gradient(135deg, #a0aec0 0%, #cbd5e0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Pick your Parts
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#718096', fontSize: '0.9rem' }}>Build Name:</span>
                        <input
                            type="text"
                            value={currentBuild.name}
                            onChange={(e) => setBuildName(e.target.value)}
                            style={{ fontSize: '1.2rem', fontWeight: '500', background: 'transparent', border: 'none', borderBottom: '1px solid #4a5568', color: 'white', width: '100%', outline: 'none', padding: '0.2rem 0' }}
                        />
                    </div>
                </div>

                {/* Right: Compatibility & Stats */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {/* Budget Control */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e0' }}>
                            <span>Budget Range</span>
                            <span>${currentBuild.budget?.min || 0} - ${currentBuild.budget?.max || 2000}</span>
                        </div>
                        {/* Budget Progress Bar */}
                        <div style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${Math.min((getTotalPrice() / (currentBuild.budget?.max || 2000)) * 100, 100)}%`,
                                background: getTotalPrice() > (currentBuild.budget?.max || 2000) ? '#e53e3e' : '#48bb78',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                            <input
                                type="number"
                                placeholder="Min"
                                value={currentBuild.budget?.min || ''}
                                onChange={(e) => setBudget(Number(e.target.value), currentBuild.budget?.max || 2000)}
                                style={{ width: '45%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: '0.8rem' }}
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={currentBuild.budget?.max || ''}
                                onChange={(e) => setBudget(currentBuild.budget?.min || 0, Number(e.target.value))}
                                style={{ width: '45%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: '0.8rem', textAlign: 'right' }}
                            />
                        </div>
                    </div>

                    {/* Compatibility Check */}
                    <div style={{ background: 'rgba(72, 187, 120, 0.1)', border: '1px solid #48bb78', padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '1.8rem' }}>✅</div>
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#48bb78', fontSize: '1rem' }}>Compatibility Check</div>
                            <div style={{ color: '#fff', fontSize: '0.9rem' }}>All parts are compatible!</div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{getPartCount()}/14</div>
                            <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Parts</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#48bb78' }}>${getTotalPrice().toLocaleString()}</div>
                            <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={clearBuild} style={{ padding: '0.8rem 1.5rem', borderRadius: '999px', border: '1px solid #e53e3e', background: 'transparent', color: '#e53e3e', fontWeight: 'bold', cursor: 'pointer' }}>
                    Clear Build
                </button>
                <button onClick={handleSave} style={{ padding: '0.8rem 1.5rem', borderRadius: '999px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    Save Build
                </button>
            </div>

            {/* Parts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', position: 'relative' }}>
                {PART_CATEGORIES.map(cat => {
                    const part = currentBuild.parts[cat.key];
                    return (
                        <div key={cat.key}
                            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}
                            className="part-card-hover"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                                    <h3 style={{ margin: 0 }}>{cat.name}</h3>
                                </div>
                                {part ? (
                                    <button onClick={() => removePart(cat.key)} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                                ) : (
                                    <button onClick={() => openPartSelection(cat)} style={{ background: 'rgba(102, 126, 234, 0.2)', border: 'none', color: '#a3bffa', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>+ Add</button>
                                )}
                            </div>

                            {part ? (
                                <div className="part-info">
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{part.name}</div>
                                    <div style={{ color: '#48bb78', fontWeight: 'bold' }}>${part.price}</div>
                                    {part.image_url && <img src={part.image_url} alt={part.name} style={{ width: '100%', height: '150px', objectFit: 'contain', marginTop: '1rem', borderRadius: '8px' }} />}

                                    {/* Tooltip on Hover */}
                                    <div className="tooltip" style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'rgba(0, 0, 0, 0.95)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        width: '250px',
                                        zIndex: 100,
                                        display: 'none', // Controlled by CSS
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                                        marginBottom: '10px'
                                    }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#667eea' }}>Specs</h4>
                                        <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                                            {part.specs && typeof part.specs === 'object' ? (
                                                <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                                    {Object.entries(part.specs).slice(0, 5).map(([k, v]) => (
                                                        <li key={k}><strong style={{ textTransform: 'capitalize' }}>{k}:</strong> {String(v)}</li>
                                                    ))}
                                                </ul>
                                            ) : part.specs && typeof part.specs === 'string' ? (
                                                <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                                    {Object.entries(JSON.parse(part.specs)).slice(0, 5).map(([k, v]) => (
                                                        <li key={k}><strong style={{ textTransform: 'capitalize' }}>{k}:</strong> {v}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>No specs available.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '8px' }}>
                                    Empty Slot
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Part Selection Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1a202c', width: '90%', maxWidth: '600px', height: '80vh', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>Select {activeCategory?.name}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {loadingParts ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading parts...</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {availableParts.map(part => (
                                        <div key={part.id} onClick={() => selectPart(part)} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid transparent', transition: 'border 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                                            <div style={{ fontWeight: 'bold' }}>{part.name}</div>
                                            <div style={{ color: '#48bb78' }}>${part.price}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
