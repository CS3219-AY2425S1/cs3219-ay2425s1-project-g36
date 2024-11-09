import { User } from "../models/user";

// CollabStore is a singleton class. Users will be added to this CollabStore ONLY when they are collaborating.
// CollabStore is a single source of truth to give all the information regarding a user's collaboration details.
class CollabStore {
    private collabStore: Map<string, User>;

    constructor() {
        this.collabStore = new Map<string, User>();
    }

    addUser(userId: string, userObject: User) {
        this.collabStore.set(userId, userObject);
    }

    getUser(userId: string) {
        return this.collabStore.get(userId);
    }

    updateUserProgLang(userId: string, progLang: string) {
        const user = this.collabStore.get(userId)
        if (user) {
            user.progLang = progLang
        } else {
            console.warn(`User with ID ${userId} not found in collabStore.`);
        }
    }

    removeUser(userId: string) {
        this.collabStore.delete(userId);
    }

    hasUser(userId: string) {
        return this.collabStore.has(userId);
    }

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