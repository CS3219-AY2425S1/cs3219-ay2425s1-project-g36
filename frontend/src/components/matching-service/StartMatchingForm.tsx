import { useState } from "react";
import PageTitle from "../common/PageTitle";
import QuestionTopicsField from "../question-service/edit-question-page/QuestionTopicsField";
import DifficultySelectionBox, { DEFAULT_SELECTED_DIFFICULTY_DATA, SelectedDifficultyData } from "./DifficultySelectionBox";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { sendStartMatchingRequest } from "@/api/matching-service/MatchingService";
import { useNavigate } from "react-router-dom";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "../common/DisplayedMessage";

const HTTP_OK = 200
const HTTP_NO_CONTENT = 204
const HTTP_REQUEST_TIMEOUT = 408

export default function StartMatchingForm() {

  const { auth } = useAuth();
  const navigate = useNavigate();

  const [questionTopics, setQuestionTopics] = useState<string[]>([]);
  const [selectedDifficultyData, setSelectedDifficultyData] = useState<SelectedDifficultyData>(DEFAULT_SELECTED_DIFFICULTY_DATA);
  const [displayedMessage, setDisplayedMessage] = useState<DisplayedMessage | null>(null);

  const startMatching = () : void => {
    if(!selectedDifficultyData.easy && !selectedDifficultyData.medium && !selectedDifficultyData.hard) {
      displayError("You must select at least one difficulty.");
      return;
    }
    if(questionTopics.length === 0) {
      displayError("You must select at least one topic.");
      return;
    }

    console.log("try to start matching")

    const difficultiesStr = Object.entries(selectedDifficultyData).filter(val => val[1]).map(val => val[0]).join(", ");
    const topicsStr = questionTopics.join(", ");
    navigate(`../matching/wait?difficulties=${difficultiesStr}&topics=${topicsStr}`);

    sendStartMatchingRequest(auth.token, selectedDifficultyData, questionTopics).then(
      response => {
        const httpStatus = response.status;
        const errorMessage = response.message

        if (httpStatus === HTTP_OK) {
          // navigate("/matching/get_ready")
        } else if (httpStatus === HTTP_NO_CONTENT || httpStatus === HTTP_REQUEST_TIMEOUT) {
          navigate(`/matching/failed?message=${errorMessage}&difficulties=${difficultiesStr}&topics=${topicsStr}`);
        } else {
          displayError("An error has occured: \n" + response.message);
        }
      }
    )
  }

  const displayError = (message : string) => {
    setDisplayedMessage({message : message, type : DisplayedMessageTypes.Error});
  }
  
  return(
  <>
    <form onSubmit={evt => {evt.preventDefault();} } className="h-full">
      <PageTitle>Practice an Interview</PageTitle>
      <p>What question would you like to practice today?</p>
      <div className="flex flex-row mt-5">
        <DifficultySelectionBox onChange={setSelectedDifficultyData}/>
        <div className="ml-5 mr-5"/>
        <QuestionTopicsField value={questionTopics} setValue={setQuestionTopics}></QuestionTopicsField>
      </div>
      <div className="flex justify-center mt-20">
        <Button className="btnblack" onClick={startMatching}>Find a match</Button>
      </div>
      <DisplayedMessageContainer displayedMessage={displayedMessage}/>
    </form>
  </>
  )
}