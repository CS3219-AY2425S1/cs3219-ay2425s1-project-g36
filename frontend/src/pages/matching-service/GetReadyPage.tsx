import { sendCheckConfirmationStateRequest, sendConfirmReadyRequest } from "@/api/matching-service/MatchingService";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import SpinningCircle from "@/components/matching-service/SpinningCircle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isUserInCollabStore } from "@/api/collaboration-service/CollaborationService";

const MAXIMUM_CONFIRMATION_DURATION = 10; // in seconds
const CHECK_CONFIRMATION_STATE_INTERVAL = 500; // in milliseconds
const MAXIMUM_CHECK_CONFIRMATION_STATE_NETWORK_ERROR_COUNT = 20;

export default function GetReadyPage() {
  const pathname = location.pathname;
  const { auth } = useAuth();
  const navigate = useNavigate();
  const checkConfirmationStateNetworkErrorCount = useRef(0);
  const [endConfirmationTimer, setEndConfirmationTimer] = useState(MAXIMUM_CONFIRMATION_DURATION);
  const [ isReady, setIsReady ] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState<DisplayedMessage | null>(null);
  const checkConfirmationStateIntervalID = useRef<number | null>(null);
  const endConfirmationTimerIntervalID = useRef<number | null>(null);

  const [parameters] = useSearchParams();
  const difficultiesStr = parameters.get("difficulties");
  const topicsStr = parameters.get("topics");
  const progLangsStr = parameters.get("progLangs");

  const HTTP_OK = 200;
  const HTTP_WAITING = 202;
  const HTTP_USER_NOT_FOUND = 409;
  const HTTP_ERROR = 500;
  
  /**
   * When the user navigates away from the page, clear the intervals.
   */
  const onNavigatingAway = () => {
    console.log("on navigating away");
    if(checkConfirmationStateIntervalID.current !== null) {
      window.clearInterval(checkConfirmationStateIntervalID.current);
      checkConfirmationStateIntervalID.current = null;
    }
    if(endConfirmationTimerIntervalID.current !== null) {
      window.clearInterval(endConfirmationTimerIntervalID.current);
      endConfirmationTimerIntervalID.current = null;
    }
  }
  
  /**
   * When the user or its match or both does not get ready in time, navigate to the failed matching page.
   */
  const notGettingReady = () => {
    const MESSAGE_NOT_GETTING_READY_IN_TIME = "Failed to receive confirmation from both users";

    // Nothing is required to be sent to backend since it has its own timeout function
    onNavigatingAway();
    navigate(`../matching/failed?message=${MESSAGE_NOT_GETTING_READY_IN_TIME}&difficulties=${difficultiesStr}&topics=${topicsStr}&progLangs=${progLangsStr}`);
  }

  /**
   * When the user clicks the confirmation button, send the confirmation request to the backend.
   * 
   * If http status is 200, it means the user has confirmed successfully.
   * Else, navigate to the failed matching page.
   */
  const confirmationButtonOnClick = () => {
    setIsReady(true);

    sendConfirmReadyRequest(auth.id).then((response) => {
      const httpStatus = response.status;
      const errorMessage = response.message

      if (httpStatus === HTTP_OK) {
        // Do nothing
        console.log("confirmation sent");
      } else if (httpStatus === HTTP_USER_NOT_FOUND || httpStatus === HTTP_ERROR) {
        navigate(`/matching/failed?message=${errorMessage}&difficulties=${difficultiesStr}&topics=${topicsStr}&progLangs=${progLangsStr}`);
      } else {
        displayError("An error has occured: \n" + response.message);
      }
    });
  };

  /**
   * Display an error message.
   * @param message The message to be displayed
   */
  const displayError = (message : string) => {
    setDisplayedMessage({message : message, type : DisplayedMessageTypes.Error});
  }

  /**
   * Checks the confirmation state of the user every 5 seconds.
   * 
   * If both users have confirmed, navigate to the collaboration page with the roomId.
   * If the user is still waiting for the other user, do nothing.
   * For other http statuses, navigate to the failed matching page with its respective message.
   */
  const checkConfirmationState = async () => {
    console.log("checking confirmation state");

    // If the user navigates away from the page manually, clear the intervals.
    if(location.pathname !== pathname) {
      onNavigatingAway();
      // TODO: backend required to handle this aka cancel confirmation?
      console.log("matching cancelled due to leaving page");
      return;
    }

    // Send the request to the backend to check the confirmation state.
    try {
      const response = await sendCheckConfirmationStateRequest(auth.id)
      if (response.status === HTTP_OK) {
        const second_response = await isUserInCollabStore(auth.id)
        
        if (second_response.status === 200) {
          // Both users have confirmed, navigate to the collaboration page.
          onNavigatingAway();
          navigate(`../collaboration`);
        }

      } else if (response.status === HTTP_WAITING) {
        // Waiting for the other user to confirm, do nothing.
        console.log("matching...");

      } else if (response.message === "ERR_NETWORK") {
        // Network error, retry the request.
        checkConfirmationStateNetworkErrorCount.current++;
        if(checkConfirmationStateNetworkErrorCount.current >= MAXIMUM_CHECK_CONFIRMATION_STATE_NETWORK_ERROR_COUNT) {
          // TODO: backend required to handle this ?
          onNavigatingAway();
          console.log("confirmation cancelled due to network error");
          navigate(`../matching/failed?message=Network error, please check your network and try again.&difficulties=${difficultiesStr}&topics=${topicsStr}&progLangs=${progLangsStr}`);
        }
      } else {
        // Backend error, navigate to the failed matching page.
        onNavigatingAway();
        console.log("confirmation cancelled due to backend error");
        navigate(`../matching/failed?message=${response.message}&difficulties=${difficultiesStr}&topics=${topicsStr}&progLangs=${progLangsStr}`);
      }
    } catch (error) {
      console.error(error)   
    }
  }

  const updateEndConfirmationTimer = () => {
    if(location.pathname !== pathname) {
      onNavigatingAway();
      return;
    }
    if(isReady) {
      return;
    }
    setEndConfirmationTimer(val => {
      if(val - 1 == 0) {
        notGettingReady();
      }
      return val - 1;
    });
  }
  
  useEffect(() => {
    if (checkConfirmationStateIntervalID.current === null) {
      checkConfirmationStateIntervalID.current = window.setInterval(checkConfirmationState, CHECK_CONFIRMATION_STATE_INTERVAL);
    }
    if (endConfirmationTimerIntervalID.current === null) {
      endConfirmationTimerIntervalID.current = window.setInterval(updateEndConfirmationTimer, 1000);
    }
  }, []);


  return (
  <>
    <PageHeader />
    <MainContainer>
      <div className="flex flex-col space-y-5 justify-center items-center">
        <PageTitle>Matching success</PageTitle>
        <div>We have successfully found a match!</div>
        {!isReady ? (
          <>
            <div>Get ready in {MAXIMUM_CONFIRMATION_DURATION} seconds!</div>
            <Button className="btngreen" onClick={confirmationButtonOnClick}>Yes, I'm ready! ({endConfirmationTimer})</Button>
          </>
        ) : (
          <>
            <div>Waiting for the other user to get ready...</div>
            <SpinningCircle />
          </>
        )}
        <DisplayedMessageContainer displayedMessage={displayedMessage}/>
        </div>
    </MainContainer>
  </>
  )
}
