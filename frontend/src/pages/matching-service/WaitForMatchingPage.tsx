import { sendCancelMatchingRequest, sendCheckMatchingStateRequest } from "@/api/matching-service/MatchingService";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import SpinningCircle from "@/components/matching-service/SpinningCircle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const CHECK_MATCHING_STATE_INTERVAL = 1000; // in milliseconds
const MAXIMUM_MATCHING_DURATION = 60; // in seconds
const MAXIMUM_CHECK_MATCHING_STATE_NETWORK_ERROR_COUNT = 5;

export default function WaitForMatchingPage() {
  const [parameters] = useSearchParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const checkMatchingStateIntervalID = useRef<number | null>(null);
  const endMatchingTimerIntervalID = useRef<number | null>(null);
  const checkMatchingStateNetworkErrorCount = useRef(0);
  const [endMatchingTimer, setEndMatchingTimer] = useState(MAXIMUM_MATCHING_DURATION);
  const pathname = location.pathname;

  const difficultiesStr = parameters.get("difficulties");
  const topicsStr = parameters.get("topics");
  const peerNotReady = parameters.get("peerNotReady");

  const checkMatchingState = () => {
    console.log("checking matching state");
    if(location.pathname !== pathname) {
      cancelMatching();
      console.log("matching cancelled due to leaving page");
      return;
    }
    sendCheckMatchingStateRequest(auth.token).then(
      response => {
        const isSuccess = response.status === 200;
        if(isSuccess) {
          if(response.message === "match found") {
            console.log("match found!");
            cancelMatching(false);
            navigate(`../matching/get_ready?difficulties=${difficultiesStr}&topics=${topicsStr}`);
          }
          return;
        }
        if(response.message === "ERR_NETWORK") {
          checkMatchingStateNetworkErrorCount.current++;
          if(checkMatchingStateNetworkErrorCount.current >= MAXIMUM_CHECK_MATCHING_STATE_NETWORK_ERROR_COUNT) {
            cancelMatching(false);
            console.log("matching cancelled due to network error");
            navigate(`../matching/failed?message=Network error, please check your network and try again.&difficulties=${difficultiesStr}&topics=${topicsStr}`);
          }
        }
        else {
          cancelMatching();
          console.log("matching cancelled due to backend error");
          navigate(`../matching/failed?message=${response.message}&difficulties=${difficultiesStr}&topics=${topicsStr}`);
        }
      }
    );
  }

  const cancelMatching = (sendCancellationRequest : boolean = true) => {
    console.log("cancel matching");
    if(checkMatchingStateIntervalID.current !== null) {
      window.clearInterval(checkMatchingStateIntervalID.current);
    }
    if(endMatchingTimerIntervalID.current !== null) {
      window.clearInterval(endMatchingTimerIntervalID.current);
    }
    if(sendCancellationRequest) {
      sendCancelMatchingRequest(auth.token);
    }
    navigate("../matching/start");
  }

  const updateEndMatchingTimer = () => {
    setEndMatchingTimer(val => {
      if(val - 1 <= 0) {
        cancelMatching();
        console.log("matching cancelled due to timed out");
        navigate(`../matching/failed?message=A match couldn't be found after ${MAXIMUM_MATCHING_DURATION} seconds. You may try again or refine your question selections to increase your chances to match.&difficulties=${difficultiesStr}&topics=${topicsStr}`);
      }
      return val - 1;
    });
    
  }

  useEffect(() => {
    if(checkMatchingStateIntervalID.current === null) {
      checkMatchingStateIntervalID.current = window.setInterval(checkMatchingState, CHECK_MATCHING_STATE_INTERVAL);
    }
    if(endMatchingTimerIntervalID.current === null) {
      endMatchingTimerIntervalID.current = window.setInterval(updateEndMatchingTimer, 1000);
    }
  }, []);

  document.title = "Matching | PeerPrep";

  return (
  <>
    <PageHeader />
    <MainContainer>
      <div className="flex flex-col space-y-5 justify-center items-center">
        <PageTitle>Please wait for a moment...</PageTitle>
        {peerNotReady === "true" && (
          <div className="text-red-500">Because the other user you've just matched with didn't get ready in time, now we are retry matching for you.</div>
        )}
        <div>Searching for students who also want to do <b>{difficultiesStr}</b> questions with topics <b>{topicsStr}</b>.</div>
        <div>
          <div className="h-10" />
          <SpinningCircle>
            <div className="text-2xl">{endMatchingTimer}</div>
          </SpinningCircle>
          <div className="h-10" />
        </div>
        <div className="flex justify-center mt-20">
          <Button className="bg-red-500 text-white hover:bg-gray-500" onClick={()=>cancelMatching(true)}>Cancel matching</Button>
        </div>
      </div>
    </MainContainer>
  </>
  )
}