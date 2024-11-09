import { useEffect, useRef, useState } from "react";
import ChatButtons from "./ChatButtons";
import ChatPanel from "./ChatPanel";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useAuth } from "@/contexts/AuthContext";

export type ChatMessage = {
  message: string,
  isSelf: boolean,
}

export type ServerSideChatMessage = {
  userId: string,
  message: string,
}

export type MessageType = {
  sender: string;
  role: 'system' | 'user' | 'assistant';
  timestamp: Date;
  content: string;
}

/**
 * The chatting overlay component. This is a full-screen overlay on the top layer of the frontend contains the UI for chatting feature.
 * @param roomId The room ID the chatting overlay is located in.
 * @param otherUserName The other user's name to chat to. It will be displayed in the title of the chatting panel.
 * @param questionId The question ID to establish the question context for the AI chatbot.
 */
export default function ChattingOverlay({roomId, otherUserName, questionId} : {roomId: string, otherUserName : string, questionId: string | null}) {

  const { auth } = useAuth();
  const { socketState, matchedUserState } = useCollaborationContext();

  /** Display settings related to the chatting overlay between the two matched users */
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [displayChattingPanel, setDisplayChattingPanel] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  /** 
   * Display settings related to the chatting overlay between user and bot
   * 
   * There is no `hasUnreadMessagesBot` since the bot will almost always instantly reply
   * to any message from the user.
   */
  const [chatMessagesBot, setChatMessagesBot] = useState<ChatMessage[]>([]);
  const [displayChattingPanelBot, setDisplayChattingPanelBot] = useState(false);
  const {socket } = socketState;

  function toFrontendChatMessage(messages : MessageType[]) : ChatMessage[] {
    return messages.map(
      message => {
        return {
          message: message.content,
          isSelf: message.sender === auth.id
        }
      }
    );
  }

  const isMessagesEmitted = useRef(false);
  // upon loading the chat overlay, socket retrieves the chat log from db (if exists)
  // or creates a new one. Then, loads the chat log content.
  useEffect(() => {
    if (socket === null || !socket.connected) return;
    socket.on('load-messages-bot', (messages : MessageType[]) => {
      setChatMessagesBot(toFrontendChatMessage(messages));
    });

    socket.on('load-messages-user', (messages: MessageType[]) => {
      setChatMessages(toFrontendChatMessage(messages));
    });
    
    // Emit only if hasn't been emitted already
    if (!isMessagesEmitted.current) {
      console.log("invoked");
      socket.emit('get-messages', roomId, auth.id, matchedUserState.matchedUser?._id);
      isMessagesEmitted.current = true;
    }
  
    // Cleanup function to avoid memory leaks
    return () => {
      socket.off('load-messages-user');
      socket.off('load-messages-bot');
    };
  }, [socket, roomId])

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50">
        <ChatPanel 
          questionId={ questionId }
          chatMessages={ chatMessages }
          setChatMessages={ setChatMessages }
          otherUserName={ otherUserName } 
          isShown={ displayChattingPanel }
          onShare={ (newMessage : ChatMessage) => setChatMessagesBot([...chatMessagesBot, newMessage]) }
          onAddChatMessage={ () => {
            if(!displayChattingPanel) {
              setHasUnreadMessages(true);
            }
          } }
          onClose={ () => {
            // close panel
            setDisplayChattingPanel(false);

            // the messages have been displayed
            setHasUnreadMessages(false);
          }}
        />
        <ChatPanel 
          isBot
          questionId={ questionId }
          chatMessages={ chatMessagesBot }
          setChatMessages={ setChatMessagesBot }
          otherUserName="PeerPrepBot" 
          isShown={ displayChattingPanelBot }
          onShare={ (newMessage : ChatMessage) => setChatMessages([...chatMessages, newMessage]) }
          onAddChatMessage={ () => {} }
          onClose={ () => {
            // close panel
            setDisplayChattingPanelBot(false);
          }}
        />
        <ChatButtons
          hasUnreadMessages={ hasUnreadMessages }
          isShown={ !displayChattingPanel && !displayChattingPanelBot }
          onChatClick={ () => { setDisplayChattingPanel(true); setHasUnreadMessages(false); } }
          onBotChatClick={ () => { setDisplayChattingPanelBot(true); } }
        />
      </div>
    </>
  );
}