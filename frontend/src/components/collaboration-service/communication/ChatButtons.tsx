import { Button } from "@/components/ui/button";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { BotIcon } from "lucide-react";

/**
 * Renders the two chat buttons for user-to-user communication and user-to-bot communication,
 * with the following props:
 * 
 * - `hasUnreadMessages`: Whether the user-to-user chat has unread messages or not.
 * - `isShown`: Whether the chat button interface should be shown.
 * - `onChatClick`: Handler when the user-to-user chat button is clicked.
 * - `onBotChatClick`: Handler when the user-to-bot chat button is clicked.
 */
export default function ChatButtons({ hasUnreadMessages, isShown, onChatClick, onBotChatClick } : {
    hasUnreadMessages : boolean,
    isShown : boolean,
    onChatClick : () => void,
    onBotChatClick : () => void
}) {
    return isShown ? ( 
            <div className="absolute bottom-10 left-10 h-14 pointer-events-auto flex gap-3">
            <Button className="relative bg-blue-400 hover:bg-blue-300 w-14 h-full rounded-full" onClick={ onChatClick }>
                <ChatBubbleIcon className="w-3/4 h-3/4 text-white" />
                {hasUnreadMessages && (<div className="absolute top-[5%] right-[5%] w-1/4 h-1/4 rounded-full bg-red-500 border-2 border-white" />)}
            </Button>
            <Button className="relative bg-blue-400 hover:bg-blue-300 w-14 h-full rounded-full" onClick={ onBotChatClick }>
                <BotIcon className="w-3/4 h-3/4 text-white" />
            </Button>
            </div> 
        ) : <></>;
}