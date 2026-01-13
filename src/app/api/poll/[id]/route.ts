import { NextResponse } from 'next/server';
import { getPollById, getNominationsByPollId, getNominationsWithStats, getTotalVotesForPoll, deletePoll } from '@/lib/queries';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const pollId = parseInt(id);

        const poll = await getPollById(pollId);

        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        // Calculate status
        const now = new Date();
        const totalVotes = await getTotalVotesForPoll(pollId);

        let isClosed = false;
        if (poll.closedManually === 1) {
            isClosed = true;
        }

        // Return poll data WITH ranked results regardless of status
        const rankedNominations = await getNominationsWithStats(pollId);

        return NextResponse.json({
            ...poll,
            nominations: rankedNominations,
            status: isClosed ? 'CLOSED' : 'OPEN',
            totalVotes
        });

    } catch (error) {
        console.error('Error fetching poll:', error);
        return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 });
    }
}



export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const pollId = parseInt(id);

        await deletePoll(pollId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting poll:', error);
        return NextResponse.json({ error: 'Failed to delete poll' }, { status: 500 });
    }
}
