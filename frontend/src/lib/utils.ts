import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

/**
 * Formats the timestamp as a string HH:MM(am/pm).
 * @param timestamp The timestamp to convert to a string.
 * @returns The timestamp, formatted as a string HH:MM(am/pm).
 */
export function formatTimestampToTimeString(timestamp : string | number | Date) {
  const date = new Date(timestamp);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hour = date.getHours(); // Convert 0 to 12 for midnight
  const minute = date.getMinutes();
  const ampm = hour >= 12 ? 'pm' : 'am';

  const formattedTime = `${day} ${month} ${year}, ${hour % 12 || 12}:${minute.toString().padStart(2, '0')}${ampm}`;
  return formattedTime;
}