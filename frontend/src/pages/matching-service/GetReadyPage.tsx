import {
  sendConfirmMatch,
} from "@/api/matching-service/MatchingService";
import {
  DisplayedMessage,
  DisplayedMessageContainer,
  DisplayedMessageTypes,
} from "@/components/common/DisplayedMessage";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import SpinningCircle from "@/components/matching-service/SpinningCircle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const HTTP_OK = 200;
const HTTP_NO_CONTENT = 204;
const HTTP_REQUEST_TIMEOUT = 408;

export default function GetReadyPage() {

  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [displayedMessage, setDisplayedMessage] =
    useState<DisplayedMessage | null>(null);

  const [parameters] = useSearchParams();
  const difficultiesStr = parameters.get("difficulties");
  const topicsStr = parameters.get("topics");

  const displayError = (message: string) => {
    setDisplayedMessage({
      message: message,
      type: DisplayedMessageTypes.Error,
    });
  };

  const getReadyButtonOnClick = () => {
    setIsReady(true);

    sendConfirmMatch(auth.token).then((response) => {
      const httpStatus = response.status;
      const errorMessage = response.message

      if (httpStatus === HTTP_OK) {
        // send this guy to the collaboration page
        navigate("/collaboration")
      } else if (
        httpStatus === HTTP_NO_CONTENT ||
        httpStatus === HTTP_REQUEST_TIMEOUT
      ) {
        // happens when timeout after 10s (10 seconds counting happens in backend), navigate to failed matching page
        navigate(`/matching/failed?message=${errorMessage}&difficulties=${difficultiesStr}&topics=${topicsStr}`);
      } else {
        displayError("An error has occured: \n" + response.message);
      }
    });
  };

  return (
    <>
      <PageHeader />
      <MainContainer>
        <div className="flex flex-col space-y-5 justify-center items-center">
          <PageTitle>Matching success</PageTitle>
          <div>We have successfully found a match!</div>
          {!isReady ? (
            <>
              <div>Get ready!</div>
              <Button className="btngreen" onClick={getReadyButtonOnClick}>
                Yes, I'm ready!
              </Button>
            </>
          ) : (
            <>
              <div>Waiting for the other user to get ready...</div>
              <SpinningCircle />
            </>
          )}
          <DisplayedMessageContainer displayedMessage={displayedMessage} />
        </div>
      </MainContainer>
    </>
  );
}
