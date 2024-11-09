import axios from "axios";

// const COLLABORATION_SERVICE_URL = "http://localhost:3002/"
const COLLABORATION_SERVICE_URL = "http://collaboration:3002/"
const COLLABORATION_BASE_URL = "/collaboration"
const REMOVE_USER_URL = "/remove"
const IS_USER_IN_STORE_URL = "/in-store"
const RUN_CODE_URL = "/run-code"
const CHECK_CREDITS_SPENT = "/check-credits-spent"

const api = axios.create({
  baseURL: COLLABORATION_SERVICE_URL,
  withCredentials: true
})

// Frontend uses this function to retrieve collaboration details
async function getCollabInfo(userId: string) {
  return await api.get(COLLABORATION_BASE_URL + `/${userId}`).then(response => {
    return {
      status: response.status,
      message: response.data.message,
      data: response.data.data
    }
  }).catch(error => {
    return {
      status: error.status,
      message: error.response.data.message,
      data: null
    }
  })
}

// When user ends a session/logs out, remove the user from collabStore
async function removeUserFromCollabStore(userId: string) {
  return await api.post(COLLABORATION_BASE_URL + REMOVE_USER_URL + `/${userId}`).then(response => {
    return {
      status: response.status,
      message: response.data.message,
    }
  }).catch(error => {
    return {
      status: error.status,
      message: error.response.data.message,
    }
  })
}

// Checks if userId is in collabStore. Used to verify a user that is attempting to enter a collaboration room
async function isUserInCollabStore(userId: string) {
  return await api.get(COLLABORATION_BASE_URL + IS_USER_IN_STORE_URL + `/${userId}`).then(response => {
    return {
      status: response.status,
      message: response.data.message,
    }
  }).catch(error => {
    return {
      status: error.status,
      message: error.response.data.message,
    }
  })
}

// Update user's progLang whenever the language changes
async function updateUserProgLang(userId: string, progLang: string) {
  const requestBody = { progLang }

  return await api.put(COLLABORATION_BASE_URL + `/${userId}`, requestBody).then(response => {
    return {
      status: response.status,
      message: response.data.message,
    }
  }).catch(error => {
    return {
      status: error.status,
      message: error.response.data.message,
    }
  })
}

// Sends API request to JDoodle to execute code in a sandboxed environment
async function executeCodeInSandboxEnvironment(script: string, stdin: string, language: string, versionIndex: string) {
  const requestBody = {
    script: script,
    stdin: stdin,
    language: language,
    versionIndex: versionIndex
  }

  try {
    const response = await api.post(COLLABORATION_BASE_URL + RUN_CODE_URL, 
      requestBody, 
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    )

    console.log("sending api request information to CollaborationPage")

    return {
      status: response.status,
      output: response.data
    }
  } catch (error: any) {
    return {
      status: error.response ? error.response.status : 500, 
      output: error.response ? error.response.data.message : "An error occurred when calling executeCodeInSandboxEnvironment()",
    }
  }
}

// Checks how many API calls to JDoodle you have made today
// Note that one day can make max 20 calls
async function getCreditsSpent() {
  try {
    const response = await api.post(COLLABORATION_BASE_URL + CHECK_CREDITS_SPENT)
    return {
      status: response.status,
      data: response.data
    }
  } catch (error: any) {
    return {
      status: error.response ? error.response.status : 500, 
      output: error.response ? error.response.data.message : "An error occurred when calling getCreditsSpent()",
    }
  }
}

export { getCollabInfo, removeUserFromCollabStore, isUserInCollabStore, updateUserProgLang, executeCodeInSandboxEnvironment, getCreditsSpent }