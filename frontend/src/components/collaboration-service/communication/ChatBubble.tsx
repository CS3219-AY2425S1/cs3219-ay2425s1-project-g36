import CustomMarkdown from "@/components/common/CustomMarkdown";
import { PersonIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * The component for a single chat bubble
 * @param text The chat message content
 * @param userName The username to be displayed for the chat bubble.
 * @param isSelf Determine whether the chat message is sent by the current (local) user who is using the frontend or not.
 * @param isBot Whether the chat message is between the matched users (false) or between user and bot (true).
 * @param onShare The handler when the user clicks on the Share button.
 */
export default function ChatBubble({text, userName, isSelf, isBot, onShare} : {text: string, userName: string, isSelf: boolean, isBot : boolean, onShare : () => void}) {

  const [showShare, setShowShare] = useState(false);  

  return(
    <>
      <div onMouseOver={ () => setShowShare(true) } onMouseOut={() => setShowShare(false)} className={`flex flex-row items-start w-full justify-${isSelf ? "end" : "start"} ${isSelf ? "flex-row-reverse" : ""}`}>
        <div className="rounded-full bg-white m-2">
            <PersonIcon className="m-2"/>
        </div>
        <div className={`mt-3 flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
          <div className={`text-right text-sm flex flex-row ${isSelf ? "flex-row-reverse" : ""} gap-1`}>
            <span>{userName}</span>
            { showShare ? <Link to="#" onClick={ onShare }>Share to { isBot ? "other user" : "PeerPrepBot" }</Link> : <></> }
          </div>
          <div className={`rounded-lg max-w-full p-2 text-sm overflow-hidden bg-${isSelf ? "green-200" : "white"} break-words text-left`}>
            <CustomMarkdown>
              {text}
            </CustomMarkdown>
          </div>
        </div>
      </div>
    </>
  );
}