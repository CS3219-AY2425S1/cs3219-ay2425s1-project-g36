import { User } from "../model/user";


// UserStore is a singleton class that stores all the users 
// that are currently in the matching service to map them to their user id.
class UserStore {
    private userStore: Map<string, User>;

    constructor() {
        this.userStore = new Map<string, User>();
    }

    addUser(userId: string, userObject: User) {
        this.userStore.set(userId, userObject);
    }

    getUser(userId: string) {
        return this.userStore.get(userId);
    }

    removeUser(userId: string) {
        this.userStore.delete(userId);
    }

    hasUser(userId: string) {
        return this.userStore.has(userId);
    }
}

const userStore = new UserStore();
export default userStore;