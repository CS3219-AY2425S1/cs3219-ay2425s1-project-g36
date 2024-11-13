import { ComponentType } from "react";
import { CrossCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons"

/**
 * Represents the type of message displayed through the `DisplayedMessageContainer`.
 */
enum DisplayedMessageTypes {
    Info,
    Warning,
    Error
}

/**
 * Represents a message displayed through the `DisplayedMessageContainer`.
 */
type DisplayedMessage = {
    message : string | React.ReactNode,
    type : DisplayedMessageTypes
}

/**
 * Displays a message with a specified message, colour and icon.
 */
function DisplayedMessageComponent({message, color, icon : Icon}:{message : React.ReactNode, color : string, icon : ComponentType}) {
    return (
      <>
        <div className={"text-" + color + "-500 flex gap-2 items-center justify-center"}>
          <div className="min-w-4">
            <Icon />
          </div>
          <p className="p-1">{message}</p>
        </div>
        
      </>
    );

}

/**
 * Displays a `DisplayedMessage`.
 */
function DisplayedMessageContainer({displayedMessage} : {displayedMessage : DisplayedMessage | null}) {
    return (
        <>
          {displayedMessage !== null && (
          <>
          {
            displayedMessage.type===DisplayedMessageTypes.Error && (
            <>
              <DisplayedMessageComponent color="red" icon={CrossCircledIcon} message={displayedMessage.message}/>
            </>
            ) ||
            displayedMessage.type===DisplayedMessageTypes.Warning && (
            <>
              <DisplayedMessageComponent color="yellow" icon={ExclamationTriangleIcon} message={displayedMessage.message}/>
            </>
            ) ||
            displayedMessage.type===DisplayedMessageTypes.Info && (
            <>
              <DisplayedMessageComponent color="gray" icon={InfoCircledIcon} message={displayedMessage.message}/>
            </>
            )
          }
        </>
        )}
      </>
    )
}

export {DisplayedMessageTypes, type DisplayedMessage, DisplayedMessageContainer};