import { Question } from "@/api/question-service/Question";
import { fetchQuestionById } from "@/api/question-service/QuestionService";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useEffect } from "react";

export const PLACEHOLDER_LOADING_QUESTION : Question = {
  id: "loading",
  title: "Please wait...",
  description: "Preparing your question, just for a while...",
  difficulty: "easy",
  createdAt: "n/a",
  updatedAt: "n/a",
};

const PLACEHOLDER_ERROR_QUESTION : Question = {
  id: "error",
  title: "Something went wrong",
  description: "Failed to load your question.",
  difficulty: "easy",
  createdAt: "n/a",
  updatedAt: "n/a",
}

export default function QuestionArea({questionId} : {questionId : string}) {

  const { questionAreaState } = useCollaborationContext();
  const { question, setQuestion } = questionAreaState;

  
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
      <div className="ml-5">
        <div className="m-10"/>
        <div className="flex flex-col">
          <div className="text-2xl font-bold">{question.title}</div>
          <hr className="mt-2 mb-2"/>
          <div className="text-sm">{question.description}</div>
        </div>
      </div>
    </>
  );
}