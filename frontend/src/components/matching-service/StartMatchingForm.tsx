import { useEffect, useState } from "react";
import PageTitle from "../common/PageTitle";
import QuestionTopicsField from "../question-service/edit-question-page/QuestionTopicsField";
import DifficultySelectionBox, { DEFAULT_SELECTED_DIFFICULTY_DATA, SelectedDifficultyData } from "./DifficultySelectionBox";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { sendStartMatchingRequest } from "@/api/matching-service/MatchingService";
import { useNavigate } from "react-router-dom";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "../common/DisplayedMessage";
import { isUserInCollabStore } from "@/api/collaboration-service/CollaborationService";
import ProgLangField from "./ProgLangField";

const HTTP_OK = 200
const HTTP_ALREADY_EXISTS = 409
const HTTP_ERROR = 500

export default function StartMatchingForm() {

  const { auth } = useAuth();
  const navigate = useNavigate();

  const [questionTopics, setQuestionTopics] = useState<string[]>([]);
  const [progLangs, setProgLangs] = useState<string[]>([]);
  const [selectedDifficultyData, setSelectedDifficultyData] = useState<SelectedDifficultyData>(DEFAULT_SELECTED_DIFFICULTY_DATA);
  const [displayedMessage, setDisplayedMessage] = useState<DisplayedMessage | null>(null);

  const [isLoading, setIsLoading] = useState(true)

  // If user is already collaborating with someone else, don't let the user access the matching page.
  // Bring the user to collaboration page.
  useEffect(() => {
    const checkIfUserInStore = async () => {
      const response = await isUserInCollabStore(auth.id)
      if (response.status === 200) {
        navigate("/collaboration")
      } else {
        setIsLoading(false)
      }
    }

    checkIfUserInStore()
  }, [])

  const startMatching = async () => {
    if(!selectedDifficultyData.easy && !selectedDifficultyData.medium && !selectedDifficultyData.hard) {
      displayError("You must select at least one difficulty.");
      return;
    }
    if(questionTopics.length === 0) {
      displayError("You must select at least one topic.");
      return;
    }
    if(progLangs.length === 0) {
      displayError("You must select at least one programming language.");
      return;
    }

    const difficultiesStr = Object.entries(selectedDifficultyData).filter(val => val[1]).map(val => val[0]).join(", ");
    const topicsStr = questionTopics.join(", ");
    const progLangsStr = progLangs.join(", ");
    
    try {
      const response = await sendStartMatchingRequest(auth.id, auth.email, selectedDifficultyData, questionTopics, progLangs)
      const httpStatus = response.status;
      const errorMessage = response.message

      // this httpStatus tells us if user is sent to waitingQueue or not
      if (httpStatus === HTTP_OK) {
        // Do nothing here
      } else if (httpStatus === HTTP_ALREADY_EXISTS || httpStatus === HTTP_ERROR) {
        navigate(`/matching/failed?message=${errorMessage}&difficulties=${difficultiesStr}&topics=${topicsStr}&progLangs=${progLangsStr}`);
      } else {
        displayError("An error has occured: \n" + response.message);
      }
    } catch (error) {
      console.error(error)
    }
    
    navigate(`../matching/wait?difficulties=${difficultiesStr}&topics=${topicsStr}&progLangs=${progLangsStr}`);

  }

  const displayError = (message : string) => {
    setDisplayedMessage({message : message, type : DisplayedMessageTypes.Error});
  }
  
  if (isLoading) return null

  return(
  <>
    <form onSubmit={evt => {evt.preventDefault();} } className="h-full">
      <PageTitle>Practice an Interview</PageTitle>
      <p>What question would you like to practice today?</p>
      <div className="flex flex-row mt-5">
        <DifficultySelectionBox onChange={setSelectedDifficultyData}/>
        <div className="ml-5 mr-5"/>
        <QuestionTopicsField value={questionTopics} setValue={setQuestionTopics}></QuestionTopicsField>
        <div className="ml-5 mr-5"/>
        <ProgLangField value={progLangs} setValue={setProgLangs}></ProgLangField>
      </div>
      <div className="flex justify-center mt-20">
        <Button className="btnblack" onClick={startMatching}>Find a match</Button>
      </div>
      <DisplayedMessageContainer displayedMessage={displayedMessage}/>
    </form>
  </>
  )
}