import { EMPTY_QUESTION, Question } from "@/api/question-service/Question";
import {
  fetchQuestionById,
  insertQuestion,
  updateQuestion,
} from "@/api/question-service/QuestionService";
import { useEffect, useState } from "react";
import PageTitle from "../../common/PageTitle";
import QuestionInputField from "./QuestionInputField";
import { Button } from "../../ui/button";
import { Link, useNavigate } from "react-router-dom";
import QuestionTextareaField from "./QuestionTextareaField";
import QuestionSelectField from "./QuestionSelectField";
import { TDifficulty } from "../Difficulty";
import QuestionTopicsField from "./QuestionTopicsField";
import { Loader2, TriangleAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * A form for the editing of questions. Requires the following
 * prop:
 *
 * - `id`: The ID of the question to edit. Set `id` to `undefined` to create
 * a new question instead of updating an existing question.
 */
export default function EditQuestionForm({ id }: { id?: string }) {
  const [question, setQuestion] = useState<Question>(EMPTY_QUESTION);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // whether to perform insert or update. True if adding question, False if
  // updating an existing question.
  const isAddQuestion = id === undefined;

  // load question from backend
  const loadQuestion = () => {
    fetchQuestionById(id).then((question) => {
      setLoading(false);
      if (question === null) {
        toast({
          description: `Redirected to add new question as question with ID ${id} doesn't exist!`,
        });
        navigate("/questions/new");
      } else {
        setQuestion(question);
      }
    });
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  const [warning, setWarning] = useState("");

  /**
   * Handles the create/update of the question.
   */
  const handleSaveQuestionClick = () => {
    if (question.title === "" || question.description === "") {
      // frontend validation: title and description missing
      setWarning("Title and description are required!");
    } else if (isAddQuestion) {
      // adds a question to the database
      insertQuestion(question).then((response) => {
        if (response.status === 200) {
          navigate("/questions");
        } else {
          setWarning(response.message as string);
        }
      });
    } else {
      // updates the question in the database
      updateQuestion(question).then((response) => {
        if (response.status === 200) {
          navigate("/questions");
        } else {
          setWarning(response.message as string);
        }
      });
    }
  };

  return !loading ? (
    <section>
      <PageTitle>
        {isAddQuestion ? "Add New Question" : <>Edit Question #{id}</>}
      </PageTitle>
      <div className="flex flex-col gap-3">
        <QuestionInputField
          name="Title"
          placeholder="Enter title..."
          value={question.title}
          setValue={(newTitle: string) => {
            setQuestion({ ...question, title: newTitle });
          }}
        />
        <div className="flex gap-3">
          <QuestionSelectField
            value={question.difficulty}
            setValue={(newDiff: TDifficulty) => {
              setQuestion({ ...question, difficulty: newDiff });
            }}
          />
          <QuestionTopicsField
            value={question.topics ?? []}
            setValue={(newTopics: string[]) => {
              setQuestion({ ...question, topics: newTopics });
            }}
          />
        </div>
        <QuestionTextareaField
          name="Description"
          placeholder="Enter description..."
          value={question.description}
          setValue={(newDesc: string) => {
            setQuestion({ ...question, description: newDesc });
          }}
        />
        <div className="flex justify-center gap-3">
          <Button className="btngreen" onClick={handleSaveQuestionClick}>
            {isAddQuestion ? "Add Question" : "Save Question"}
          </Button>
          <Button className="btnblack">
            <Link to="/questions">Back to Questions</Link>
          </Button>
        </div>
        {warning !== "" ? (
          <div className="bg-red-200 rounded-lg p-4 flex items-center gap-2">
            <TriangleAlert className="size-8" />
            <p>
              <strong>Warning: </strong>
              {warning}
            </p>
          </div>
        ) : (
          <></>
        )}
      </div>
    </section>
  ) : (
    <div className="flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h2 className="text-2xl font-semibold mt-4 text-foreground">
        Loading...
      </h2>
    </div>
  );
}
