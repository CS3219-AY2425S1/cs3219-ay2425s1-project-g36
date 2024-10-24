import { Link, useParams } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { fetchQuestion } from "@/api/question-service/QuestionService";
import { useEffect, useState } from "react";
import { Question } from "@/api/question-service/Question";
import Difficulty from "@/components/question-service/Difficulty";
import { Button } from "@/components/ui/button";
import MainContainer from "@/components/common/MainContainer";
import { Loader2 } from "lucide-react";

export default function ViewQuestionPage() {
  const params = useParams();
  const id = params.id as string;
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

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
                <Link to="/questions">
                    Go back to question list
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
                <p>{question.description}</p>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button className="btnblack">
                <Link to="/questions">
                    Go back to question list
                </Link>
              </Button>
            </div>
          </MainContainer>
        )
      ) }
    </>
  );
}
