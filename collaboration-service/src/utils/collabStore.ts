import { User } from "../models/user";

/**
 * CollabStore is a singleton class that maintains a record of users currently collaborating.
 * It serves as the single source of truth for a user's collaboration details and stores this information in a Map.
 * Only users actively collaborating are stored in CollabStore.
 */
class CollabStore {
    private collabStore: Map<string, User>;

    constructor() {
        this.collabStore = new Map<string, User>();
    }

    /**
     * Adds a user to the collabStore.
     * 
     * @param {string} userId - Unique identifier for the user.
     * @param {User} userObject - User object containing collaboration details.
     */
    addUser(userId: string, userObject: User) {
        this.collabStore.set(userId, userObject);
    }

    /**
     * Retrieves a user from the collabStore.
     * 
     * @param {string} userId - Unique identifier for the user.
     * @returns {User | undefined} - The User object if found, otherwise undefined.
     */
    getUser(userId: string) {
        return this.collabStore.get(userId);
    }

    /**
     * Updates the programming language for a specified user in the collabStore.
     * 
     * @param {string} userId - Unique identifier for the user.
     * @param {string} progLang - The programming language to update.
     */
    updateUserProgLang(userId: string, progLang: string) {
        const user = this.collabStore.get(userId)
        if (user) {
            user.progLang = progLang
        } else {
            console.warn(`User with ID ${userId} not found in collabStore.`);
        }
    }

    /**
     * Removes a user from the collabStore.
     * 
     * @param {string} userId - Unique identifier for the user.
     */
    removeUser(userId: string) {
        this.collabStore.delete(userId);
    }

    /**
     * Checks if a user exists in the collabStore.
     * 
     * @param {string} userId - Unique identifier for the user.
     * @returns {boolean} - True if the user exists in the collabStore, otherwise false.
     */
    hasUser(userId: string) {
        return this.collabStore.has(userId);
    }

    /**
     * Prints the contents of the collabStore to the console in a table format.
     * Displays userId, matchedUserId, roomId, questionId, and progLang for each user in the store.
     */
    printContents() {
        const contents = Array.from(this.collabStore.entries()).map(([key, value]) => ({
            userId: key,
            matchedUserId: value.matchedUserId,
            roomId: value.roomId,
            questionId: value.questionId,
            progLang: value.progLang
        }));
        
        console.table(contents);
    }

}

const collabStore = new CollabStore();
export default collabStore;