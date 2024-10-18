/*
TODO:
Here I only implemented a simple matching logic based on a single queue.
For now any two users could be matched together (ignoring their requirements on difficulties and topics)

TODO: matching based on user's requirements.
*/

import { assert } from "console";
import { Queue } from "./queue";
import { User } from "./user";



class QueueManager {
    private readonly matchingQueue : Queue;
    private readonly confirmationQueue : Queue;
    private readonly allUsers : {[userToken : string] : User};

    constructor() {
        this.matchingQueue = new Queue();
        this.confirmationQueue = new Queue();
        this.allUsers = {};
    }

    /**
     * Set two users as "matched together" and waiting for both of them to get ready.
     * @param user1 The first user
     * @param user2 The second user
     */
    matchTwoUsersTogether(user1 : User, user2 : User) : void {
        console.log(`Matching user with token = ${user1.userToken} and user with token = ${user2.userToken} together`);
        assert(user1.matchedUser === null, `[matchTwoUsersTogether] user1.matchedUser should be null, but got ${user1.matchedUser}`);
        assert(user2.matchedUser === null, `[matchTwoUsersTogether] user2.matchedUser should be null, but got ${user2.matchedUser}`);
        user1.matchedUser = user2;
        user2.matchedUser = user1;

        // Move users to confirmation queue
        this.confirmationQueue.push(user1);
        this.confirmationQueue.push(user2);
        this.matchingQueue.removeUser(user1);
        this.matchingQueue.removeUser(user2);
    }

    /**
     * Dismiss two matched users when at least one user failed to get ready in time.
     * @param user1 The first user
     * @param user2 The second user
     */
    private dismissMatchedUsersAfterNotGettingReady(user1 : User, user2 : User) : void {
        assert(user1.matchedUser === user2, "[dismissMatchedUsersAfterNotGettingReady] user1.matchedUser should be user2, but got " + user1.matchedUser);
        assert(user2.matchedUser === user1, "[dismissMatchedUsersAfterNotGettingReady] user2.matchedUser should be user1, but got " + user2.matchedUser);
        user1.matchedUser = null;
        user2.matchedUser = null;
    }

    /**
     * Check whether a user is already matched with another user or not
     * @param userToken The user's token
     * @returns `true` if the user with the given token is already matched to another user, `false` otherwise
     */
    isUserMatched(userToken : string) : boolean {
        return this.getUser(userToken).matchedUser !== null;
    }


    // NOTE: may be redundant ?
    /**
     * Try matching another user for a given user.
     * @param userToken The token of the given user for matching another user. The token must correspond to a user **currently in the matching service**.
     * @param userToken The token of the user
     * @returns `true` if successfully matched another user, `false` otherwise.
     */
    tryMatchWith(userToken : string) : boolean {
        if(this.matchingQueue.isEmpty()) {
            return false;
        }
        const user = this.getUser(userToken);
        // TODO: implement "matching based on user requirements" here
        const theOtherUser = this.matchingQueue.peek(0);
        if(theOtherUser.userToken === userToken) {
            return false
        }
        this.matchingQueue.pop();
        this.matchingQueue.removeUser(this.getUser(userToken));
        this.matchTwoUsersTogether(user, theOtherUser);
        return true;
    }

    /**
     * Check whether a user is in matching service based on user's token.
     * @param userToken The token of the user
     * @returns `true` if a user with this token is in matching service, `false` otherwise.
     */
    isUserInMatchingService(userToken : string) : boolean {
        return this.allUsers[userToken] !== undefined;
    }

    /**
     * Push a new user into the matching queue
     * @param user The user
     */
    push(user : User) {
        if(this.isUserInMatchingService(user.userToken)) {
            //this.removeUser(user.userToken);
            return;
        }
        this.allUsers[user.userToken] = user;
        this.matchingQueue.push(user);
    }

    /**
     * Cancel matching for a user
     * @param userToken The token of the user
     **/
    cancelMatching(userToken : string) : void {
        if(!this.isUserInMatchingService(userToken)) {
            return;
        }
        this.matchingQueue.removeUser(this.getUser(userToken));
        delete this.allUsers[userToken];
    }

    /**
     * Remove a user from the matching service
     * @param userToken The token of the user
     */
    removeUserFromMatching(userToken : string) : void {
        if(!this.isUserInMatchingService(userToken)){
            throw new Error("User does not exist in matching service");
        }
        if(this.matchingQueue.isUserInQueue(userToken)){
            this.matchingQueue.removeUser(this.getUser(userToken));
        }
        delete this.allUsers[userToken];
    }

    /**
     * Remove a user from the confirmation queue
     * @param userToken The token of the user
     */
    removeUserFromConfirmation(userToken : string) : void {
        if(!this.isUserInMatchingService(userToken)){
            throw new Error("User does not exist in matching service");
        }
        if(this.confirmationQueue.isUserInQueue(userToken)){
            this.confirmationQueue.removeUser(this.getUser(userToken));
        }
        delete this.allUsers[userToken];
    }

    private getUser(userToken : string) : User {
        if(this.allUsers[userToken] === undefined) {
            throw new Error("User does not exist");
        }
        return this.allUsers[userToken];
    }

    /**
     * Counts the number of users in the queue
     * @returns The number of users in the queue
     */
    length() : number {
        return this.matchingQueue.count();
    }

    /**
     * Get the user at the given index in the queue
     * @param index The index of the user
     * @returns The user at the given index
     */
    getIndex(index : number) : User {
        return this.matchingQueue.peek(index);
    }

    /**
     * Sets the user as ready.
     * @param userToken The token of the user
     */
    // setReady(userToken : string) : void {
    //     const user = this.getUser(userToken);
    //     user.isReady = true;
    // }

    /**
     * Check if a user is ready
     * @param userToken The token of the user
     * @returns `true` if the user is ready, `false` otherwise
     */
    // isReady(userToken : string) : boolean {
    //     return this.getUser(userToken).isReady;
    // }

    /**
     * Return the matched user of a user
     * @param userToken The token of the user
     * @returns The matched user of the user
     */
    getMatchedUser(userToken : string) : User | null {
        return this.getUser(userToken).matchedUser;
    }
}

const queueManagerInstance = new QueueManager();

export default queueManagerInstance;

