import axios from "axios";
import { SelectedDifficultyData } from "@/components/matching-service/DifficultySelectionBox";

const MATCHING_SERVICE_URL = "http://localhost:5000/";
const MATCHING_BASE_URL = "/matching";
const START_MATCHING_URL = "/start";
const CHECK_MATCHING_STATE_URL = "/check_state";
const CANCEL_MATCHING_URL = "/cancel";
const CONFIRM_READY_URL = "/ready/yes"
const CONFIRM_NOT_READY_URL = "/ready/no"
const CHECK_PEER_READY_STATE_URL = "/ready/check_state"

const api = axios.create({baseURL : MATCHING_SERVICE_URL})

let previousStartMatchingData : any = null;

/**
 * An async function for sending a start matching request to the backend.
 * 
 * @param token The current user's token.
 * @param difficulties The difficulties selected by the user for matching.
 * @param topics The topics selected by the user for matching.
 * @returns An object containing the HTTP status code of the request and the message from the backend server
 */
async function sendStartMatchingRequest(token : string, difficulties : SelectedDifficultyData, topics : string[]) {
  const requestBody = {
    userToken : token,
    difficulties : difficulties,
    topics : topics
  }

  previousStartMatchingData = requestBody;

  return await api.post(MATCHING_BASE_URL + START_MATCHING_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    return {status : error.status, message : error.response.data.message}
  })
}

/**
 * An async function for resending the previous start matching request to the backend.
 * This function will use the `difficulties` and `topics` data from the previous `sendStartMatchingRequest` call, so make sure that you have called `sendStartMatchingRequest` at least for one time before calling this function.
 * 
 * @param token The current user's token.
 * @returns An object containing the HTTP status code of the request and the message from the backend server.
 */
async function retryPreviousMatching(token : string) {
  if(previousStartMatchingData === null) {
    throw new Error("[retryMatching] previousStartMatchingData is null");
  }

  return await api.post(MATCHING_BASE_URL + START_MATCHING_URL, {...previousStartMatchingData, userToken : token}).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    return {status : error.status, message : error.response.data.message}
  })
}

/**
 * An async function for sending a check matching state request to the backend.
 * You should call this function intermittently for multiple times when waiting for matching in order to get the latest matching state.
 * 
 * @param token The current user's token.
 * @returns An object containing the HTTP status code of the request and the message from the backend server.
 */
async function sendCheckMatchingStateRequest(token : string) {
  const requestBody = {
    userToken : token
  }
  return await api.post(MATCHING_BASE_URL + CHECK_MATCHING_STATE_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    if(error.code === "ERR_NETWORK") {
      return {status : error.status, message : "ERR_NETWORK"}
    }
    return {status : error.status, message : error.response.data.message}
  });
}

/**
 * An async function for sending a cancel matching request to the backend.
 * The request is for notifying the backend that the frontend stops using the matching service (for example: user decided to cancel matching, user left the waiting matching page, etc.)
 * 
 * @param token The current user's token.
 * @returns An object containing the HTTP status code of the request and the message from the backend server.
 */
async function sendCancelMatchingRequest(token : string) {
  const requestBody = {
    userToken : token
  }
  return await api.post(MATCHING_BASE_URL + CANCEL_MATCHING_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    return {status : error.status, message : error.response.data.message}
  })
}

/**
 * An async function for updating the ready state of the current user to the backend.
 * 
 * @param token The current user's token.
 * @param isReady `true` if the user is confirmed ready, and `false` if the user failed to get ready in time.
 * @returns An object containing the HTTP status code of the request and the message from the backend server.
 */
async function sendUpdateReadyStateRequest(token : string, isReady : boolean) {
  const requestBody = {
    userToken : token
  }
  const url = isReady ? CONFIRM_READY_URL : CONFIRM_NOT_READY_URL;
  return await api.post(MATCHING_BASE_URL + url, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    return {status : error.status, message : error.response.data.message}
  })
}

/**
 * An async function for sending a check peer ready state request to the backend.
 * You should call this function intermittently for multiple times when waiting for the peer to get ready in order to get the latest state.
 * 
 * @param token The current user's token.
 * @returns An object containing the HTTP status code of the request and the message from the backend server.
 */
async function sendCheckPeerReadyStateRequest(token : string) {
  const requestBody = {
    userToken : token
  }
  return await api.post(MATCHING_BASE_URL + CHECK_PEER_READY_STATE_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    if(error.code === "ERR_NETWORK") {
      return {status : error.status, message : "ERR_NETWORK"}
    }
    return {status : error.status, message : error.response.data.message}
  });
}

export { sendStartMatchingRequest, sendCheckMatchingStateRequest, sendCancelMatchingRequest, sendUpdateReadyStateRequest, sendCheckPeerReadyStateRequest, retryPreviousMatching };