import PageTitle from "@/components/common/PageTitle";
import React, { useState } from "react";
import EmailInputField from "./EmailInputField";
import UsernameInputField from "./UsernameInputField";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DeleteAccountDialog from "./DeleteAccountDialog";
import { updateAccount } from "@/api/user-service/UserService";
import { DisplayedMessageContainer, DisplayedMessage, DisplayedMessageTypes } from "@/components/common/DisplayedMessage";
import AdjustPrivilegesDialog from "./AdjustPrivilegesDialog";

export default function AccountSettingsForm() {

    const HTTP_OK = 200;

    const { auth, update } = useAuth();

    const [ username, setUsername ] = useState(auth.username);
    const [ email, setEmail ] = useState(auth.email);
    const [ message, setMessage ] = useState<DisplayedMessage | null>(null);

    async function handleUpdateAccountClick() {
        setMessage({ message: "Updating account...", type: DisplayedMessageTypes.Info });
        
        // frontend validation
        if (username === "") {
            setMessage({ message: "Error in updating the user: Username cannot be empty!", type: DisplayedMessageTypes.Error });
            return;
        }

        if (email === "") {
            setMessage({ message: "Error in updating the user: Email cannot be empty!", type: DisplayedMessageTypes.Error });
            return;
        }

        // Valid: user@example.com, invalid: user@ example.com
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage({ message: "Error in updating the user: Invalid email format", type: DisplayedMessageTypes.Error });
            return;
        }

        // send info to backend
        const response = await updateAccount(username, email);

        if (response.status === HTTP_OK) {
            // don't forget to update the current auth context too!
            // if valid, of course
            update(username, email);
            setMessage({ message: (
                <>
                    Account updated successfully with details:
                    <ul>
                        <li><strong>Username: </strong>{ username }</li>
                        <li><strong>Email: </strong>{ email }</li>
                    </ul>
                </>
            ), type: DisplayedMessageTypes.Info });
        } else {
            setMessage({ message: "Error in updating the user: " + response.message, type: DisplayedMessageTypes.Error });
        }
    }

    function AccountSettingsHeader({ children } : { children : React.ReactNode }) {
        return (
            <h3 className="text-2xl font-bold leading-7 text-gray-900 sm:text-2xl sm:tracking-tight">
                { children }
            </h3>
        )
    }

    return (
        <section>
            <PageTitle>Account Settings</PageTitle>
            <div className="flex flex-col gap-3">
                <AccountSettingsHeader>General Settings</AccountSettingsHeader>
                <div className="flex gap-4">
                    <UsernameInputField
                        value={ username }
                        onChange={ evt => setUsername(evt.target.value) }
                    />
                    <EmailInputField
                        value={ email }
                        onChange={ evt => setEmail(evt.target.value) }
                    />
                </div>
                { auth.isAdmin ? <>
                    <AccountSettingsHeader>Admin Settings</AccountSettingsHeader>
                    <div className="flex">
                        <AdjustPrivilegesDialog />
                    </div>
                </> : <></> }
                <AccountSettingsHeader>Delete Account</AccountSettingsHeader>
                <p>Warning: Deleting an account is irreversible and all your progress will be lost!</p>
                <div className="flex">   
                    <DeleteAccountDialog />
                </div>
                <div className="flex justify-center gap-3">
                    <Button className="btngreen" onClick={handleUpdateAccountClick}>
                        Update Account Settings
                    </Button>
                    <Button className="btnblack">
                        <Link to="/questions">Back to Questions</Link>
                    </Button>
                </div>
                <DisplayedMessageContainer displayedMessage={message} />
            </div>
        </section>
    );
}