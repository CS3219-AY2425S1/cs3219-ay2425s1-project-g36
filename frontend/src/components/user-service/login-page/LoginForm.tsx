import { useState } from "react";
import LoginButton from "./LoginButton";
import PasswordInputField from "./PasswordInputField";
import UsernameInputField from "./UsernameInputField";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";
import { sendLoginRequest } from "@/api/user-service/UserService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LoginForm(){
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [displayedLoginMessage, setDisplayedLoginMessage] = useState<DisplayedMessage | null>(null);
    
    const showDisplayedLoginMessage = (message : string, type : DisplayedMessageTypes) => {
      setDisplayedLoginMessage({message : message, type : type});
    }
    
    const loginWithCredentials = (username : string, password : string, captcha : string) => {
      if(username === "" || password === "") {
        showDisplayedLoginMessage("Username or password cannot be empty.", DisplayedMessageTypes.Error);
        return;
      }
      showDisplayedLoginMessage("Logging in...", DisplayedMessageTypes.Info);
      sendLoginRequest(username, password, captcha).then(response => {
        const message = response.message;
        const isSuccess = response.status === 200;
        const isAdmin = response.userInfo?.isAdmin;
        const token = response.userInfo?.token;
        const type = isSuccess ? DisplayedMessageTypes.Info : DisplayedMessageTypes.Error;
        showDisplayedLoginMessage(message, type);
        if(isSuccess) {
          login(token, isAdmin);
          navigate("/");
        }
      });
    }

    const backdoor = () => login("", false);
    const backdoorAdmin = () => login("", true);

    const startLoggingIn = () => loginWithCredentials(username, password, ""); // captcha todo
    
    return(
        <>
          <form onSubmit={evt => {evt.preventDefault(); startLoggingIn();}} className="w-3/4">
            <UsernameInputField onChange={setUsername}/>
            <PasswordInputField onChange={setPassword}/>
            <DisplayedMessageContainer displayedMessage={displayedLoginMessage} />
            <LoginButton onClick={startLoggingIn}/>
            <Button onClick={backdoor}>
              Backdoor - login as user<br />(remove once user service implemented)
            </Button>
            <Button onClick={backdoorAdmin}>
              Backdoor - login as admin<br />(remove once user service implemented)
            </Button>
          </form>
        </>
    )
}