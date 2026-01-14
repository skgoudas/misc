import { NextResponse } from 'next/server';
import { getPollById, getVoteCountForNomination, createVote } from '@/lib/queries';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pollId, nominationId } = body;

        if (!pollId || !nominationId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Check if poll is open
        const poll = await getPollById(pollId);

        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        const candidateVotes = await getVoteCountForNomination(nominationId);

        if (poll.maxVotes !== null && poll.maxVotes > 0 && candidateVotes >= poll.maxVotes) {
            return NextResponse.json({ error: 'Nomination has reached max votes' }, { status: 403 });
        }

        // Create vote with fixed score of 1 using the simple vote system
        const voteId = await createVote(pollId, nominationId, 1);

        return NextResponse.json({ id: voteId, pollId, nominationId, score: 1 });

    } catch (error) {
        console.error('Error submitting vote:', error);
        return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
    }
}
