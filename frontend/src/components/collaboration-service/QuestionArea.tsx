import { Question } from "@/api/question-service/Question";
import { fetchQuestionById } from "@/api/question-service/QuestionService";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useEffect, useState } from "react";
import Difficulty from "../question-service/Difficulty";
import Markdown from "react-markdown";
import CustomMarkdown from "../common/CustomMarkdown";
import TestCaseResults from "./TestCaseResults";

export const PLACEHOLDER_LOADING_QUESTION : Question = {
  id: "loading",
  title: "Please wait...",
  description: "Preparing your question, just for a while...",
  difficulty: "easy",
  testInputs: [],
  testOutputs: [],
  createdAt: "n/a",
  updatedAt: "n/a",
};

const PLACEHOLDER_ERROR_QUESTION : Question = {
  id: "error",
  title: "Something went wrong",
  description: "Failed to load your question.",
  difficulty: "easy",
  testInputs: [],
  testOutputs: [],
  createdAt: "n/a",
  updatedAt: "n/a",
}

export default function QuestionArea({questionId} : {questionId : string}) {

  const { questionAreaState, codeEditingAreaState  } = useCollaborationContext();
  const { question, setQuestion } = questionAreaState;
  const { runCodeResult } = codeEditingAreaState;

  const getQuestion = () => {
    fetchQuestionById(questionId).then(question => setQuestion(question || PLACEHOLDER_ERROR_QUESTION));
  }

  useEffect(() => {
    if(question.id === "loading") {
        getQuestion()
      }
    }
  );

  return (
    <>
      <div className="mx-5">
        <div className="m-10" />
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold">{question.title}</div>
            <div className="mx-8"><Difficulty type={question.difficulty} /></div>
          </div>
          <hr className="mt-2 mb-4"/>
          <div className="text-base">
            <CustomMarkdown>
              {question.description}
            </CustomMarkdown>
          </div>
          <hr className="mt-4 mb-4" />
          <div className="text-lg font-semibold">Code Execution Result:</div>
          <div className="h-[400px] w-full rounded-md border bg-black">
            <pre className="p-4 text-green-400 font-mono text-sm whitespace-pre-wrap">
              {runCodeResult}
            </pre>
          </div>
          <hr className="mt-4 mb-4" />
          <TestCaseResults />
        </div>
      </div>
    </>
  );
}