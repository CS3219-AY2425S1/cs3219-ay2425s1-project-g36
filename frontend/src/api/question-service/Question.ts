import { TDifficulty } from "@/components/question-service/Difficulty";

/**
 * Module for a Question object, based on the
 * Question model from the Question Service.
 */
export interface Question {
  id: string;
  title: string;
  difficulty: TDifficulty;
  description: string;
  topics?: string[];
  testInputs: string[];
  testOutputs: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * A template empty question with details not filled in yet.
 */
export const EMPTY_QUESTION : Question = {
  id: "",
  title: "",
  difficulty: "easy",
  description: "",
  topics: [],
  testInputs: [],
  testOutputs: [],
  createdAt: "",
  updatedAt: "",
}

export function fromQuestionList(questionData : any[]) {
  return questionData.map(question => {
    return {
      id: question._id,
      ...question
    };
  }) as Question[];
}

/**
 * Creates a frontend Question object based on the data transmitted
 * from the backend.
 * 
 * @param questionData The question data from the backend.
 * @returns The Question object in the frontend created from the
 * backend question data.
 */
export function toQuestionObject(questionData: any) { 
  return {
    id: questionData._id,
    ...questionData
  } as Question;
}