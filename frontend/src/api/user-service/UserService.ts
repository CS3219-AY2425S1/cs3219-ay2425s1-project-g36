import axios, { AxiosError } from "axios";

const USER_SERVICE_URL = "http://localhost:4000";
const USERS_BASE_URL = "/users";
const AUTH_BASE_URL = "/authentication";
const LOGIN_API = "/login";
const LOGOUT_API = "/logout";
const SIGNUP_API = "/";
const FORGOT_PASSWORD_API = "/forgot-password";
const RESET_PASSWORD_API = "/reset-password";
const UPDATE_ACCOUNT_API = "/update";
const DELETE_ACCOUNT_API = "/";
const UPDATE_PRIVILEGE_API = "/privilege";
const ATTEMPT_HISTORY_API = '/history'

const api = axios.create({
  baseURL: USER_SERVICE_URL,
  withCredentials: true
});

// Add a request interceptor to simulate network errors
// play around with the X value to inflict absolute havoc
// api.interceptors.request.use(
//   (config) => {
//     const X = 0;
//     // Simulate a random network failure with a X% probability
//     if (Math.random() < X/100) {
//       return Promise.reject(new AxiosError('Simulated network error', '500'));
//     }
//     return config;
//   },
//   (error) => Promise.reject(new AxiosError(error.message, '500'))
// );

/**
 * An async function for sending a login request to the backend.
 * @param email The email address.
 * @param password The password.
 * @param captcha The captcha value (when required).
 * @returns An object containing the HTTP status code of the request, the responded message from the backend and the user's information.
 */
async function sendLoginRequest(email : string, password : string, captcha : string) {
  const loginData = {
    email : email,
    password : password,
    captcha : captcha
  }
  return await api.post(AUTH_BASE_URL + LOGIN_API, loginData).then(response =>
  {
    const userInfo = {
      token : response.data.token,
      id: response.data.id,
      isAdmin: response.data.isAdmin ? true : false,
      username: response.data.username,
      email: response.data.email,
    }
    return {status: response.status, message: response.data.message, userInfo: userInfo};
  }).catch(error =>
  {
    return {status: error.status, message: error.response.data.message, userInfo: null};
  })
}

/**
 * An async function for sending a forgot password request to the backend.
 * @param emailAddress The email address of the account for resetting password.
 * @returns An object containing the HTTP status code of the request and the responded message from the backend.
 */
async function sendForgotPasswordRequest(emailAddress : string) {
  const requestBody = {
    email : emailAddress
  }
  return await api.post(AUTH_BASE_URL + FORGOT_PASSWORD_API, requestBody).then(response => {
    return {status: response.status, message: response.data.message};
  }).catch(error => {
    return {status: error.status, message: error.response.data.message};
  })
}

/**
 * An async function for sending a signup request to the backend.
 * @param username The username.
 * @param emailAddress The email address.
 * @param password The password.
 * @returns An object containing the HTTP status code of the request and the responded message from the backend.
 */
async function sendSignupRequest(username : string, emailAddress : string, password : string) {
  const signupData = {
    username : username,
    email : emailAddress,
    password : password
  }

  try {
    const response = await api.post(USERS_BASE_URL + SIGNUP_API, signupData);
    return {status: response.status, message: response.data.message};
  } catch (error : any) {
    return {status: error.response.status, message: error.response.data.message};
  }
}

/**
 * An async function to send a logout request to the backend.
 * 
 * @returns An object containing the HTTP status code of the request and the responded message from the backend.
 */
async function sendLogoutRequest() {
  try {
    const response = await api.post(AUTH_BASE_URL + LOGOUT_API, {});
    return {status: response.status, message: response.data.message};
  } catch (error : any) {
    console.error("Logout error:", error);
    return {status: error.response.status, message: error.response.data.message};
  }
}

async function getUserById(id: string) {
  try {
    // console.log(USERS_BASE_URL + `/${id}`);
    const response = await api.get(USERS_BASE_URL + `/${id}`)
    return {status: response.status, message: response.data.message, data: response.data.data};
  } catch (error : any) {
    console.error("Error retrieving user" , error);
    return {status: error?.response?.status, message: error?.response?.data?.message, data: null};
  }
}

/**
 * An async function that gets the list of users from the backend.
 */
async function getUsers() {
  try {
    const response = await api.get(USERS_BASE_URL);
    return {status: response.status, message: response.data.message, data: response.data.data};
  } catch (error: any) {
    console.error("Error when retrieving user list", error);
    return {status: error.response.status, message: error.response.data.message, data: error.response.data.data};
  }
}

/**
 * An async function that gets the user by the password reset token.
 */
