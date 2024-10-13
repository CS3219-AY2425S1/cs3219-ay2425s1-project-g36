/*
TODO:
Here I only implemented a simple matching logic based on a single queue.
For now any two users could be matched together (ignoring their requirements on difficulties and topics)

TODO: matching based on user's requirements.
*/

export type TDifficulty = "easy" | "medium" | "hard";
export type SelectedDifficultyData = {[difficulty in TDifficulty] : boolean};

type UserInQueue = {
    userID : number,
    difficulties : SelectedDifficultyData,
    topics : string[]
}


class MatchingQueue {
    private readonly queue : UserInQueue[];

    constructor() {
        this.queue = [];
    }

    push(user : UserInQueue) : void {
        if(this.queue.filter(u => u.userID === user.userID).length > 0) {
            throw new Error("This user is already in queue.");
        }
        this.queue.push(user);
    }

    pop() : UserInQueue {
        if(this.count() === 0) {
            throw new Error("Trying to pop from an empty matching queue");
        }
        return this.queue.splice(0, 1)[0];
    }

    count() : number {
        return this.queue.length;
    }
}

const matchingQueueInstance = new MatchingQueue();

export default matchingQueueInstance;