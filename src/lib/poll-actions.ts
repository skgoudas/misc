import { deletePoll } from './queries';

export function deletePollById(id: number) {
    return deletePoll(id);
}
