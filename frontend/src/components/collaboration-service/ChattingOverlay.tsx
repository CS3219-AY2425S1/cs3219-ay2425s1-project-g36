import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatBubbleIcon, Cross1Icon, ArrowDownIcon, TrashIcon } from "@radix-ui/react-icons";
import ChatBubble from "./ChatBubble";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useAuth } from "@/contexts/AuthContext";

type ChatMessage = {
  message: string,
  isSelf: boolean,
}

type ServerSideChatMessage = {
  userId: string,
  message: string,
}

/**
 * The chatting overlay component. This is a full-screen overlay on the top layer of the frontend contains the UI for chatting feature.
 * @param otherUserName The other user's name to chat to. It will be displayed in the title of the chatting panel.
 */
export default function ChattingOverlay({otherUserName} : {otherUserName : string}) {
  const [displayChattingPanel, setDisplayChattingPanel] = useState(true);
  const [messageInInputBox, setMessageInInputBox] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [displayGoToBottomButton, setDisplayGoToBottomButton] = useState(false);

  // Add a chat message to the frontend
  const addChatMessage = (newMessage: ChatMessage) => {
    const newChatMessages = chatMessages.concat(newMessage);
    setChatMessages(newChatMessages);
    if(!displayChattingPanel) {
      setHasUnreadMessages(true);
    }
  }

  const { auth } = useAuth();

  const { socketState } = useCollaborationContext();
  const { socket } = socketState;

  // Recevie chat messages from the backend
  useEffect(()=>{
    if (socket === null) {
      return;
    }
    socket.once("receive-chat-message", (chatMessage : ServerSideChatMessage) => {
      const isSelf = chatMessage.userId === auth.id;
      addChatMessage({message: chatMessage.message, isSelf: isSelf});
      window.setTimeout(calculateShouldDisplayGoToBottomButton, 10); // Use a very short delay to give time for the browser to automatically recalculate the container's dimensions
    })
  })

  // Send chat message in the input box
  const sendChatMessage = () => {
    if (socket === null) {
      return;
    }
    if (messageInInputBox === "") {
      return;
    }
    socket.emit("send-chat-message", {message: messageInInputBox, userId: auth.id});
    addChatMessage({message: messageInInputBox, isSelf: true});
    setMessageInInputBox("");
    window.setTimeout(chatMessageContainerScrollToButtom, 10); // Use a very short delay to give time for the browser to automatically recalculate the container's dimensions
  }

  // Render the chatting button that is used for opening the chatting panel
  const renderChattingButton = () => {
    return (
      <>
        <div className="absolute bottom-20 left-20 w-20 h-20 pointer-events-auto">
          <Button className="relative bg-blue-400 hover:bg-blue-300 w-full h-full rounded-full" onClick={() => {setDisplayChattingPanel(true); setHasUnreadMessages(false);}}>
            <ChatBubbleIcon className="w-3/4 h-3/4 text-white" />
            {hasUnreadMessages && (<div className="absolute top-[5%] right-[5%] w-1/4 h-1/4 rounded-full bg-red-500 border-2 border-white" />)}
          </Button>
        </div>
      </>
    );
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

  // Scroll the chat message container to the bottom (go to the latest message)
  // This will be called when the user clicks "go to bottom" button or the (local) user sends a new message.
  const chatMessageContainerScrollToButtom = () => {
    if (!messageContainerRef.current) {
      return;
    }
    messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight - messageContainerRef.current.clientHeight;
  }

  // Clears the chat messages at frontend (inside the chatting panel)
  const clearChatMessages = () => {
    if (window.confirm("Are you sure you want to clear all chat messages?")) {
      setChatMessages([]);
    }
  }

  // Render the chatting panel
  const renderChattingPanel = () => {
    return(
      <>
        <div className="absolute w-1/5 h-1/2 min-w-[300px] p-3 border rounded-lg bg-gray-200 pointer-events-auto" style={{left: "50px", bottom: "50px"}}>
          <div className="flex flex-row justify-between items-center w-[calc(100%+1.5rem)] bg-gray-500 -ml-3 -mr-3 -mt-3 rounded-lg">
            <Button className="bg-gray-300 hover:bg-red-200" onClick={() => clearChatMessages()} title="Clear chat messages"><TrashIcon/></Button>
            <p className="text-white">Chat with {otherUserName}</p>
            <Button className="bg-red-300 hover:bg-red-200" onClick={() => setDisplayChattingPanel(false)} title="Close panel"><Cross1Icon/></Button>
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
    );
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50">
        {displayChattingPanel ? renderChattingPanel() : renderChattingButton()}
      </div>
    </>
  );
}