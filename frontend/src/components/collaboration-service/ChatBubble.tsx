import { PersonIcon } from "@radix-ui/react-icons";

/**
 * The component for a single chat bubble
 * @param text The chat message content
 * @param isSelf Determine whether the chat message is sent by the current (local) user who is using the frontend or not.
 */
export default function ChatBubble({text, userName, isSelf} : {text: string, userName: string, isSelf: boolean}) {
  return(
    <>
      <div className={`flex flex-row items-start w-full justify-${isSelf ? "end" : "start"} ${isSelf ? "flex-row-reverse" : ""}`}>
        <div className="rounded-full bg-white m-2">
            <PersonIcon className="m-2"/>
        </div>
        <div className={`mt-3 flex flex-col items-${isSelf ? "end" : "start"}`}>
          <div className="text-right">{userName}</div>
          <div className={`rounded-lg max-w-full p-2 text-lg overflow-hidden bg-${isSelf ? "green-200" : "white"} break-words text-${isSelf ? "right" : "left"}`}>
            {text}
          </div>
        </div>
      </div>
    </>
  );
}