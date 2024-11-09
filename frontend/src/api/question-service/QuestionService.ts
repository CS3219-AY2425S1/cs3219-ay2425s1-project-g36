/**
 * Module that represents information to and from the Question Service.
 */

import axios from "axios";
import { EMPTY_QUESTION, fromQuestionList, Question, toQuestionObject } from "./Question";

/**
 * URL of question service microservice to be used.
 */
// const QUESTION_SERVICE_URL = "http://localhost:3000/";
const QUESTION_SERVICE_URL = "http://question:3000/";

const api = axios.create({
  baseURL: QUESTION_SERVICE_URL,
  
});

/**
 * An async function that fetches the question list from the backend question
 * service.
 * 
 * @returns The question list from the question-service as a promise. Returns 
 * an error message as a string if there are any error that occur from fetching
 * questions.
 */
export async function fetchQuestions() : Promise<Question[] | string> {
  const data = await api.get('/questions/').then(response => {
    console.log(`questions fetched: ${response.data.data}`)
    return response.data.data;
  }).catch(error => {
    console.error("An error occurred when fetching questions in fetchQuestions():", error);
    return error.message;
  });
  return (typeof data === "string") ? data : fromQuestionList(data);
}

/**
 * An async function that fetches a specific question from the backend question
 * service based on the given ID. Returns an empty question if the ID is invalid.
 * 
 * `fetchQuestion()` has the same result but does not consider empty IDs.
 * 
 * @param id The ID of the question to fetch, if any.
 * @returns The question within the backend question service if it exists; the
 * `EMPTY_QUESTION` if `id` is undefined, `null` otherwise.
 */
export async function fetchQuestionById(id? : string) : Promise<Question | null> {
  if (id === undefined) return EMPTY_QUESTION;

  const data = await api.get('/questions/' + id).then(response => {
    return response.data;
  }).catch(error => {
    console.error("An error occurred when fetching the question with ID " + id + " from fetchQuestionById():", error);
    return null;
  })
  return data === null ? null : toQuestionObject(data);
}

/**
 * An async function that fetches a specific question from the backend question
 * service based on the given ID. Returns `null` if the ID is invalid.
 * 
 * `fetchQuestionById()` has the same result but returns `EMPTY_QUESTION` when ID is not
 * provided (for adding of questions).
 * 
 * @param id The ID of the question to fetch, if any.
 * 
 * @returns The question within the backend question service if it exists;
 * `null` otherwise.
 */
export async function fetchQuestion(id: string) : Promise<Question | null> {
  try {
    const question = await api.get('/questions/' + id)
    return question.data
  } catch (error) {
    console.error(`An error occurred when fetching question of id ${id} in fetchQuestion():`, error)
    return null
  }
}

/**
 * An async function that inserts a question given the question. If there are any
 * errors in inserting the question (e.g. duplicate question title), an error is
 * produced in the console. Returns a JavaScript object containing response status
 * and the response message:
 * 
 * `{status: response_status, message: response_data}`.
 * 
 * @param question The question to insert.
 * @returns The response status and message in JSON format, for example: `{status: 200, message: 'Successfully inserted question!'}`. 
 */
export async function insertQuestion(question : Question) {
  const newQuestionData = {
    title: question.title,
    description: question.description,
    topics: question.topics,
    difficulty: question.difficulty
  };
  return await api.post('/questions/', newQuestionData).then(response => {
    return { status: response.status, message: response.data };
  }).catch(error => {
    console.error("An error occurred when adding question in insertQuestion():", error);
    return { 
      status: error.response ? error.response.status : 503, 
      message: error.response ? error.response.data.message : error.message 
    };
  });
}

/**
 * An async function that updates a question given the question. If there are any
 * errors in updating the question (e.g. duplicate question title), an error is
 * produced in the console. Returns a JavaScript object containing response status
 * and the response message:
 * 
 * `{status: response_status, message: response_data}`.
 * 
 * @param question The question to update.
 * @returns The response status and message in JSON format, for example: `{status: 200, message: 'Successfully updated question!'}`. 
 */
export async function updateQuestion(question : Question) {
  const id = question.id;
  const newQuestionData = {
    title: question.title,
    description: question.description,
    topics: question.topics,
    difficulty: question.difficulty
  };
  return await api.put('/questions/' + id, newQuestionData).then(response => {
    return { status: response.status, message: response.data };
  }).catch(error => {
    console.error("An error occurred when updating question " + id + " in updateQuestion():", error);
    return { 
      status: error.response ? error.response.status : 503, 
      message: error.response ? error.response.data.message : error.message 
    };  
  });
}


/**
 * An async function that fetches the list of topics from the backend question service.
 * 
 * @returns The list of topics from the question-service as a promise.
 */
export async function fetchTopics(): Promise<string[]> {
  try {
    const response = await api.get('/questions/topics');
    return response.data;
  } catch (error) {
    console.error("An error occurred when fetching topics in fetchTopics():", error);
    return []; 
  }
}

/**
 * An async function that deletes the question in the backend question service based on the given
 * question ID.
 * 
 * @param id The question ID to delete.
 */
export async function deleteQuestion(id : string) {
  await api.delete('/questions/' + id).then(response => {
    return response.data.data;
  }).catch(error => {
    console.error("An error occurred when deleting question " + id + " in deleteQuestion():", error)
  });
}