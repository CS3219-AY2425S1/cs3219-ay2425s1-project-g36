import { retryPreviousMatching, sendCheckPeerReadyStateRequest, sendUpdateReadyStateRequest } from "@/api/matching-service/MatchingService";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import SpinningCircle from "@/components/matching-service/SpinningCircle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GET_READY_MAXIMUM_WAIT_TIME = 5; // in seconds
const CHECK_PEER_READY_STATE_INTERVAL = 1000; // in milliseconds
const MAXIMUM_CHECK_PEER_READY_STATE_NETWORK_ERROR_COUNT = 2;

export default function GetReadyPage() {
    
  const getReadyTimerIntervalID = useRef<number | null>(null);
  const [ getReadyTimer, setGetReadyTimer ] = useState(GET_READY_MAXIMUM_WAIT_TIME);
  const pathname = location.pathname;
  const { auth } = useAuth();
  const navigate = useNavigate();
  const checkPeerReadyStateIntervalID = useRef<number | null>(null);
  const checkPeerReadyStateNetworkErrorCount = useRef(0);
  const [ isReady, setIsReady ] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState<DisplayedMessage | null>(null);

  const [parameters] = useSearchParams();
  const difficultiesStr = parameters.get("difficulties");
  const topicsStr = parameters.get("topics");

  const onNavigatingAway = () => {
    console.log("on navigating away");
    if(checkPeerReadyStateIntervalID.current !== null) {
      window.clearInterval(checkPeerReadyStateIntervalID.current);
      checkPeerReadyStateIntervalID.current = null;
    }
    if(getReadyTimerIntervalID.current !== null) {
      window.clearInterval(getReadyTimerIntervalID.current);
      getReadyTimerIntervalID.current = null;
    }
  }

  const notGettingReady = () => {
    const MESSAGE_NOT_GETTING_READY_IN_TIME = "You failed to get ready in time after successfully matched someone. Please pay more attention while waiting for matching and try matching again.";
    sendUpdateReadyStateRequest(auth.token, false);
    onNavigatingAway();
    navigate(`../matching/failed?message=${MESSAGE_NOT_GETTING_READY_IN_TIME}&difficulties=${difficultiesStr}&topics=${topicsStr}`)
  }

  const updateEndMatchingTimer = () => {
    if(location.pathname !== pathname) {
      onNavigatingAway();
      return;
    }
    if(isReady) {
      return;
    }
    setGetReadyTimer(val => {
      if(val - 1 == 0) {
        notGettingReady();
      }
      return val - 1;
    });
  }

  const checkPeerReadyState = () => {
    console.log("checking peer ready state");
    if(location.pathname !== pathname) {
      onNavigatingAway();
      return;
    }
    sendCheckPeerReadyStateRequest(auth.token).then(
      response => {
        const isSuccess = response.status === 200;
        if(isSuccess) {
          if(response.message === "ready") {
            console.log("the peer is also ready, starting collaboration");
            onNavigatingAway();
            navigate(`../collaboration`);
          }
          else if(response.message === "not ready") {
            console.log("the peer is not ready, retry matching");
            onNavigatingAway();
            retryMatching();
          }
          return;
        }
        if(response.message === "ERR_NETWORK") {
          checkPeerReadyStateNetworkErrorCount.current++;
          if(checkPeerReadyStateNetworkErrorCount.current >= MAXIMUM_CHECK_PEER_READY_STATE_NETWORK_ERROR_COUNT) {
            onNavigatingAway();
            console.log("waiting for getting ready cancelled due to network error");
            navigate(`../matching/failed?message=Network error, please check your network and try again.&difficulties=${difficultiesStr}&topics=${topicsStr}`);
          }
        }
        else {
          onNavigatingAway();
          console.log("waiting for getting ready cancelled due to backend error");
          navigate(`../matching/failed?message=${response.message}&difficulties=${difficultiesStr}&topics=${topicsStr}`);
        }
      }
    );
  }

  const displayError = (message : string) => {
    setDisplayedMessage({message : message, type : DisplayedMessageTypes.Error});
  }

  const retryMatching = () => {
    retryPreviousMatching(auth.token).then(
      response => {
        const isSuccess = response.status === 200;
        if(isSuccess) {
          navigate(`../matching/wait?peerNotReady=true&difficulties=${difficultiesStr}&topics=${topicsStr}`);
        }
        else {
          displayError("An error has occured: \n" + response.message);
        }
      }
    )
  }
  
  
  useEffect(() => {
    if(getReadyTimerIntervalID.current === null) {
      getReadyTimerIntervalID.current = window.setInterval(updateEndMatchingTimer, 1000);
    }
  }, []);

  document.title = "Get Ready | PeerPrep";

  const getReadyButtonOnClick = () => {
    sendUpdateReadyStateRequest(auth.token, true).then(
      response => {
        const isSuccess = response.status === 200;
        if(isSuccess) {
          setIsReady(true);
          if(getReadyTimerIntervalID.current !== null) {
            window.clearInterval(getReadyTimerIntervalID.current);
          }
          if(checkPeerReadyStateIntervalID.current === null) {
            checkPeerReadyStateIntervalID.current = window.setInterval(checkPeerReadyState, CHECK_PEER_READY_STATE_INTERVAL);
          }
        }
        else {
          displayError("An error has occured: \n" + response.message);
        }
      }
    )
  }

  return (
  <>
    <PageHeader />
    <MainContainer>
      <div className="flex flex-col space-y-5 justify-center items-center">
        <PageTitle>Matching success</PageTitle>
        <div>We have successfully found a match!</div>
        {!isReady ? (
          <>
            <div>Get ready in {GET_READY_MAXIMUM_WAIT_TIME} seconds!</div>
            <Button className="btngreen" onClick={getReadyButtonOnClick}>Yes, I'm ready! ({getReadyTimer})</Button>
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
