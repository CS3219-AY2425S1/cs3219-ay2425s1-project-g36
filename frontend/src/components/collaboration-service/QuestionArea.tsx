import { Question } from "@/api/question-service/Question";
import { fetchQuestionById } from "@/api/question-service/QuestionService";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useEffect, useState } from "react";
import Difficulty from "../question-service/Difficulty";
import Markdown from "react-markdown";
import { CheckCircle, XCircle } from 'lucide-react'
import CustomMarkdown from "../common/CustomMarkdown";

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

const DEFAULT_RESULT = "No code has been executed yet"

export default function QuestionArea({questionId} : {questionId : string}) {

  const { questionAreaState, codeEditingAreaState  } = useCollaborationContext();
  const { question, setQuestion } = questionAreaState;
  const { runCodeResult, isCodeRunning } = codeEditingAreaState;

  const [resultArray, setResultArray] = useState<string[]>([DEFAULT_RESULT])
  
  const getQuestion = () => {
    fetchQuestionById(questionId).then(question => setQuestion(question || PLACEHOLDER_ERROR_QUESTION));
  }

  useEffect(() => {
    if(question.id === "loading") {
        getQuestion()
      }
    }
  );

  useEffect(() => {
    setResultArray(runCodeResult !== undefined ? runCodeResult.split("\n") : [DEFAULT_RESULT])
  }, [runCodeResult]) 
  
  const testInputs = question.testInputs
  const testOutputs = question.testOutputs

  // This whole function is rendered in the main return function
  const testCases = (() => {
    // This question does not have any testInputs (intended for some questions)
    if (testInputs.length === 0) {
      return <div>this question does not have any testInputs</div>
    }

    // sanity check, shouldn't happen
    if (testInputs.length !== testOutputs.length) {
      return null; 
    }

    // Code is running, wait for it to complete
    if (isCodeRunning) {
      return null;
    }

    // User has not run code
    if (resultArray[0] === DEFAULT_RESULT) {
      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-4">
            <div className="text-lg font-semibold mb-2">Test Case Results:</div>
            <div className="space-y-2">
              User has not executed code
            </div>
          </div>
        </div>
      );
    }

    // User did not print an answer or printed >1 answer. Show all test cases fail.
    if (resultArray.length !== testOutputs.length) {
      return (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <div className="p-4 bg-red-100 text-red-800">
            <div className="text-lg font-semibold mb-2">Test Case Results:</div>
            <div className="space-y-2">
              <div className="flex items-center p-2 rounded">
                <XCircle className="w-5 h-5 mr-2 text-red-600" />
                <span>Test cases passed: 0 / {testOutputs.length}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Happy path begins here
    let noOfTestCasesPassed = 0
    resultArray.forEach((result, index) => {
      if (resultArray[index] === testOutputs[index]) {
        noOfTestCasesPassed += 1
      }
    });

    // boolean to indicate if user has passed **all** test cases
    const passedAllTestCases = noOfTestCasesPassed === resultArray.length

    return (
      <div className="mt-4 border rounded-lg overflow-hidden">
        <div className={`p-4 ${
          passedAllTestCases ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          <div className="text-lg font-semibold mb-2">Test Case Results:</div>
          <div className="space-y-2">
            <div className="flex items-center p-2 rounded">
              {passedAllTestCases 
                ? <CheckCircle className="w-5 h-5 mr-2 text-green-600" /> 
                : <XCircle className="w-5 h-5 mr-2 text-red-600" />
              }
              <span>Test cases passed: {noOfTestCasesPassed} / {testOutputs.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  })();

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
          {testCases}
        </div>
      </div>
    </>
  );
}