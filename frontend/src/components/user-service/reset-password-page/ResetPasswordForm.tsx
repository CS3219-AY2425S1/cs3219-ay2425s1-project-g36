import { useEffect, useState } from "react";
import InputFieldWithTip from "../InputFieldWithTip";
import { DisplayedMessage, DisplayedMessageContainer, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";
import { getUserFromToken, resetPassword } from "@/api/user-service/UserService";
import { useNavigate } from "react-router-dom";
import ResetPasswordButton from "./ResetPasswordButton";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordForm({ token } : { token : string }){

    const [username, setUsername] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [displayedSignupMessage, setDisplayedSignupMessage] = useState<DisplayedMessage | null>(null);
    const { toast } = useToast();

    const navigate = useNavigate();

    const tip_password = "Your password should be at least 8 characters long, and should contains at least one upper case letter, one lower case letter and one digit.";
    const tip_confirmpassword = "Please repeat your password.";

    const isPasswordValid = () => {
        const re = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9- ?!@#$%^&*\/\\]{8,}$/;
        return re.test(password);
    }

    const passwordInputFieldOnChangeHandler = (newPassword : string) => {
        setPassword(newPassword);
        let passwordStrengthSum = 0;
        passwordStrengthSum += newPassword.length * 4; // longer password is considered safer
        const specialChars = "- ?!@#$%^&*\/\\";
        if(newPassword.length > 1) {
            // 0=number 1=upper case, 2=lower case
            const getCharacterType = (index : number) => {
                const charCode = newPassword.charCodeAt(index);
                if(charCode >= 48 && charCode <= 57) { // 0-9
                    return 0;
                }
                if(charCode >= 65 && charCode <= 90) { // A-Z
                    return 1;
                }
                if(charCode >= 97 && charCode <= 122) { // a-z
                    return 2;
                }
                if (specialChars.includes(newPassword[index])) { // special characters
                    return 3;
                }
                return 0;
            }
            for(let i = 1; i < newPassword.length; i++){
                passwordStrengthSum += getCharacterType(i) !== getCharacterType(i - 1) ? 10 : 0; // password with different character type between more adjancent characters is considered safer
            }
        }
        setPasswordStrength(passwordStrengthSum);
    }

    const showDisplayedSignupMessage = (message : string | React.ReactNode, type : DisplayedMessageTypes) => {
        setDisplayedSignupMessage({message : message, type : type});
    }

    const startResetPassword = () => {
        if(password === "" || confirmPassword === "") {
            showDisplayedSignupMessage("All fields cannot be empty.", DisplayedMessageTypes.Error);
            return;
        }
        
        if(password.length < 8){
            showDisplayedSignupMessage("The password needs to be at least 8 characters long.", DisplayedMessageTypes.Error);
            return;
        } else if (!isPasswordValid()) {
            showDisplayedSignupMessage(
                <>
                    The password needs to contain one uppercase letter, one lowercase letter and one digit. Special characters must be these: <code>- ?!@#$%^&*/\</code>
                </>,
                DisplayedMessageTypes.Error);
            return;
        }

        if(confirmPassword !== password){
            showDisplayedSignupMessage("Password and confirm password does not match each other.", DisplayedMessageTypes.Error);
            return;
        }
        showDisplayedSignupMessage("Resetting password...", DisplayedMessageTypes.Info);
        resetPassword(token, password) // TODO: captcha logic (after captcha logic is implemented in the backend)
            .then(response => {
                const message = response.message;
                const isSuccess = response.status === 200;
                const type = isSuccess ? DisplayedMessageTypes.Info : DisplayedMessageTypes.Error;
                showDisplayedSignupMessage(message, type);
                if (isSuccess) {
                    // redirect users to login page
                    toast({
                        description: `Your password has been reset successfully. Please log in with your new password.`, 
                    })
                    navigate("/login");
                } else {
                    // error in resetting the password
                    toast({
                        description: `There was an error resetting the password. Try again?`, 
                    })
                }
            });
    }

    useEffect(() => {
        getUserFromToken(token).then(response => {
            if (response.status === 200) {
                setUsername(response.username ?? "");
                setEmailAddress(response.email ?? "");
            } else {
                // reset token is expired or invalid
                toast({
                    description: `Redirected to login page as reset token is invalid!`, 
                })
                navigate("/login");
            }
        }).catch(_error => {
            // error in retrieving the token
            toast({
                description: `Redirected to login page as there was an error retrieving the token!`, 
            })
            navigate("/login");
        });
    }, []);

    return(
        <>
          <form onSubmit={evt => {evt.preventDefault();}} className="w-3/4">
            <p className="font-bold mb-1">Username:</p>
            <p>{ username }</p>
            <p className="font-bold mt-3 mb-1">Email Address:</p>
            <p>{ emailAddress }</p>
            <p className="font-bold mt-3 mb-1">Password:</p>
            <InputFieldWithTip placeholder="Your password" onChange={passwordInputFieldOnChangeHandler} type="password">
             {!isPasswordValid() && (<div className="text-red-300">Invalid password.</div>)}
              <p>Password strength:</p>
              <div className="h-3 flex flex-row bg-gray-300">
                {passwordStrength > 0 && (<div className="bg-red-500" style={{width: Math.min(passwordStrength, 33) + "%"}}/>)}
                {passwordStrength > 33 && <div className="bg-yellow-500" style={{width: (Math.min(passwordStrength, 67) - 33) + "%"}}/>}
                {passwordStrength > 66 && <div className="bg-green-500" style={{width: (Math.min(passwordStrength, 100) - 66) + "%"}}/>}
              </div>
              <div className="m-2"/>
              {tip_password}
            </InputFieldWithTip>
            <p className="font-bold mt-3 mb-1">Confirm Password:</p>
            <InputFieldWithTip placeholder="Confirm Password" onChange={setConfirmPassword} type="password">
              {confirmPassword !== password && (<div className="text-red-300">Password does not match.</div>)}
              {tip_confirmpassword}
            </InputFieldWithTip>
            <DisplayedMessageContainer displayedMessage={displayedSignupMessage}/>
            <ResetPasswordButton onClick={ startResetPassword }/>
          </form>
        </>
    )
}