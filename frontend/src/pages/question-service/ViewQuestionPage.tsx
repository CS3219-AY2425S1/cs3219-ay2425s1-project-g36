import { useParams } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { fetchQuestion } from "@/api/question-service/QuestionService";
import { useEffect, useState } from "react";
import { Question } from "@/api/question-service/Question";
import Difficulty from "@/components/question-service/Difficulty";

export default function ViewQuestionPage() {
  const params = useParams();
  const id = params.id as string;
  const [question, setQuestion] = useState<Question | null>(null);

  document.title = `View Question #${id} | PeerPrep`;

  useEffect(() => {
    const loadQuestion = async () => {
      if (id) {
        const ques = await fetchQuestion(id);
        setQuestion(ques);
      }
    };
    loadQuestion();
  }, [id]);

  return (
    <>
      <PageHeader />
      {!question ? (
        <div className="container mx-auto py-10 px-4">
          I'm afraid there's no question here dear
        </div>
      ) : (
        <div className="container mx-auto py-10 px-4">
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
        </div>
      )}
    </>
  );
}
