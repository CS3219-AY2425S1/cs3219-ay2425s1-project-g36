import { useState } from "react";
import LoginButton from "./LoginButton";
import PasswordInputField from "./PasswordInputField";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";
import { sendLoginRequest } from "@/api/user-service/UserService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EmailInputField from "./EmailInputField";

export default function LoginForm(){
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayedLoginMessage, setDisplayedLoginMessage] = useState<DisplayedMessage | null>(null);
    
    const showDisplayedLoginMessage = (message : string, type : DisplayedMessageTypes) => {
      setDisplayedLoginMessage({message : message, type : type});
    }
    
    const loginWithCredentials = (email : string, password : string, captcha : string) => {
      if(email === "" || password === "") {
        showDisplayedLoginMessage("Email or password cannot be empty.", DisplayedMessageTypes.Error);
        return;
      }
      showDisplayedLoginMessage("Logging in...", DisplayedMessageTypes.Info);
      sendLoginRequest(email, password, captcha).then(response => {
        const message = response.message;
        const isSuccess = response.status === 200;
        const isAdmin = response.userInfo?.isAdmin;
        const id = response.userInfo?.id;
        const username = response.userInfo?.username;
        const token = response.userInfo?.token;
        const type = isSuccess ? DisplayedMessageTypes.Info : DisplayedMessageTypes.Error;
        showDisplayedLoginMessage(message, type);
        if(isSuccess) {
          login(token, id, username, email, isAdmin);
          navigate("/");
        }
      }).catch(error => {
        showDisplayedLoginMessage("An error occurred when logging in: " + error, DisplayedMessageTypes.Error);
      });
    }

    const startLoggingIn = () => loginWithCredentials(email, password, ""); // captcha todo
    
    return(
        <>
          <form onSubmit={evt => {evt.preventDefault(); startLoggingIn();}} className="w-3/4">
            <EmailInputField onChange={setEmail}/>
            <PasswordInputField onChange={setPassword}/>
            <DisplayedMessageContainer displayedMessage={displayedLoginMessage} />
            <LoginButton onClick={startLoggingIn}/>
          </form>
        </>
    )
}