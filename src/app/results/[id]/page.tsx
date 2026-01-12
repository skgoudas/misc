'use client';

import { use, useEffect, useState } from 'react';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [poll, setPoll] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`/api/poll/${id}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setPoll(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [id]);

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>Loading Results...</div>;
    if (!poll) return <div className="container" style={{ textAlign: 'center' }}>Poll not found</div>;

    if (poll.status === 'OPEN') {
        return (
            <main className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
                <div className="glass-panel" style={{ padding: '40px' }}>
                    <h1>Results Hidden</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        This poll is still OPEN. Results will be available once it closes.
                    </p>
                    <a href={`/vote/${poll.id}`} style={{ display: 'inline-block', marginTop: '20px', color: 'var(--primary)', textDecoration: 'underline' }}>
                        Go to Voting Page
                    </a>
                </div>
            </main>
        );
    }

    // Find max average for progress calculation
    const maxAvg = Math.max(...poll.nominations.map((n: any) => n.stats.average));

    return (
        <main className="container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Final Results</h1>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{poll.title}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {poll.nominations.map((nom: any, index: number) => (
                    <div key={nom.id} className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'rgba(255,255,255,0.2)',
                            width: '40px',
                            textAlign: 'center'
                        }}>
                            #{index + 1}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0 }}>{nom.name}</h3>
                                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>{nom.stats.average}</span>
                            </div>

                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(nom.stats.average / 10) * 100}%`,
                                    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                                    borderRadius: '4px'
                                }} />
                            </div>

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                Manager: {nom.manager} • {nom.stats.voteCount} votes • Total Score: {nom.stats.totalScore}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <a href="/create" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Create New Poll</a>
            </div>
        </main>
    );
}