async function getUserFromToken(token : string) {
  try {
    const response = await api.get(AUTH_BASE_URL + RESET_PASSWORD_API + "/" + token);
    return {status: response.status, username: response.data.username, email: response.data.email};
  } catch (error: any) {
    console.error("Error when retrieving user from token", error);
    return {status: error.response.status, message: error.response.data.message};
  }
}

/**
 * An async function that resets a password given the token and new password.
 */
async function resetPassword(token : string, password: string) {
  const resetPasswordData = {
    password: password
  };
  try {
    const response = await api.post(AUTH_BASE_URL + RESET_PASSWORD_API + "/" + token, resetPasswordData);
    return {status: response.status, message: response.data.message};
  } catch (error: any) {
    console.error("Error when resetting password", error);
    return {status: error.response.status, message: error.response.data.message};
  }
}

/**
 * An async function that updates the currently logged in user's username and email.
 */
async function updateAccount(username : string, email : string) {
  const updateAccountData = {
    username : username,
    email : email,
  };
  try {
    const response = await api.patch(USERS_BASE_URL + UPDATE_ACCOUNT_API, updateAccountData);
    console.log("Successfully updated account with the following details:\nUsername:", username, "\nEmail:", email);
    return {status: response.status, message: response.data.message};
  } catch (error: any) {
    console.error("Error when updating account", error);
    return {status: error.response.status, message: error.response.data.message};
  }
}

/**
 * An async function that deletes a user given the user ID.
 */
async function deleteAccount(id : string) {
  try {
    const response = await api.delete(USERS_BASE_URL + DELETE_ACCOUNT_API + '/' + id);
    return {status: response.status, message: response.data.message};
  } catch (error: any) {
    console.error(`Error when deleting account ID ${id}\n`, error);
    return {status: error.response.status, message: error.response.data.message};
  }
}

/**
 * An async function to update a specific user's privilege given the user ID.
 */
async function updateUserPrivilege(id : string, isAdmin : boolean) {
  try {
    const response = await api.patch(USERS_BASE_URL + '/' + id + UPDATE_PRIVILEGE_API, {
      isAdmin: isAdmin
    });
    return {status: response.status, message: response.data.message};
  } catch (error: any) {
    console.error(`Error when updating privilege of account ID ${id}\n`, error);
    return {status: error.response.status, message: error.response.data.message};
  }
}

async function getUserAttempts(id: string) {
  try {
    const response = await api.get(USERS_BASE_URL + ATTEMPT_HISTORY_API + '/' + id);
    return {
      status: response.status,
      message: response.data.message,
      data: response.data.data, // Include the attempt history data
    };
  } catch (error: any) {
    console.log("Error when fetching user attempt histories");
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Unknown error",
      data: null,
    };
  }
}

/**
 * Updates a specific user's attempt history for a given question with the provided attempt details.
 * 
 * This asynchronous function sends a PATCH request to update the user's attempt history, including
 * the question ID, the user's raw code submission, the programming language used, the runtime of the
 * executed code, and the memory usage. This information is recorded to keep track of the user's 
 * attempts and their respective details.
 *
 * @async
 * @function
 * @param {string} userId - The unique identifier for the user whose attempt history is being updated.
 * @param {string} questionId - The unique identifier of the question attempted by the user.
 * @param {string} rawCode - The raw source code submitted by the user for the question.
 * @param {string} language - The programming language in which the code is written.
 * @param {string} runTime - The time taken to execute the code, represented as a string (in seconds).
 * @param {string} memoryUsage - The memory used during code execution, represented as a string (in KB).
 * 
 * @returns {Promise<{status: number, message: string}>} - A promise that resolves to an object containing
 *          the HTTP status code and a message indicating the result of the update operation.
 *          - `status`: HTTP status code returned from the API (e.g., 200 for success).
 *          - `message`: Message from the API response, indicating success or failure details.
 * 
 * @throws {Error} Logs an error message to the console if the request fails and returns an object with
 *                 the error response status and message.
 */
async function updateUserAttemptHistory(userId: string, questionId: string, questionTitle: string, rawCode: string, language: string) {
  try {
    const requestBody = {
      questionId,
      questionTitle,
      rawCode,
      language,
    }

    const response = await api.patch(USERS_BASE_URL + ATTEMPT_HISTORY_API + '/' + userId, requestBody);
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    console.error(`Error when updating account ID ${userId}\n`, error);
    return { status: error.response.status, message: error.response.data.message };
  }
}

export { 
  sendLoginRequest, 
  sendForgotPasswordRequest, 
  sendSignupRequest, 
  sendLogoutRequest, 
  getUsers, 
  getUserById, 
  getUserFromToken, 
  resetPassword, 
  updateAccount, 
  deleteAccount, 
  updateUserPrivilege, 
  getUserAttempts,
  updateUserAttemptHistory
};
