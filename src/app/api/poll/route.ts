import { NextResponse } from 'next/server';
import { createPoll, createNomination, getPollById, getNominationsByPollId, getAllPolls } from '@/lib/queries';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, nominations, maxVotes, expiresAt } = body;

        // Basic validation
        if (!title || !nominations || !Array.isArray(nominations) || nominations.length === 0) {
            return NextResponse.json({ error: 'Title and at least one nomination are required' }, { status: 400 });
        }

        // Create poll
        const pollId = await createPoll(
            title,
            maxVotes ? parseInt(maxVotes) : null,
            expiresAt || null
        );

        // Create nominations
        for (const nom of nominations) {
            if (nom.name && nom.manager) {
                await createNomination(pollId, nom.name, nom.manager);
            }
        }

        // Fetch the created poll with nominations
        const poll = await getPollById(pollId);
        const pollNominations = await getNominationsByPollId(pollId);

        return NextResponse.json({
            ...poll,
            nominations: pollNominations
        });
    } catch (error) {
        console.error('Error creating poll:', error);
        return NextResponse.json({
            error: 'Failed to create poll',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const polls = await getAllPolls();
        return NextResponse.json(polls);
    } catch (error) {
        console.error('Error fetching polls:', error);
        return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
    }
}
