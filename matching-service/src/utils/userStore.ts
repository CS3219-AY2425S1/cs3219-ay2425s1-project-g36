import { User } from "../model/user";


// UserStore is a singleton class that stores all the users 
// that are currently in the matching service to map them to their userToken.
class UserStore {
    private userStore: Map<string, User>;

    constructor() {
        this.userStore = new Map<string, User>();
    }

    addUser(userToken: string, userObject: User) {
        this.userStore.set(userToken, userObject);
    }

    getUser(userToken: string) {
        return this.userStore.get(userToken);
    }

    removeUser(userToken: string) {
        this.userStore.delete(userToken);
    }
}

const userStore = new UserStore();
export default userStore;