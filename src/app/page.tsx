'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();
    const [polls, setPolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const res = await fetch('/api/poll');
            if (!res.ok) throw new Error('Failed to fetch polls');
            const data = await res.json();
            setPolls(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`/api/poll/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            // Refresh polls list
            fetchPolls();
        } catch (error) {
            console.error(error);
            alert('Failed to delete poll');
        }
    };

    const handleClose = async (id: number) => {
        if (!confirm('Are you sure you want to close this poll? Voting will be stopped and results will be visible.')) {
            return;
        }

        try {
            const res = await fetch(`/api/poll/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'close' }),
            });

            if (!res.ok) throw new Error('Failed to close poll');

            // Refresh polls list
            fetchPolls();
            alert('Poll closed successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to close poll');
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
                Loading polls...
            </div>
        );
    }

    return (
        <main className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>All Polls</h1>
                <button
                    className="btn"
                    onClick={() => router.push('/create')}
                    style={{ background: 'var(--primary)' }}
                >
                    + Create New Poll
                </button>
            </div>

            {polls.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        No polls created yet. Create your first poll!
                    </p>
                    <button
                        className="btn"
                        onClick={() => router.push('/create')}
                        style={{ marginTop: '20px' }}
                    >
                        Create Poll
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {polls.map((poll) => (
                        <div
                            key={poll.id}
                            className="glass-panel"
                            style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
                                        {poll.title || 'Untitled Poll'}
                                    </h3>
                                    {poll.closedManually === 1 && (
                                        <span style={{
                                            background: '#ef4444',
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}>
                                            CLOSED
                                        </span>
                                    )}
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Created {new Date(poll.createdAt).toLocaleDateString()} at{' '}
                                    {new Date(poll.createdAt).toLocaleTimeString()}
                                    {poll.maxVotes && ` • Max Votes: ${poll.maxVotes}`}
                                    {poll.expiresAt && ` • Expires: ${new Date(poll.expiresAt).toLocaleDateString()}`}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className="btn"
                                    onClick={() => router.push(`/vote/${poll.id}`)}
                                    style={{ background: 'var(--primary)', padding: '8px 16px' }}
                                >
                                    Vote
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => router.push(`/results/${poll.id}`)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--accent)',
                                        color: 'var(--accent)',
                                        padding: '8px 16px'
                                    }}
                                >
                                    Results
                                </button>
                                {poll.closedManually !== 1 && (
                                    <button
                                        onClick={() => handleClose(poll.id)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #f59e0b',
                                            color: '#f59e0b',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = '#f59e0b';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#f59e0b';
                                        }}
                                    >
                                        Close
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(poll.id)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #ef4444',
                                        color: '#ef4444',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = '#ef4444';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#ef4444';
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
