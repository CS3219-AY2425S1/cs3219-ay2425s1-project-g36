/** Difficulty levels available for selection. */
export type TDifficulty = "easy" | "medium" | "hard";

/** Mapping of difficulty levels to boolean values indicating selection status. */
export type SelectedDifficultyData = {[difficulty in TDifficulty] : boolean};

/**
 * Interface representing a user in the matching system.
 */
interface User {
    id : string;
    email : string;
    difficulties : SelectedDifficultyData;
    topics : string[];
    progLangs : string[];
    timeout : NodeJS.Timeout | null;
    isPeerReady : boolean;
    matchedUser : User | null;
    confirmationStatus: string | null; // "confirmed" | "timeout" | "declined" | "waiting"
    roomId: string | null; // uuid for collaboration-service
}

/**
 * Finds common topics between two users.
 * 
 * @param {User} user1 - The first user.
 * @param {User} user2 - The second user.
 * @returns {string[]} - Array of topics that both users have in common.
 */
const findCommonTopics = (user1: User, user2: User) : string[] => {
    return user1.topics.filter(topic => user2.topics.includes(topic))
}

/**
 * Finds common difficulties between two users.
 * 
 * @param {User} user1 - The first user.
 * @param {User} user2 - The second user.
 * @returns {TDifficulty[]} - Array of difficulty levels that both users have selected.
 */
const findCommonDifficulties = (user1: User, user2: User) : TDifficulty[] => {
    const difficulties = Object.keys(user1.difficulties) as TDifficulty[];
    return difficulties.filter(
        difficulty => user1.difficulties[difficulty] && user2.difficulties[difficulty]
    );
}

/**
 * Checks if two users have any common difficulties selected.
 * 
 * @param {User} user1 - The first user.
 * @param {User} user2 - The second user.
 * @returns {boolean} - True if there are any common difficulties; otherwise, false.
 */
const hasCommonDifficulties = (user1 : User, user2 : User) : boolean => {
    const difficulties = Object.keys(user1.difficulties) as TDifficulty[];

    return difficulties.some(difficulty => user1.difficulties[difficulty] && user2.difficulties[difficulty]);
}

export { User, hasCommonDifficulties, findCommonDifficulties, findCommonTopics };