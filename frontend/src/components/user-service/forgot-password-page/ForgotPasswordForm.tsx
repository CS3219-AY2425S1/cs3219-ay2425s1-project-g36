import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";
import ForgotPasswordButton from "./ForgotPasswordButton";
import EmailAddressInputField from "./EmailAddressInputField";
import { useState } from "react";
import { sendForgotPasswordRequest } from "@/api/user-service/UserService";
import { Link } from "react-router-dom";

export default function ForgotPasswordForm(){
    const [emailAddress, setEmailAddress] = useState("");
    const [displayedResetPasswordMessage, setDisplayedResetPasswordMessage] = useState<DisplayedMessage | null>(null);
    const [requestSent, setRequestSent] = useState(false);

    const showDisplayedResetPasswordMessage = (message : string, type : DisplayedMessageTypes) => {
      setDisplayedResetPasswordMessage({message : message, type : type});
    }

    const sendRequest = () => {
      if(emailAddress === "") {
          showDisplayedResetPasswordMessage("Email address cannot be empty.", DisplayedMessageTypes.Error);
          return;
      }
      showDisplayedResetPasswordMessage("Sending request...", DisplayedMessageTypes.Info);
      sendForgotPasswordRequest(emailAddress).then(response => {
        const message = response.message;
        const isSuccess = response.status === 200;
        const type = isSuccess ? DisplayedMessageTypes.Info : DisplayedMessageTypes.Error;
        showDisplayedResetPasswordMessage(message, type);
        if(isSuccess) {
          setRequestSent(true);
        }
      });
    }

    return(
      <>
        <form onSubmit={evt => {evt.preventDefault();}} className="w-3/4">
          <p className="font-bold m-3">Email Address:</p>
          <EmailAddressInputField onChange={setEmailAddress}/>
          <DisplayedMessageContainer displayedMessage={displayedResetPasswordMessage} />
          {!requestSent ?
            (<ForgotPasswordButton onClick={sendRequest}/>) :
            (
              <div className="flex items-center justify-center flex-col">
                <div className="text-green-500 text-center">Please check your email inbox for the password recovery email.</div>
                <Link to="/login">Go back to login page</Link>
              </div>
            )}
         </form>
      </>
    )
}