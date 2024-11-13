import axios from "axios";
import { SelectedDifficultyData } from "@/components/matching-service/DifficultySelectionBox";

const MATCHING_SERVICE_URL = "http://localhost:5000/";
const MATCHING_BASE_URL = "/matching";
const START_MATCHING_URL = "/start_matching";
const CONFIRM_MATCH_URL = "/check_confirmation_state";
const CANCEL_MATCHING_URL = "/cancel";
const CHECK_MATCHING_STATE_URL = "/check_matching_state";
const CONFIRM_READY_URL = "/confirm_match";

const api = axios.create({
  baseURL : MATCHING_SERVICE_URL,
  withCredentials : true
})

let previousStartMatchingData : any = null;

/**
 * An async function for sending a start matching request to the backend.
 * 
 * @param id The current user's ID.
 * @param difficulties The difficulties selected by the user for matching.
 * @param topics The topics selected by the user for matching.
 * @returns An object containing the HTTP status code of the request and the message from the backend server
 */
async function sendStartMatchingRequest(id : string, email : string, difficulties : SelectedDifficultyData, topics : string[], progLangs : string[]) {
  const requestBody = {
    id : id,
    email : email,
    difficulties : difficulties,
    topics : topics,
    progLangs : progLangs
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
 * @param id The current user's ID.
 * @returns An object containing the HTTP status code of the request and the message from the backend server.
 */
async function sendCheckMatchingStateRequest(id : string) {
  const requestBody = {
    id : id
  }
  return await api.post(MATCHING_BASE_URL + CHECK_MATCHING_STATE_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message, roomId: response.data.roomId}
  }).catch(error => {
    if(error.code === "ERR_NETWORK") {
      return {status : error.status, message : "ERR_NETWORK", roomId: null}
    }
    return {status : error.status, message : error.response.data.message, roomId: null}
  });
}

/**
 * An async function for sending a cancel matching request to the backend.
 * The request is for notifying the backend that the frontend stops using the matching service (for example: user decided to cancel matching, user left the waiting matching page, etc.)
 * 
 * @param id The current user's ID.
 * @returns An object containing the HTTP status code of the request and the message from the backend server.
 */
async function sendCancelMatchingRequest(id : string) {
  const requestBody = {
    id : id
  }
  return await api.post(MATCHING_BASE_URL + CANCEL_MATCHING_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    return {status : error.status, message : error.response.data.message}
  })
}

/**
 * An async function for sending a confirm ready request to the backend.
 * 
 * @param id The current user's ID.
 * @returns An object containing the HTTP status code of the request and the message from the backend server.
 */
async function sendConfirmReadyRequest(id : string) {
  const requestBody = {
    id : id
  }
  return await api.post(MATCHING_BASE_URL + CONFIRM_READY_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    return {status : error.status, message : error.response.data.message}
  })
}

/**
 * An async function for sending a check confirmation state request to the backend.
 * You should call this function intermittently for multiple times when waiting for confirmation in order to get the latest confirmation state.
 * 
 * @param id The current user's ID.
 * @returns An object containing the HTTP status code of the request and the message from the backend server.
 */
async function sendCheckConfirmationStateRequest(id : string) {
  const requestBody = {
    id : id
  }
  return await api.post(MATCHING_BASE_URL + CONFIRM_MATCH_URL, requestBody).then(response => {
    return {status : response.status, message : response.data.message}
  }).catch(error => {
    if(error.code === "ERR_NETWORK") {
      return {status : error.status, message : "ERR_NETWORK"}
    }
    return {status : error.status, message : error.response.data.message}
  });
}

export { sendStartMatchingRequest, sendCancelMatchingRequest, retryPreviousMatching, sendCheckMatchingStateRequest, sendConfirmReadyRequest, sendCheckConfirmationStateRequest };