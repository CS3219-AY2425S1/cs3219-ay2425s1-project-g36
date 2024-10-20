/**
 * Returns the question ID, as an integer. The default parseInt implementation
 * in JavaScript successfully parses objects like `1234abcd` as `1234`, when it
 * shouldn't. This function takes in a string and converts it to an integer,
 * given that the string representation of the integer is valid. This is done
 * by checking the ID string to ensure all digits are in the range 0-9.
 * 
 * Additional checks are done to filter out leading zeros, negative numbers, and
 * decimals.
 * 
 * @param id The string form of the question ID to convert to an integer.
 * 
 * @return The question ID, as an integer.
 */
export function parseQuestionId(id : string) : number {
    // regex ensures that number is 0 or a positive integer ([1-9] followed by digits).
    const regex = /^(0|[1-9]\d*)$/;

    if (regex.test(id)) {
        return parseInt(id);
    } else {
        return NaN;
    }
}