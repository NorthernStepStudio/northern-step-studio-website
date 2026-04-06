import React, { useState } from 'react';
import { reportsAPI } from '../services/api';

export default function BugReportBtn() {
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSubmitting(true);
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('description', description);
            if (image) {
                formData.append('image', image);
            }

            await reportsAPI.create(formData);

            setMessage('Report submitted! Thank you.');
            setDescription('');
            setImage(null);
            setTimeout(() => {
                setIsOpen(false);
                setMessage('');
            }, 2000);
        } catch (error) {
            console.error('Report Error:', error);
            setMessage('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 9999, fontFamily: 'Inter, sans-serif' }}>
            {/* Modal */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    left: '0',
                    width: '320px',
                    background: 'rgba(20, 20, 30, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    padding: '1.5rem',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Report a Bug</h3>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                    </div>

                    {message ? (
                        <div style={{ padding: '1rem', background: 'rgba(72, 187, 120, 0.2)', color: '#48bb78', borderRadius: '8px', textAlign: 'center' }}>
                            {message}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <textarea
                                placeholder="Describe the issue..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.8rem', color: 'white', outline: 'none', resize: 'none' }}
                                required
                            />

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#aaa', cursor: 'pointer' }}>
                                <span>📎 {image ? image.name : 'Attach Screenshot (Optional)'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    padding: '0.8rem',
                                    background: '#e53e3e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}
                            >
                                {isSubmitting ? 'Sending...' : 'Submit Report'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: '#e53e3e',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(229, 62, 62, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white',
                        transition: 'transform 0.2s'
                    }}
                    title="Report a Bug"
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    🐞
                </button>
            )}
        </div>
    );
}
