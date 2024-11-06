import { sendCancelMatchingRequest, sendCheckMatchingStateRequest } from "@/api/matching-service/MatchingService";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import PageTitle from "@/components/common/PageTitle";
import SpinningCircle from "@/components/matching-service/SpinningCircle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

const MAXIMUM_MATCHING_DURATION = 30; // in seconds
const CHECK_MATCHING_STATE_INTERVAL = 500; // in milliseconds

export default function WaitForMatchingPage() {
  const [parameters] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const checkMatchingStateNetworkErrorCount = useRef(0);
  const MAXIMUM_CHECK_MATCHING_STATE_NETWORK_ERROR_COUNT = 60;
  const pathname = location.pathname;
  const [endMatchingTimer, setEndMatchingTimer] = useState(MAXIMUM_MATCHING_DURATION);
  const checkMatchingStateIntervalID = useRef<number | null>(null);
  const endMatchingTimerIntervalID = useRef<number | null>(null);

  const difficultiesStr = parameters.get("difficulties");
  const topicsStr = parameters.get("topics");
  const progLangsStr = parameters.get("progLangs");

  /**
   * Check the matching state for the user every 0.5 seconds.
   * 
   * If the user is matched, navigate to the get ready page.
   * If the user is not matched yet, do nothing.
   * Else, navigate to the failed matching page with the respective error message.
   */
  const checkMatchingState = () => {
    console.log("checking matching state");
    // If the user navigates away manually, cancel the matching
    if(location.pathname !== pathname) {
      cancelMatching();
      console.log("matching cancelled due to leaving page");
      return;
    }

    // Send a request to the backend to check the matching state
    sendCheckMatchingStateRequest(auth.id).then(
      response => {
        if(response.status === 200) {
          // If the user is matched, navigate to the confirmation page
          console.log("match found!");
          cancelMatching(false);
          navigate(`../matching/get_ready?difficulties=${difficultiesStr}&topics=${topicsStr}&progLangs=${progLangsStr}`);

        } else if (response.status === 202) {
          // If the user is still waiting for a match, do nothing
          console.log("matching...");

        } else if (response.message === "ERR_NETWORK") {
          // If there is a network error, try again
          checkMatchingStateNetworkErrorCount.current++;
          if(checkMatchingStateNetworkErrorCount.current >= MAXIMUM_CHECK_MATCHING_STATE_NETWORK_ERROR_COUNT) {
            cancelMatching(false);
            console.log("matching cancelled due to network error");
            navigate(`../matching/failed?message=Network error, please check your network and try again.&difficulties=${difficultiesStr}&topics=${topicsStr}&progLangs=${progLangsStr}`);
          }
        
        } else {
          // If there is a backend error, navigate to the failed matching page
          cancelMatching();
          console.log("matching cancelled due to backend error");
          navigate(`../matching/failed?message=${response.message}&difficulties=${difficultiesStr}&topics=${topicsStr}&progLangs=${progLangsStr}`);
        }
      }
    );
  }

  /**
   * Cancels the matching process by clearing the intervals.
   * If the matching has to be cancelled in the backend, send a request to do so.
   * 
   * @param isCancelled Whether the matching has to be cancelled in the backend
   */
  const cancelMatching = (isCancelled : boolean = true) => {
    console.log("cancel matching");
    if(checkMatchingStateIntervalID.current !== null) {
      window.clearInterval(checkMatchingStateIntervalID.current);
    }
    if(endMatchingTimerIntervalID.current !== null) {
      window.clearInterval(endMatchingTimerIntervalID.current);
    }
    if(isCancelled) {
      sendCancelMatchingRequest(auth.id);
    }
    navigate("../matching/start");
  }

  // Detects if the user navigates away. If so, cancels matching straight away
  useEffect(() => {
    const currentPath = location.pathname;

    const unlisten = () => {
      if (location.pathname !== currentPath) {
        cancelMatching();
      }
    };

    return unlisten; 
  }, [location, cancelMatching]);

  /**
   * Updates the end matching timer every second.
   * If the timer reaches 0, cancel the matching and navigate to the failed matching page.
   */
  const updateEndMatchingTimer = () => {
    setEndMatchingTimer(val => {
      if(val - 1 <= 0) {
        cancelMatching(false);
        console.log("matching cancelled due to timed out");
        navigate(`../matching/failed?message=A match couldn't be found after ${MAXIMUM_MATCHING_DURATION} seconds. You may try again or refine your question selections to increase your chances to match.&difficulties=${difficultiesStr}&topics=${topicsStr}&progLangs=${progLangsStr}`);
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

  return (
    <>
      <PageHeader />
      <MainContainer>
        <div className="flex flex-col space-y-5 justify-center items-center">
          <PageTitle>Please wait for a moment...</PageTitle>
          <div>Searching for other users who also want to do <b>{difficultiesStr}</b> questions with topics <b>{topicsStr}</b> using languages <b>{progLangsStr}</b>.</div>
          <div>
            <div className="h-10" />
            <SpinningCircle>
              <div className="text-2xl">{endMatchingTimer}</div>
            </SpinningCircle>
            <div className="h-10" />
          </div>
          <div className="flex justify-center mt-20">
            <Button className="bg-red-500 text-white hover:bg-gray-500" onClick={()=>cancelMatching()}>Cancel matching</Button>
          </div>
        </div>
      </MainContainer>
    </>
    )
}
