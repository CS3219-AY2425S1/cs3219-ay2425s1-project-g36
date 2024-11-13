import { User } from "../model/user";

/**
 * UserStore is a singleton class that manages the users currently in the matching service.
 * It provides methods to add, retrieve, remove, and check for users based on their user ID.
 */
class UserStore {
    private userStore: Map<string, User>;

    constructor() {
        this.userStore = new Map<string, User>();
    }

    /**
     * Adds a user to the store.
     * 
     * @param {string} userId - The unique identifier for the user.
     * @param {User} userObject - The user object containing user details.
     */
    addUser(userId: string, userObject: User) {
        this.userStore.set(userId, userObject);
    }

    /**
     * Retrieves a user from the store by their ID.
     * 
     * @param {string} userId - The unique identifier for the user.
     * @returns {User | undefined} - The user object if found, otherwise undefined.
     */
    getUser(userId: string): User | undefined {
        return this.userStore.get(userId);
    }

    /**
     * Removes a user from the store by their ID.
     * 
     * @param {string} userId - The unique identifier for the user.
     */
    removeUser(userId: string) {
        this.userStore.delete(userId);
    }

    /**
     * Checks if a user exists in the store by their ID.
     * 
     * @param {string} userId - The unique identifier for the user.
     * @returns {boolean} - True if the user exists, otherwise false.
     */
    hasUser(userId: string): boolean {
        return this.userStore.has(userId);
    }

    /**
     * Returns a string representation of all users in the store.
     * 
     * @returns {string} - A formatted string listing all users and their details.
     */
    toString(): string {
        let userStoreString = "";
        this.userStore.forEach((user, userId) => {
            userStoreString += userId + " : " + user.toString() + "\n";
        });
        return userStoreString;
    }
}

const userStore = new UserStore();
export default userStore;