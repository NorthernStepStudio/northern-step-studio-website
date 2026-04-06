import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/google/redirect_url`);
            const { redirectUrl } = await response.json();
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        } catch (err) {
            console.error('Google login error:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="container" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login</h1>
            {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#666' }}>OR</div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: 'white',
                        color: '#444',
                        border: '1px solid #ddd',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.91 2.26c1.7-1.57 2.68-3.88 2.68-6.59z"/>
                        <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.85.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7L1.06 13.04C2.54 16 5.51 18 9 18z"/>
                        <path fill="#FBBC05" d="M3.97 10.72c-.18-.54-.28-1.12-.28-1.72s.1-1.18.28-1.72L1.06 4.96C.38 6.18 0 7.55 0 9s.38 2.82 1.06 4.04l2.91-2.32z"/>
                        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.51 0 2.54 2 1.06 4.96L3.97 7.28C4.68 5.16 6.66 3.58 9 3.58z"/>
                    </svg>
                    Continue with Google
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Don't have an account? <a href="/register">Register</a>
            </p>
        </div>
    );
}
