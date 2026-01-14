'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [poll, setPoll] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [votedNominations, setVotedNominations] = useState<string[]>([]);
    const MAX_VOTES = 3;

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
        if (votedNominations.includes(nominationId)) return;
        if (votedNominations.length >= MAX_VOTES) return;

        const newVal = [...votedNominations, nominationId];
        setVotedNominations(newVal);
        localStorage.setItem(`voted_${id}`, JSON.stringify(newVal));
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>Loading Poll...</div>;
    if (!poll) return <div className="container" style={{ textAlign: 'center' }}>Poll not found</div>;

    const votesRemaining = MAX_VOTES - votedNominations.length;

    return (
        <main className="container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{poll.title}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {votesRemaining > 0
                        ? `You have ${votesRemaining} vote${votesRemaining !== 1 ? 's' : ''} remaining.`
                        : "You have used all your votes."}
                </p>
                <div style={{ marginTop: '10px', height: '4px', width: '200px', background: 'var(--card-bg)', margin: '10px auto', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${(votedNominations.length / MAX_VOTES) * 100}%`,
                        background: 'var(--primary)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>

            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {poll.nominations.map((nom: any) => (
                    <VoteCard
                        key={nom.id}
                        nomination={nom}
                        pollId={poll.id}
                        isVoted={votedNominations.includes(nom.id)}
                        canVote={votesRemaining > 0}
                        onVote={() => recordVote(nom.id)}
                    />
                ))}
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <button
                    onClick={() => router.push(`/results/${id}`)}
                    style={{ background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                >
                    View Results
                </button>
            </div>
        </main>
    );
}

function VoteCard({ nomination, pollId, isVoted, canVote, onVote }: { nomination: any, pollId: string, isVoted: boolean, canVote: boolean, onVote: () => void }) {
    const [submitting, setSubmitting] = useState(false);

    const handleVote = async () => {
        if (!canVote) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pollId,
                    nominationId: nomination.id,
                    score: 1 // Default score for simple vote
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
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', opacity: isVoted ? 0.8 : canVote ? 1 : 0.5 }}>
            <div>
                <h3 style={{ marginBottom: '4px', fontSize: '1.25rem' }}>{nomination.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manager: {nomination.manager}</p>
            </div>

            {!isVoted ? (
                <button
                    className="btn"
                    onClick={handleVote}
                    disabled={submitting || !canVote}
                    style={{
                        width: '100%',
                        marginTop: 'auto',
                        opacity: canVote ? 1 : 0.5,
                        cursor: canVote ? 'pointer' : 'not-allowed'
                    }}
                >
                    {submitting ? 'Submitting...' : canVote ? 'Vote' : 'No Votes Left'}
                </button>
            ) : (
                <div style={{ marginTop: 'auto', textAlign: 'center', color: '#10b981', fontWeight: 600, padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                    ✓ Voted
                </div>
            )}
        </div>
    );
}
