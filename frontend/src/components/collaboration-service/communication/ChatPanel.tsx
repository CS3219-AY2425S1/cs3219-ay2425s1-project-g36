import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ChatMessage, ServerSideChatMessage } from "./ChattingOverlay";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowDownIcon, Cross1Icon, TrashIcon } from "@radix-ui/react-icons";
import ChatBubble from "./ChatBubble";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";

/**
 * Creates a chat panel interface, with the following props:
 * 
 * - `chatMessages`: The chat messages within the chat panel.
 * - `setChatMessages`: The React update function for `chatMessages`.
 * - `otherUserName`: The username of the other user to be displayed within the chat panel.
 * - `isShown`: Whether the chat panel is visible or not.
 * - `onAddChatMessage`: The handler when a chat message is added within the frontend.
 * - `onClose`: The handler when closing a chat message.
 * - `isBot`: Whether the user is communicating with another user, or a bot.
 * 
 * @returns The chat panel interface.
 */
export default function ChatPanel({ chatMessages, setChatMessages, otherUserName, isShown, onAddChatMessage, onClose, isBot = false } : { 
  chatMessages : ChatMessage[],
  setChatMessages : React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  otherUserName : string, 
  isShown : boolean,
  onAddChatMessage : () => void, 
  onClose : () => void, 
  isBot? : boolean 
}) {
    const [displayGoToBottomButton, setDisplayGoToBottomButton] = useState(false);
    const [messageInInputBox, setMessageInInputBox] = useState("");
    const messageContainerRef = useRef<HTMLDivElement>(null);
    
    const { socketState, questionAreaState } = useCollaborationContext();
    const { socket } = socketState;

    const { auth } = useAuth();

    // Add a chat message to the frontend
    const addChatMessage = (newMessage: ChatMessage) => {
      const newChatMessages = chatMessages.concat(newMessage);
      setChatMessages(newChatMessages);
      onAddChatMessage();
    }

    // Scroll the chat message container to the bottom (go to the latest message)
    // This will be called when the user clicks "go to bottom" button or the (local) user sends a new message.
    const chatMessageContainerScrollToButtom = () => {
        if (!messageContainerRef.current) {
            return;
        }
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight - messageContainerRef.current.clientHeight;
    }

    // Send chat message in the input box
    const sendChatMessage = () => {

        // invalid socket or no message to send
        if (socket === null) return;
        if (messageInInputBox === "") return;
        
        if (!isBot) {
            socket.emit("send-chat-message", {message: messageInInputBox, userId: auth.id});
        } else {
            console.log("sent to bot");
            socket.emit("send-chat-message-bot", {questionId: questionAreaState.question.id, message: messageInInputBox, userId: auth.id});
        }
        
        addChatMessage({message: messageInInputBox, isSelf: true});
        setMessageInInputBox("");
        window.setTimeout(chatMessageContainerScrollToButtom, 10); // Use a very short delay to give time for the browser to automatically recalculate the container's dimensions
    }

    // Clears the chat messages at frontend (inside the chatting panel)
    const clearChatMessages = () => {
      if (window.confirm("Are you sure you want to clear all chat messages?")) {
        setChatMessages([]);
      }
    }

    // Calculate whether the frontend should display "go to bottom" button or not.
    // The frontend will display "go to bottom" button when the chat message container isn't scrolled to the bottom.
    const calculateShouldDisplayGoToBottomButton = () => {
      if (!messageContainerRef.current) {
        return;
      }
      const isAtBottomOfContainer = messageContainerRef.current.scrollTop + messageContainerRef.current.clientHeight < messageContainerRef.current.scrollHeight;
      setDisplayGoToBottomButton(isAtBottomOfContainer);
    }

    // Receive chat messages from the backend
    useEffect(()=>{
        if (socket === null) {
            return;
        }
        
        if (!isBot) {
          socket.once("receive-chat-message", (chatMessage : ServerSideChatMessage) => {
              const isSelf = chatMessage.userId === auth.id;
              addChatMessage({message: chatMessage.message, isSelf: isSelf});
              
              // Use a very short delay to give time for the browser to automatically recalculate the container's dimensions
              window.setTimeout(calculateShouldDisplayGoToBottomButton, 10); 
          })
        }
        
        if (isBot) {
            socket.once("receive-chat-message-bot", (chatMessage : string) => {
                addChatMessage({message: chatMessage, isSelf: false});
                
                // Use a very short delay to give time for the browser to automatically recalculate the container's dimensions
                window.setTimeout(calculateShouldDisplayGoToBottomButton, 10); 
            })
        }
    })
    
    return isShown ? (
        <>
          <div className="absolute w-1/5 h-1/2 min-w-[300px] p-3 border rounded-lg bg-gray-200 pointer-events-auto" style={{left: "50px", bottom: "50px"}}>
            <div className="flex flex-row justify-between items-center w-[calc(100%+1.5rem)] bg-gray-500 -ml-3 -mr-3 -mt-3 rounded-lg">
              <Button className="bg-gray-300 hover:bg-red-200" onClick={() => clearChatMessages()} title="Clear chat messages"><TrashIcon/></Button>
              <p className="text-white">Chat with {otherUserName}</p>
              <Button className="bg-red-300 hover:bg-red-200" onClick={ onClose } title="Close panel"><Cross1Icon/></Button>
            </div>
            <div ref={messageContainerRef} onScroll={() => calculateShouldDisplayGoToBottomButton()} className="w-full h-[calc(100%-5.5rem)] overflow-y-auto">
              <div className="flex flex-col">
                {chatMessages.map((chatMessage, index) => <ChatBubble key={`chat_bubble_${index}`} text={chatMessage.message} userName={chatMessage.isSelf ? auth.username : otherUserName} isSelf={chatMessage.isSelf}/>)}
              </div>
              {displayGoToBottomButton && 
                (
                  <div onClick={() => chatMessageContainerScrollToButtom()} className="sticky bottom-[0%] left-full m-2 bg-blue-500 opacity-50 w-16 h-16 rounded-full cursor-pointer flex justify-center items-center text-white">
                    <ArrowDownIcon className="w-1/2 h-1/2" />
                  </div>
                )
              }
            </div>
            
            <form onSubmit={e =>{e.preventDefault(); sendChatMessage()}} className="flex flex-row space-x-2 w-full h-12 mt-5 p-2">
              <Input className="bg-white" onChange={e => setMessageInInputBox(e.target.value)} value={messageInInputBox} placeholder="Enter your message here..."/>
              <Button className="btngreen" onClick={() => sendChatMessage()} title="Send message"><SendIcon/></Button>
            </form>
          </div>
        </>
    ) : <></>;
}