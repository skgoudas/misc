'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePollPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [maxVotes, setMaxVotes] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [nominations, setNominations] = useState([{ name: '', manager: '' }]);
    const [loading, setLoading] = useState(false);

    const addNomination = () => {
        setNominations([...nominations, { name: '', manager: '' }]);
    };

    const removeNomination = (index: number) => {
        const newNoms = [...nominations];
        newNoms.splice(index, 1);
        setNominations(newNoms);
    };

    const updateNomination = (index: number, field: 'name' | 'manager', value: string) => {
        const newNoms = [...nominations];
        newNoms[index][field] = value;
        setNominations(newNoms);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate
        const validNominations = nominations.filter(n => n.name.trim() !== '');
        if (validNominations.length === 0) {
            alert('Add at least one nomination');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/poll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    maxVotes,
                    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
                    nominations: validNominations,
                }),
            });

            if (!res.ok) throw new Error('Failed to create poll');

            const poll = await res.json();
            router.push(`/vote/${poll.id}`);
        } catch (err) {
            console.error(err);
            alert('Error creating poll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container">
            <div className="glass-panel" style={{ padding: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Create New Poll
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Set up your nominations and voting constraints.
                </p>
                <div style={{ marginBottom: '20px' }}>
                    <a
                        href="/"
                        style={{
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        📋 View All Polls →
                    </a>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Poll Title</label>
                        <input
                            className="input-field"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Employee of the Month"
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Max Votes (Cap)</label>
                            <input
                                className="input-field"
                                type="number"
                                value={maxVotes}
                                onChange={(e) => setMaxVotes(e.target.value)}
                                placeholder="Total votes limit"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Expires At (Optional)</label>
                            <input
                                className="input-field"
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <label style={{ fontWeight: 600, fontSize: '1.1rem' }}>Nominations</label>
                            <button
                                type="button"
                                onClick={addNomination}
                                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                + Add
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {nominations.map((nom, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        className="input-field"
                                        placeholder="Candidate Name"
                                        value={nom.name}
                                        onChange={(e) => updateNomination(idx, 'name', e.target.value)}
                                        required
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        className="input-field"
                                        placeholder="Manager"
                                        value={nom.manager}
                                        onChange={(e) => updateNomination(idx, 'manager', e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    {nominations.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeNomination(idx)}
                                            style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn" style={{ marginTop: '20px' }} disabled={loading}>
                        {loading ? 'Creating...' : 'Launch Poll'}
                    </button>

                </form>
            </div>
        </main>
    );
}
