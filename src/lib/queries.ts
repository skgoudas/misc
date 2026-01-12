import { db } from './db';

export interface Poll {
    id: number;
    title: string;
    maxVotes: number | null;
    expiresAt: string | null;
    closedManually: number;
    createdAt: string;
}

export interface Nomination {
    id: number;
    pollId: number;
    name: string;
    manager: string;
    createdAt: string;
    voteCount?: number;
}

export interface Vote {
    id: number;
    pollId: number;
    nominationId: number;
    score: number;
    createdAt: string;
}

// Poll operations
export async function createPoll(title: string, maxVotes: number | null, expiresAt: string | null) {
    const result = await db.execute({
        sql: 'INSERT INTO polls (title, max_votes, expires_at) VALUES (?, ?, ?)',
        args: [title, maxVotes, expiresAt]
    });
    return Number(result.lastInsertRowid);
}

export async function getPollById(id: number): Promise<Poll | null> {
    const result = await db.execute({
        sql: `
    SELECT 
      id, 
      title, 
      max_votes as maxVotes, 
      expires_at as expiresAt,
      closed_manually as closedManually,
      created_at as createdAt 
    FROM polls WHERE id = ?
  `,
        args: [id]
    });

    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as Poll;
}

export async function getAllPolls(): Promise<Poll[]> {
    const result = await db.execute(`
    SELECT 
      id, 
      title, 
      max_votes as maxVotes, 
      expires_at as expiresAt,
      closed_manually as closedManually,
      created_at as createdAt 
    FROM polls 
    ORDER BY created_at DESC
  `);
    return result.rows as unknown as Poll[];
}

// Nomination operations
export async function createNomination(pollId: number, name: string, manager: string) {
    const result = await db.execute({
        sql: 'INSERT INTO nominations (poll_id, name, manager) VALUES (?, ?, ?)',
        args: [pollId, name, manager]
    });
    return Number(result.lastInsertRowid);
}

export async function getNominationsByPollId(pollId: number): Promise<Nomination[]> {
    const result = await db.execute({
        sql: `
    SELECT 
      n.id,
      n.poll_id as pollId,
      n.name,
      n.manager,
      n.created_at as createdAt,
      COUNT(v.id) as voteCount
    FROM nominations n
    LEFT JOIN votes v ON n.id = v.nomination_id
    WHERE n.poll_id = ?
    GROUP BY n.id
    ORDER BY voteCount DESC, n.name ASC
  `,
        args: [pollId]
    });
    return result.rows as unknown as Nomination[];
}

export interface NominationWithStats extends Nomination {
    stats: {
        totalScore: number;
        voteCount: number;
        average: number;
    };
}

export async function getNominationsWithStats(pollId: number): Promise<NominationWithStats[]> {
    const result = await db.execute({
        sql: `
    SELECT 
      n.id,
      n.poll_id as pollId,
      n.name,
      n.manager,
      n.created_at as createdAt,
      COALESCE(SUM(v.score), 0) as totalScore,
      COUNT(v.id) as voteCount,
      COALESCE(AVG(v.score), 0) as average
    FROM nominations n
    LEFT JOIN votes v ON n.id = v.nomination_id
    WHERE n.poll_id = ?
    GROUP BY n.id
    ORDER BY average DESC, totalScore DESC, n.name ASC
  `,
        args: [pollId]
    });

    const rows = result.rows as any[];
    return rows.map(r => ({
        ...r,
        stats: {
            totalScore: r.totalScore,
            voteCount: r.voteCount,
            average: parseFloat(r.average.toFixed(2))
        }
    }));
}

export async function getTotalVotesForPoll(pollId: number): Promise<number> {
    const result = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM votes WHERE poll_id = ?',
        args: [pollId]
    });
    return result.rows[0].count as number;
}

// Vote operations
export async function createVote(pollId: number, nominationId: number, score: number) {
    const result = await db.execute({
        sql: 'INSERT INTO votes (poll_id, nomination_id, score) VALUES (?, ?, ?)',
        args: [pollId, nominationId, score]
    });
    return Number(result.lastInsertRowid);
}

export async function getVotesByPollAndVoter(pollId: number, voterId: string): Promise<Vote[]> {
    const result = await db.execute({
        sql: `
    SELECT 
      id,
      poll_id as pollId,
      nomination_id as nominationId,
      voter_id as voterId,
      created_at as createdAt
    FROM votes 
    WHERE poll_id = ? AND voter_id = ?
  `,
        args: [pollId, voterId]
    });
    return result.rows as unknown as Vote[];
}

export async function deleteVote(pollId: number, nominationId: number, voterId: string) {
    return await db.execute({
        sql: 'DELETE FROM votes WHERE poll_id = ? AND nomination_id = ? AND voter_id = ?',
        args: [pollId, nominationId, voterId]
    });
}

export async function deletePoll(id: number) {
    return await db.execute({
        sql: 'DELETE FROM polls WHERE id = ?',
        args: [id]
    });
}

export async function closePoll(id: number) {
    return await db.execute({
        sql: 'UPDATE polls SET closed_manually = 1 WHERE id = ?',
        args: [id]
    });
}
