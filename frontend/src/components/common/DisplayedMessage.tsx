import { ComponentType } from "react";
import { CrossCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons"


enum DisplayedMessageTypes {
    Info,
    Warning,
    Error
}

type DisplayedMessage = {
    message : string,
    type : DisplayedMessageTypes
}

function DisplayedMessageComponent({message, color, icon : Icon}:{message : string, color : string, icon : ComponentType}) {
    return (
      <>
        <div className={"text-" + color + "-500 flex items-center justify-center"}>
          <Icon />
          <p className="p-1">{message}</p>
        </div>
        
      </>
    );

}

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