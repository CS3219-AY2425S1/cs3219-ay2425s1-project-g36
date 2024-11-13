import { useState, useEffect } from 'react'
import { useCollaborationContext } from '@/contexts/CollaborationContext';
import { fetchQuestionById } from '@/api/question-service/QuestionService';
import { Question } from '@/api/question-service/Question';
import { CheckCircle, XCircle } from 'lucide-react'

const DEFAULT_RESULT = "No code has been executed yet"

const PLACEHOLDER_ERROR_QUESTION: Question = {
    id: "error",
    title: "Something went wrong",
    description: "Failed to load your question.",
    difficulty: "easy",
    testInputs: [],
    testOutputs: [],
    createdAt: "n/a",
    updatedAt: "n/a",
}

export default function TestCaseResults() {
    const { questionAreaState, codeEditingAreaState } = useCollaborationContext();
    const { question, setQuestion } = questionAreaState;
    const { runCodeResult, isCodeRunning, userRanCode } = codeEditingAreaState;

    const [resultArray, setResultArray] = useState<string[]>([DEFAULT_RESULT])

    const getQuestion = () => {
        fetchQuestionById(question.id).then(question => setQuestion(question || PLACEHOLDER_ERROR_QUESTION));
    }

    useEffect(() => {
        if (question.id === "loading") {
            getQuestion()
        }
    }
    );

    useEffect(() => {
        setResultArray(runCodeResult !== undefined ? runCodeResult.split("\n") : [DEFAULT_RESULT])
    }, [runCodeResult])

    const testInputs = question.testInputs
    const testOutputs = question.testOutputs

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

    // 1. User clicked 'run code' or
    // 2. User has not ran code 
    if (userRanCode || resultArray[0] === DEFAULT_RESULT) {
        return (
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-4">
                    <div className="text-lg font-semibold mb-2">Test Case Results:</div>
                    <div className="space-y-2">
                        User has not submitted code
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

    // Happy path begins here (where user clicked 'submit code')
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
            <div className={`p-4 ${passedAllTestCases ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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
}