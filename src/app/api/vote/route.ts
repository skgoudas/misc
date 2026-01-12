import { NextResponse } from 'next/server';
import { getPollById, getTotalVotesForPoll, createVote } from '@/lib/queries';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pollId, nominationId, score } = body;

        if (!pollId || !nominationId || score === undefined) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Check if valid score
        if (score < 1 || score > 10) {
            return NextResponse.json({ error: 'Score must be between 1 and 10' }, { status: 400 });
        }

        // Check if poll is open
        const poll = await getPollById(pollId);

        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        const now = new Date();
        const totalVotes = await getTotalVotesForPoll(pollId);

        if (poll.expiresAt && now > new Date(poll.expiresAt)) {
            return NextResponse.json({ error: 'Poll is closed (expired)' }, { status: 403 });
        }
        if (poll.maxVotes && totalVotes >= poll.maxVotes) {
            return NextResponse.json({ error: 'Poll is closed (max votes reached)' }, { status: 403 });
        }

        // Create vote
        const voteId = await createVote(pollId, nominationId, score);

        return NextResponse.json({ id: voteId, pollId, nominationId, score });

    } catch (error) {
        console.error('Error submitting vote:', error);
        return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
    }
}
