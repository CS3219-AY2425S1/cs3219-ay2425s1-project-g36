import { Question } from "@/api/question-service/Question";
import { deleteQuestion, fetchQuestions } from "@/api/question-service/QuestionService";
import PageHeader from "@/components/common/PageHeader";
import { TDifficulty } from "@/components/question-service/Difficulty";
import FilterPopover from "@/components/question-service/list-question-page/FilterPopover";
import ListQuestionTable from "@/components/question-service/list-question-page/ListQuestionTable";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/ui/SearchInput";
import { useAuth } from "@/contexts/AuthContext";
import { CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Page for the question list.
 */
export default function ListQuestionPage() {
  const [ questions, setQuestions ] = useState<Question[]>([]);
  const [ difficultyFilter, setDifficultyFilter ] = useState<TDifficulty[]>(["easy", "medium", "hard"]);
  const [ topicFilter, setTopicFilter ] = useState<string[]>([]);
  const [ search, setSearch ] = useState("");
  const [ loading, setLoading ] = useState(true);
  const { auth } = useAuth();
  const [ errorMessage, setErrorMessage ] = useState("");

  document.title = `Question List | PeerPrep`;

  const updateQuestionTable = () => {
    fetchQuestions().then(questionList => {
      setLoading(false);
      // there was an error loading the questions
      if (typeof questionList === "string") {
        setErrorMessage(questionList);
        setQuestions([]);
      } else {
        setQuestions(questionList);
      }
    });
  }

  // update question table on first page load
  useEffect(() => {
    updateQuestionTable();
  }, [])

  // perhaps a new backend API endpoint that lists all topics would be nice here?
  const [ topics, setTopics ] = useState<string[]>([]);

  // set here to remove duplicate topics
  const fetchTopics = () => fetchQuestions().then( questions => {
    if (typeof questions === "string") {
      // display of error message is handled in updateQuestionTable
      return [];
    } else {
      return [ ...new Set(
        questions.flatMap(question => question.topics ?? [])
      )];
    }
  });

  // initialise topics and topic filters
  useEffect(() => {
    fetchTopics().then(topics => {
      setTopics(topics);
      setTopicFilter([...topics, "No topic"]);
    })
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleClearInput = () => {
    setSearch("")
  }

  const handleDelete = (id : string) => {
    deleteQuestion(id).then(() => {
      // update question table on deletion
      updateQuestionTable();
    })
  }

  const handleResetFilters = () => {
    setTopicFilter([...topics, "No topic"]);
    setDifficultyFilter(["easy", "medium", "hard"]);
  }

  const filteredQuestions = questions.filter((question) => {
    // case-insensitive search
    const searchString = search.toLowerCase();

    const titleContains = question.title.toLowerCase().includes(searchString);
    const topicContains = question.topics?.reduce((acc, x) => acc || (x.toLowerCase() == searchString), false) ?? false;
    const difficultyMatch = (searchString == question.difficulty);
    const difficultyInFilter = difficultyFilter.includes(question.difficulty);
    const topicInFilter = topicFilter.filter(
      topic => (question.topics && question.topics.includes(topic))
    ).length > 0;
    const noTopicInFilter = ((!question.topics || question.topics.length === 0) && topicFilter.includes("No topic"));

    return (titleContains || difficultyMatch || topicContains) && difficultyInFilter && (topicInFilter || noTopicInFilter);
  });

  return (
    <>
      <PageHeader />
      <div className="container mx-auto py-10">
        <div className="flex flex-row">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight mb-4">
            Questions
          </h2>
          <div className="flex-1"></div>
          <SearchInput 
            className="rounded-lg mb-4 ml-10 mr-5"
            value={search}
            onClearInput={ handleClearInput }
            onInputChange={ handleInputChange } />
          <FilterPopover 
            dChecked={ difficultyFilter }
            onDChecked={ setDifficultyFilter }
            topics={ topics }
            tChecked={ topicFilter }
            onTChecked={ setTopicFilter }
            onResetFilters={ handleResetFilters }
          />
          { auth.isAdmin &&
            // this should only be shown if the user is an admin
            <Button className="rounded-lg btnblack ml-4 flex items-center">
              <Link to="/questions/new">
                Add Question
              </Link>
            </Button>
          }
        </div>
        <ListQuestionTable loading={loading} onDelete={ handleDelete } questions={ filteredQuestions } />
        { 
          (errorMessage !== "") ?
          <div className="bg-red-200 rounded-lg p-4 flex items-center gap-2 mt-5">
            <CircleX className="size-8" />
            <p>
              <strong>Error loading question list: </strong>{ errorMessage }
            </p>
          </div> : <></>
        }
      </div>
    </>
  );
}