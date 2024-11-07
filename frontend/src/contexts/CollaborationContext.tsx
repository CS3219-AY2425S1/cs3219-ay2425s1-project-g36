import { Question } from "@/api/question-service/Question";
import { DEFAULT_CODE_EDITOR_SETTINGS, CodeEditorSettings } from "@/components/collaboration-service/CodeEditorSettings";
import { ProgrammingLanguage, ProgrammingLanguages } from "@/components/collaboration-service/ProgrammingLanguages";
import { PLACEHOLDER_LOADING_QUESTION } from "@/components/collaboration-service/QuestionArea";
import { User } from "@/api/user-service/User";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

type CodeEditingAreaStateType = {
  displayLanguageSelectionPanel: boolean,
  setDisplayLanguageSelectionPanel: React.Dispatch<React.SetStateAction<boolean>>,
  displayEditorSettingsPanel: boolean,
  setDisplayEditorSettingsPanel: React.Dispatch<React.SetStateAction<boolean>>,
  currentlySelectedLanguage: ProgrammingLanguage,
  setCurrentSelectedLanguage: React.Dispatch<React.SetStateAction<ProgrammingLanguage>>,
  rawCode: string,
  setRawCode: React.Dispatch<React.SetStateAction<string>>,
  editorSettings: CodeEditorSettings,
  setEditorSettings: React.Dispatch<React.SetStateAction<CodeEditorSettings>>,
  editorSettingValueBuffer: {[key : string] : string},
  setEditorSettingValueBuffer: React.Dispatch<React.SetStateAction<{[key : string] : string}>>
  runCodeResult: string,
  setRunCodeResult: React.Dispatch<React.SetStateAction<string>>
  isCodeRunning: boolean,
  setIsCodeRunning: React.Dispatch<React.SetStateAction<boolean>>,
}

type QuestionAreaStateType = {
  question: Question,
  setQuestion: React.Dispatch<React.SetStateAction<Question>>,
}

type SocketStateType = {
  socket: Socket | null
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>,
}

type MatchedUserType = {
  matchedUser: User | null
  setMatchedUser: React.Dispatch<React.SetStateAction<User | null>>,
}

type CollaborationContextType = {
  codeEditingAreaState: CodeEditingAreaStateType,
  questionAreaState: QuestionAreaStateType,
  socketState: SocketStateType,
  matchedUserState: MatchedUserType
}



const CollaborationContext = createContext<CollaborationContextType | null>(null);

const CollaborationContextProvider = ({children} : {children: ReactNode}) => {
  const [displayLanguageSelectionPanel, setDisplayLanguageSelectionPanel] = useState(false);
  const [displayEditorSettingsPanel, setDisplayEditorSettingsPanel] = useState(false);
  const [currentlySelectedLanguage, setCurrentSelectedLanguage] = useState<ProgrammingLanguage>(ProgrammingLanguages[0]);
  const [rawCode, setRawCode] = useState<string>("");
  const [runCodeResult, setRunCodeResult] = useState<string>("No code has been executed yet");
  const [isCodeRunning, setIsCodeRunning] = useState(false)
  const [editorSettings, setEditorSettings] = useState<CodeEditorSettings>(DEFAULT_CODE_EDITOR_SETTINGS);
  const [editorSettingValueBuffer, setEditorSettingValueBuffer] = useState<{[key:string] : string}>({}); // The buffer for holding the settings value that user just input into the settings panel. The values in this buffer are unparsed, so it may include invalid values. Only valid values will be assigned into the actual editor settings.
  
  const codeEditingAreaState: CodeEditingAreaStateType =
  {
    displayLanguageSelectionPanel, setDisplayLanguageSelectionPanel,
    displayEditorSettingsPanel, setDisplayEditorSettingsPanel,
    currentlySelectedLanguage, setCurrentSelectedLanguage,
    rawCode, setRawCode,
    editorSettings, setEditorSettings,
    editorSettingValueBuffer, setEditorSettingValueBuffer,
    runCodeResult, setRunCodeResult,
    isCodeRunning, setIsCodeRunning
  }

  const [question, setQuestion] = useState<Question>(PLACEHOLDER_LOADING_QUESTION);
  const questionAreaState: QuestionAreaStateType = {
    question, setQuestion
  }

  const [socket, setSocket] = useState<Socket | null>(null);
  const socketState: SocketStateType = {
    socket, setSocket
  }

  const [matchedUser, setMatchedUser] = useState<User | null>(null)
  const matchedUserState: MatchedUserType = {
    matchedUser, setMatchedUser
  }

  // connects to socket upon creating the context
  useEffect(() => {
    if(socket !== null) return;
    const s = io("http://localhost:3001")
    setSocket(s)
    return () => {
      s.disconnect()
    }
  }, [])

  return (
      <CollaborationContext.Provider value={{codeEditingAreaState, questionAreaState, socketState, matchedUserState}}>
        {children}
      </CollaborationContext.Provider>
    );
}

function useCollaborationContext() {
  const context = useContext(CollaborationContext);
  if(!context) {
    throw new Error("useCollaborationContext must be used within a CollaborationContextProvider");
  }
  return context;
}

export { CollaborationContextProvider, useCollaborationContext };