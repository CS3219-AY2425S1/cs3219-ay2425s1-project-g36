import axios from "axios";


const USER_SERVICE_URL = "http://localhost:4000";
const USERS_BASE_URL = "/users";
const AUTH_BASE_URL = "/authentication";
const LOGIN_API = "/login";
const SIGNUP_API = "/";
const RESET_PASSWORD_API = "/forgot-password";

const api = axios.create({
  baseURL: USER_SERVICE_URL,
  withCredentials: true
});

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
 * An async function for sending a reset password request to the backend.
 * @param emailAddress The email address of the account for resetting password.
 * @returns An object containing the HTTP status code of the request and the responded message from the backend.
 */
async function sendResetPasswordRequest(emailAddress : string) {
  const requestBody = {
    email : emailAddress
  }
  return await api.post(AUTH_BASE_URL + RESET_PASSWORD_API, requestBody).then(response => {
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

export { sendLoginRequest, sendResetPasswordRequest, sendSignupRequest };