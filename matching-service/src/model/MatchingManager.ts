/*
TODO:
Here I only implemented a simple matching logic based on a single queue.
For now any two users could be matched together (ignoring their requirements on difficulties and topics)

TODO: matching based on user's requirements.
*/

import { assert } from "console";
import { MatchingQueue, User } from "./MatchingQueue";



class MatchingManager {
    private readonly queue : MatchingQueue;
    private readonly allUsers : {[userToken : string] : User};

    constructor() {
        this.queue = new MatchingQueue();
        this.allUsers = {};
    }

    /**
     * Set two users as "matched together" and waiting for both of them to get ready.
     * @param user1 The first user
     * @param user2 The second user
     */
    private matchTwoUsersTogether(user1 : User, user2 : User) : void {
        console.log(`Matching user with token = ${user1.userToken} and user with token = ${user2.userToken} together`);
        assert(user1.matchedUser === null, `[matchTwoUsersTogether] user1.matchedUser should be null, but got ${user1.matchedUser}`);
        assert(user2.matchedUser === null, `[matchTwoUsersTogether] user2.matchedUser should be null, but got ${user2.matchedUser}`);
        user1.matchedUser = user2;
        user2.matchedUser = user1;
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

    /**
     * Try matching another user for a given user.
     * @param userToken The token of the given user for matching another user. The token must correspond to a user **currently in the matching service**.
     * @param userToken The token of the user
     * @returns `true` if successfully matched another user, `false` otherwise.
     */
    tryMatchWith(userToken : string) : boolean {
        if(this.queue.isEmpty()) {
            return false;
        }
        const user = this.getUser(userToken);
        // TODO: implement "matching based on user requirements" here
        const theOtherUser = this.queue.peek();
        if(theOtherUser.userToken === userToken) {
            return false
        }
        this.queue.pop();
        this.queue.removeUser(this.getUser(userToken));
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
            this.removeUser(user.userToken);
        }
        this.allUsers[user.userToken] = user;
        this.queue.push(user);
    }

    /**
     * Cancel matching for a user
     * @param userToken The token of the user
     **/
    cancelMatching(userToken : string) : void {
        if(!this.isUserInMatchingService(userToken)) {
            return;
        }
        this.queue.removeUser(this.getUser(userToken));
        delete this.allUsers[userToken];
    }

    /**
     * Remove a user from the matching service
     * @param userToken The token of the user
     */
    removeUser(userToken : string) : void {
        if(!this.isUserInMatchingService(userToken)){
            throw new Error("User does not exist in matching service");
        }
        if(this.queue.isUserInQueue(userToken)){
            this.queue.removeUser(this.getUser(userToken));
        }
        delete this.allUsers[userToken];
    }

    private getUser(userToken : string) : User {
        if(this.allUsers[userToken] === undefined) {
            throw new Error("User does not exist");
        }
        return this.allUsers[userToken];
    }
}

const matchingManagerInstance = new MatchingManager();

export default matchingManagerInstance;

