import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ChatMessage, ServerSideChatMessage } from "./ChattingOverlay";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowDownIcon, Cross1Icon, EnterFullScreenIcon, ExitFullScreenIcon, TrashIcon } from "@radix-ui/react-icons";
import ChatBubble from "./ChatBubble";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
 * - `questionId`: If `isBot` is true, provides the question ID to the backend, allowing
 *   the AI chatbot to provide question context.
 * 
 * @returns The chat panel interface.
 */
export default function ChatPanel({ chatMessages, setChatMessages, onShare, otherUserName, isShown, onAddChatMessage, onClose, questionId, isBot = false } : { 
  chatMessages : ChatMessage[],
  setChatMessages : React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  onShare : (newMessage: ChatMessage) => void,
  otherUserName : string, 
  isShown : boolean,
  onAddChatMessage : () => void, 
  onClose : () => void, 
  questionId : string | null
  isBot? : boolean,
}) {
    const [displayGoToBottomButton, setDisplayGoToBottomButton] = useState(false);
    const [messageInInputBox, setMessageInInputBox] = useState("");
    const [fullScreenMode, setFullScreenMode] = useState(false);

    const messageContainerRef = useRef<HTMLDivElement>(null);
    
    const { codeEditingAreaState, socketState } = useCollaborationContext();
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
        socket.emit("send-chat-message-user", {message: messageInInputBox, userId: auth.id});
      } else {
        const progLang = codeEditingAreaState.currentlySelectedLanguage.name;

        console.log("sent to bot question ID", questionId);
        socket.emit("send-chat-message-bot", questionId, progLang, {message: messageInInputBox, userId: auth.id});
      }
      
      addChatMessage({message: messageInInputBox, isSelf: true});
      setMessageInInputBox("");
      window.setTimeout(chatMessageContainerScrollToButtom, 10); // Use a very short delay to give time for the browser to automatically recalculate the container's dimensions
    }

    const shareChatMessage = (message : string) => {

      // invalid socket or no message to send
      if (socket === null) return;
      
      if (isBot) {
        socket.emit("send-chat-message-user", {message: message, userId: auth.id});
      
        onShare({ message: message, isSelf: true });
      } else {
        const progLang = codeEditingAreaState.currentlySelectedLanguage.name;

        console.log("sent to bot question ID", questionId);
        socket.emit("send-chat-message-bot", questionId, progLang, {message: message, userId: auth.id});
      
        onShare({ message: message, isSelf: true });
      }

      toast({
        description: "Successfully shared message"
      });
    }

    // Clears the chat messages at frontend (inside the chatting panel)
    const clearChatMessages = () => {

      const CLEAR_BOT_MSG = "Are you sure you want to clear all chat messages with the bot?";
      const CLEAR_USER_MSG = "Are you sure you want to clear all chat messages with your collaboration partner? Your partner will be notified.";

      if (window.confirm(isBot ? CLEAR_BOT_MSG : CLEAR_USER_MSG)) {
        // clear chat in frontend
        setChatMessages([]);
              
        // Use a very short delay to give time for the browser to automatically recalculate the container's dimensions
        window.setTimeout(calculateShouldDisplayGoToBottomButton, 10); 

        // clear chat in backend
        if (socket === null) return;
        if (isBot) {
          socket.emit("clear-chat-bot");
        } else {
          socket.emit("clear-chat-user");
        }
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
          socket.once("receive-chat-message-user", (chatMessage : ServerSideChatMessage) => {
              const isSelf = chatMessage.userId === auth.id;
              addChatMessage({message: chatMessage.message, isSelf: isSelf});
              
              // Use a very short delay to give time for the browser to automatically recalculate the container's dimensions
              window.setTimeout(calculateShouldDisplayGoToBottomButton, 10); 
          })

          // if received message from other user to clear chat, do so
          socket.once("received-clear-chat-user", () => {

            // clear chat in frontend
            setChatMessages([]);

            toast({
              description: "Your collaboration partner has requested to clear their chat log with you. Your chat log has been cleared."
            });
              
            // Use a very short delay to give time for the browser to automatically recalculate the container's dimensions
            window.setTimeout(calculateShouldDisplayGoToBottomButton, 10); 
          });
        } else {
            socket.once("receive-chat-message-bot", (chatMessage : string) => {
                addChatMessage({message: chatMessage, isSelf: false});
                
                // Use a very short delay to give time for the browser to automatically recalculate the container's dimensions
                window.setTimeout(calculateShouldDisplayGoToBottomButton, 10); 
            });
        }
    })

    return isShown ? (
        <>
          <div className={ "absolute min-w-[325px] left-[50px] bottom-[50px] p-3 border rounded-lg bg-gray-200 pointer-events-auto " + (fullScreenMode ? "w-[90%] h-[90%]" : "w-[325px] h-1/2") }>
            <div className={ "flex flex-row justify-between items-center w-[calc(100%+1.5rem)] bg-gray-500 -ml-3 -mr-3 -mt-3 rounded-lg" + (fullScreenMode ? " gap-2" : "") }>
              <Button className="bg-red-300 hover:bg-red-200" onClick={() => clearChatMessages()} title="Clear chat messages"><TrashIcon/></Button>
              <Button 
                className="bg-blue-300 hover:bg-blue-200" 
                onClick={() => setFullScreenMode(!fullScreenMode)}
                title={ (fullScreenMode ? "Exit" : "Enter") + " full screen mode" }
              >
                {fullScreenMode ? <ExitFullScreenIcon /> : <EnterFullScreenIcon/>}
              </Button>
              <p className="text-white flex-1 text-center">Chat with {otherUserName}</p>
              <Button className="bg-red-300 hover:bg-red-200" onClick={ onClose } title="Close panel"><Cross1Icon/></Button>
            </div>
            <div 
              ref={messageContainerRef}
              onScroll={() => calculateShouldDisplayGoToBottomButton()} 
              className="w-full h-[calc(100%-5.5rem)] overflow-y-auto overflow-x-hidden"
            >
              <div className="flex flex-col">
                {
                  chatMessages.map((chatMessage, index) => (
                    <ChatBubble key={`chat_bubble_${index}`} 
                      text={chatMessage.message}
                      userName={chatMessage.isSelf ? auth.username : otherUserName}
                      isSelf={chatMessage.isSelf}
                      isBot={ isBot }
                      onShare={ () => shareChatMessage(chatMessage.message) }
                    />
                  ))
                }
              </div>
              {displayGoToBottomButton && 
                (
                  <div onClick={() => chatMessageContainerScrollToButtom()} className="sticky bottom-[0%] left-[calc(100%-48px)] m-2 bg-blue-500 opacity-50 w-12 h-12 rounded-full cursor-pointer flex justify-center items-center text-white">
                    <ArrowDownIcon className="w-1/2 h-1/2" />
                  </div>
                )
              }
            </div>
            
            <form onSubmit={e =>{e.preventDefault(); sendChatMessage() }} className="flex flex-row space-x-2 w-full h-12 mt-5 p-2">
              <Input className="bg-white" onChange={e => setMessageInInputBox(e.target.value)} value={messageInInputBox} placeholder="Enter your message here..."/>
              <Button className="btngreen" type="submit" title="Send message"><SendIcon/></Button>
            </form>
          </div>
        </>
      ) : <></>;
}