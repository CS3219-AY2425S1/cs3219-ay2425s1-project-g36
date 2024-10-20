export type TDifficulty = "easy" | "medium" | "hard";
export type SelectedDifficultyData = {[difficulty in TDifficulty] : boolean};

interface User {
    userToken : string;
    difficulties : SelectedDifficultyData;
    topics : string[];
    timeout : NodeJS.Timeout | null;
    isPeerReady : boolean;
    matchedUser : User | null;
}

const hasCommonDifficulties = (user1 : User, user2 : User) : boolean => {
    const difficulties = Object.keys(user1.difficulties) as TDifficulty[];
    
    return difficulties.some(difficulty => user1.difficulties[difficulty] && user2.difficulties[difficulty]);
}

export { User, hasCommonDifficulties };