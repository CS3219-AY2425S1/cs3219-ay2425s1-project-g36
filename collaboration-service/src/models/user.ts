/**
 * Interface representing a User participating in a collaboration session.
 */
interface User {
    userId : string;
    matchedUserId: string,
    roomId: string,
    questionId: number,
    progLang: string
}

export { User };