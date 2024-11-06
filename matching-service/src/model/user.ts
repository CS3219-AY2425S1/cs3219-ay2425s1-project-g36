export type TDifficulty = "easy" | "medium" | "hard";
export type SelectedDifficultyData = {[difficulty in TDifficulty] : boolean};

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

const findCommonTopics = (user1: User, user2: User) : string[] => {
    return user1.topics.filter(topic => user2.topics.includes(topic))
}

// repeated code here, can refactor next time?
const findCommonDifficulties = (user1: User, user2: User) : TDifficulty[] => {
    const difficulties = Object.keys(user1.difficulties) as TDifficulty[];

    return difficulties.filter(
        difficulty => user1.difficulties[difficulty] && user2.difficulties[difficulty]
    );
}

const hasCommonDifficulties = (user1 : User, user2 : User) : boolean => {
    const difficulties = Object.keys(user1.difficulties) as TDifficulty[];
    
    return difficulties.some(difficulty => user1.difficulties[difficulty] && user2.difficulties[difficulty]);
}

export { User, hasCommonDifficulties, findCommonDifficulties, findCommonTopics };