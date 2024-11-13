import { User } from "./user";

/**
 * Queue class manages a queue of users for a matching service.
 * Provides methods to add, remove, and inspect users in the queue.
 */
class Queue {
    private readonly queue: User[];

    constructor() {
        this.queue = [];
    }

    /**
     * Removes a user at the specified index.
     * 
     * @param {number} index - The index to remove the user from.
     * @returns {User} - The removed user.
     */
    private removeAt(index: number): User {
        return this.queue.splice(index, 1)[0]
    }

    /**
     * Adds a user to the queue.
     * 
     * @param {User} user - The user to add.
     * @throws Error if the user is already in the queue.
     */
    push (user: User): void {
        if(this.isUserInQueue(user.id)) {
            throw new Error("This user is already matching.");
        }
        this.queue.push(user);
    }

    /**
     * Retrieves the user at a specified index without removing them.
     * 
     * @param {number} index - The index of the user to peek at.
     * @returns {User} - The user at the specified index.
     * @throws Error if the queue is empty.
     */
    peek(index: number): User {
        if (this.isEmpty()) {
            throw new Error("Trying to peek from an empty matching queue");
        }
        return this.queue[index];
    }

    /**
     * Removes and returns the user at the front of the queue.
     * 
     * @returns {User} - The user at the front of the queue.
     * @throws Error if the queue is empty.
     */
    pop(): User {
        if (this.isEmpty()) {
            throw new Error("Trying to pop from an empty matching queue");
        }
        return this.removeAt(0);
    }

    /**
     * Gets the number of users in the queue.
     * 
     * @returns {number} - The count of users in the queue.
     */
    count(): number {
        return this.queue.length;
    }

    /**
     * Checks if the queue is empty.
     * 
     * @returns {boolean} - True if the queue is empty, otherwise false.
     */
    isEmpty(): boolean {
        return this.count() === 0;
    }

    /**
     * Checks if a user is in the queue by their ID.
     * 
     * @param {string} id - The ID of the user.
     * @returns {boolean} - True if the user is in the queue, otherwise false.
     */
    isUserInQueue(id: string): boolean {
        return this.queue.filter(u => u.id === id).length > 0;
    }

    /**
     * Removes a user from the queue.
     * 
     * @param {User} user - The user to remove.
     */
    removeUser(user: User): void {
        this.removeAt(this.queue.indexOf(user));
    }

    /**
     * Retrieves all user IDs currently in the queue.
     * 
     * @returns {string[]} - An array of user IDs.
     */
    getUserIds(): string[] { 
        const user_ids: string[] = []; 
        this.queue.forEach((user) => { 
            user_ids.push(user.id);  
        }); 
 
        return user_ids;  
    }

    /**
     * Retrieves all user emails currently in the queue.
     * 
     * @returns {string[]} - An array of user emails.
     */
    getUserEmails(): string[] { 
        const user_emails: string[] = []; 
        this.queue.forEach((user) => { 
            user_emails.push(user.email);  
        }); 
 
        return user_emails;  
    }
}

export { Queue };