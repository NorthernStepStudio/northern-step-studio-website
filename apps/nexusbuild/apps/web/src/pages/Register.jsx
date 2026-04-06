import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, error } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await register(username, email, password);
        if (result.success) {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="container" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h1>
            {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
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
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    );
}
