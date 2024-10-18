import { retryPreviousMatching } from "@/api/matching-service/MatchingService";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MatchingFailedPage() {
  const [parameters] = useSearchParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [displayedMessage, setDisplayedMessage] = useState<DisplayedMessage | null>(null);

  const message = parameters.get("message");
  const difficultiesStr = parameters.get("difficulties");
  const topicsStr = parameters.get("topics");


  const retryButtonOnClick = () => {
    retryPreviousMatching(auth.token).then(
      response => {
        const isSuccess = response.status === 200;
        if(isSuccess) {
          navigate(`../matching/wait?difficulties=${difficultiesStr}&topics=${topicsStr}`);
        }
        else {
          displayError("An error has occured: \n" + response.message);
        }
      }
    )
  }

  const displayError = (message : string) => {
    setDisplayedMessage({message : message, type : DisplayedMessageTypes.Error});
  }

  const refineSelectionButtonOnClick = () => {
    navigate("../matching/start")
  }

  document.title = "Matching Failed | PeerPrep";

  return (
  <>
    <PageHeader />
    <MainContainer>
      <div className="flex flex-col space-y-5 justify-center items-center">
        <PageTitle>Matching Failed</PageTitle>
        <div>{message}</div>
        <Button className="btngreen" onClick={retryButtonOnClick}>Try again</Button>
        <Button className="btnblack" onClick={refineSelectionButtonOnClick}>Refine selection</Button>
        <DisplayedMessageContainer displayedMessage={displayedMessage}/>
      </div>
    </MainContainer>
  </>
  )
}
