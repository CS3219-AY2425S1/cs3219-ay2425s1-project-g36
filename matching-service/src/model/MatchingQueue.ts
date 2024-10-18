/*
TODO:
Here I only implemented a simple matching logic based on a single queue.
For now any two users could be matched together (ignoring their requirements on difficulties and topics)

TODO: matching based on user's requirements.
*/

export type TDifficulty = "easy" | "medium" | "hard";
export type SelectedDifficultyData = {[difficulty in TDifficulty] : boolean};

type User = {
    userToken : string,
    difficulties : SelectedDifficultyData,
    topics : string[]
    isReady : boolean,
    matchedUser : User | null
}


class MatchingQueue {
    private readonly queue : User[];

    constructor() {
        this.queue = [];
    }

    private removeAt(index : number) : User {
        return this.queue.splice(index, 1)[0]
    }

    push(user : User) : void {
        if(this.isUserInQueue(user.userToken)) {
            throw new Error("This user is already matching.");
        }
        this.queue.push(user);
    }

    peek() : User {
        if(this.isEmpty()) {
            throw new Error("Trying to peek from an empty matching queue");
        }
        return this.queue[0];
    }

    pop() : User {
        if(this.isEmpty()) {
            throw new Error("Trying to pop from an empty matching queue");
        }
        return this.removeAt(0);
    }

    count() : number {
        return this.queue.length;
    }

    isEmpty() : boolean {
        return this.count() === 0;
    }

    isUserInQueue(userToken : string) : boolean {
        return this.queue.filter(u => u.userToken === userToken).length > 0;
    }

    removeUser(user : User) : void {
        this.removeAt(this.queue.indexOf(user));
    }
}

export { MatchingQueue, User };