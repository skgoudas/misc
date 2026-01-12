'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [poll, setPoll] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [votedNominations, setVotedNominations] = useState<string[]>([]);

    useEffect(() => {
        // Load local voted state
        const local = localStorage.getItem(`voted_${id}`);
        if (local) {
            setVotedNominations(JSON.parse(local));
        }

        fetchWrapper();
    }, [id]);

    const fetchWrapper = async () => {
        try {
            const res = await fetch(`/api/poll/${id}`);
            if (!res.ok) {
                if (res.status === 404) return alert('Poll not found');
                throw new Error('Failed to fetch');
            }
            const data = await res.json();
            setPoll(data);

            if (data.status === 'CLOSED') {
                router.push(`/results/${id}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const recordVote = (nominationId: string) => {
        const newVal = [...votedNominations, nominationId];
        setVotedNominations(newVal);
        localStorage.setItem(`voted_${id}`, JSON.stringify(newVal));
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>Loading Poll...</div>;
    if (!poll) return <div className="container" style={{ textAlign: 'center' }}>Poll not found</div>;

    return (
        <main className="container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{poll.title}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Rate the nominations below from 1 to 10.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {poll.nominations.map((nom: any) => (
                    <VoteCard
                        key={nom.id}
                        nomination={nom}
                        pollId={poll.id}
                        isVoted={votedNominations.includes(nom.id)}
                        onVote={() => recordVote(nom.id)}
                    />
                ))}
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <button
                    onClick={() => router.push(`/results/${id}`)}
                    style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                >
                    View Results (Only if Closed)
                </button>
            </div>
        </main>
    );
}

function VoteCard({ nomination, pollId, isVoted, onVote }: { nomination: any, pollId: string, isVoted: boolean, onVote: () => void }) {
    const [score, setScore] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    const handleVote = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pollId,
                    nominationId: nomination.id,
                    score
                }),
            });

            if (!res.ok) {
                const d = await res.json();
                alert(d.error || 'Failed to vote');
            } else {
                onVote();
            }
        } catch (e) {
            alert('Error voting');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', opacity: isVoted ? 0.6 : 1 }}>
            <div>
                <h3 style={{ marginBottom: '4px', fontSize: '1.25rem' }}>{nomination.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manager: {nomination.manager}</p>
            </div>

            {!isVoted ? (
                <>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Score</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{score}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={score}
                            onChange={(e) => setScore(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span>1</span>
                            <span>10</span>
                        </div>
                    </div>

                    <button
                        className="btn"
                        onClick={handleVote}
                        disabled={submitting}
                        style={{ width: '100%', marginTop: 'auto' }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Vote'}
                    </button>
                </>
            ) : (
                <div style={{ marginTop: 'auto', textAlign: 'center', color: '#10b981', fontWeight: 600, padding: '12px' }}>
                    ✓ Voted
                </div>
            )}
        </div>
    );
}
