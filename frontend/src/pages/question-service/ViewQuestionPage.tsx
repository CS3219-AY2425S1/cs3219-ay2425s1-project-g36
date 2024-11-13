import { Link, useParams } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { fetchQuestion } from "@/api/question-service/QuestionService";
import { useEffect, useState } from "react";
import { Question } from "@/api/question-service/Question";
import Difficulty from "@/components/question-service/Difficulty";
import { Button } from "@/components/ui/button";
import MainContainer from "@/components/common/MainContainer";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAttempts } from "@/api/user-service/UserService";
import { Attempt } from "../AttemptedHistoryPage";
import { parseQuestionId } from "../../lib/utils"
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import CustomMarkdown from "@/components/common/CustomMarkdown";

interface ViewQuestionPageProps {
  hasCode?: boolean; 
}

interface CodeDisplay {
  code: string;
  language: string;
}

export default function ViewQuestionPage({ hasCode = false } : ViewQuestionPageProps) {
  const params = useParams();
  const id = params.id as string;
  console.log("params: ", params)
  const timeSubmitted = new Date(params.timeSubmitted!);
  const { auth } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [attemptCode, setAttemptCode] = useState<CodeDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  document.title = `View Question #${id} | PeerPrep`;

  useEffect(() => {
    const loadQuestion = async () => {
      if (id) {
        const ques = await fetchQuestion(id);
        setQuestion(ques);
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

  useEffect(() => {
    const loadAttempt = async () => {
      console.log("entered")
      try {
        const result = await getUserAttempts(auth.id);
        console.log(result.data)
        console.log(timeSubmitted)
        if (result.status === 200) {
          // Filter the attempts for the specific questionId
          const matchedAttempts = result.data
            .filter((attempt: Attempt) => {
              console.log("time submitted;", attempt.timeSubmitted)
              return (attempt.questionId === parseQuestionId(id)) && new Date(attempt.timeSubmitted).getTime() == new Date(timeSubmitted).getTime()
              
              })
            .sort((a: Attempt, b: Attempt) => new Date(b.timeSubmitted).getTime() - new Date(a.timeSubmitted).getTime());

          // Select the latest attempt (first one in sorted array)
          const latestAttempt = matchedAttempts[0];
          console.log("matchedAttempt: ", latestAttempt)
          if (latestAttempt) {
            // If attempt found, set the code
            console.log("stuff: ", { code: latestAttempt.code, language: latestAttempt.language })
            setAttemptCode({ code: latestAttempt.code, language: latestAttempt.language });
          } else {
            // No matching attempt found for the question
            setAttemptCode(null);
            setError("No attempt found for this question.");
          }
        } else {
          // Status not 200 - API error
          setAttemptCode(null);
          setError(result.message);
        }
      } catch (err) {
        console.error("Error fetching attempted code:", err);
        setAttemptCode(null); // Clear attempt code in case of error
        setError("Failed to fetch attempted code.");
      } finally {
        setLoading(false);
      }
    };

    if (hasCode) loadAttempt();
  }, [auth.id, id]);

  return (
    <>
      <PageHeader />
      { loading ? (
        <div className="flex flex-col items-center justify-center bg-background mt-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <h2 className="text-2xl font-semibold mt-4 text-foreground">Loading...</h2>
        </div>
      ) : (
        !question ? (
          <MainContainer className="px-4 text-center gap-3 flex flex-col">
            <h2 className="text-2xl">
              I'm afraid there's no question here...
            </h2>
            <div className="flex justify-center">
              <Button className="btnblack">
                <Link to={hasCode ? "/history" : "/question"}>
                    Go back to {hasCode ? "history" : "question"} list
                </Link>
              </Button>
            </div>
          </MainContainer>
        ) : (
          <MainContainer className="px-4">
            <h2 className="text-4xl font-bold mb-6">Question #{id}</h2>
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg mb-2 underline">Title</h3>
                <p className="text-2xl font-semibold">{question.title}</p>
              </div>
              <div className="flex mb-10 mt-8">
                <div className="pr-52">
                  <h3 className="text-lg mb-2.5 underline">Difficulty</h3>
                  <Difficulty type={question.difficulty}/>
                </div>
                <div>
                  <h3 className="text-lg mb-2 underline">Topics</h3>
                  <div>
                    {question.topics && question.topics.length ? (
                      question.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
                        >
                          {topic}
                        </span>
                      ))
                    ) : (
                      <div className="font-semibold">No topics available</div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg mb-2 underline">Description</h3>
                <CustomMarkdown>
                  {question.description}
                </CustomMarkdown>
              </div>
            </div>
            
            {hasCode && (
              <div style={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "10px", backgroundColor: "#282a36", color: "#f8f8f2", fontSize: "14px" }}>
                  <span>Language: {attemptCode?.language || "N/A"}</span>
                </div>
                <div style={{ padding: "10px", backgroundColor: "#282a36", color: "#f8f8f2", fontSize: "14px", minHeight: "300px" }}>
                  {loading ? (
                    <p>Loading...</p>
                  ) : attemptCode ? (
                    <SyntaxHighlighter
                      language={attemptCode.language || "plaintext"} // fallback to plaintext if language is missing
                      style={darcula}
                      showLineNumbers
                      wrapLines
                    >
                      {typeof attemptCode.code === 'string' ? attemptCode.code : ""}
                    </SyntaxHighlighter>
                  ) : (
                    <p>{error || "No code available for this attempt."}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-6">
              <Button className="btnblack">
                <Link to={hasCode ? "/history" : "/questions"}>
                    Go back to {hasCode ? "history" : "question"} list
                </Link>
              </Button>
            </div>
          </MainContainer>
        )
      ) }
    </>
  );
}
