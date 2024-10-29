import { Question } from "@/api/question-service/Question";
import { DEFAULT_CODE_EDITOR_SETTINGS, CodeEditorSettings } from "@/components/collaboration-service/CodeEditorSettings";
import { ProgrammingLanguage, ProgrammingLanguages } from "@/components/collaboration-service/ProgrammingLanguages";
import { PLACEHOLDER_LOADING_QUESTION } from "@/components/collaboration-service/QuestionArea";
import { createContext, ReactNode, useContext, useState } from "react";

type CodeEditingAreaStateType = {
  displayLanguageSelectionPanel : boolean,
  setDisplayLanguageSelectionPanel : React.Dispatch<React.SetStateAction<boolean>>,
  displayEditorSettingsPanel : boolean,
  setDisplayEditorSettingsPanel : React.Dispatch<React.SetStateAction<boolean>>,
  currentlySelectedLanguage : ProgrammingLanguage,
  setCurrentSelectedLanguage : React.Dispatch<React.SetStateAction<ProgrammingLanguage>>,
  rawCode : string,
  setRawCode : React.Dispatch<React.SetStateAction<string>>,
  editorSettings : CodeEditorSettings,
  setEditorSettings : React.Dispatch<React.SetStateAction<CodeEditorSettings>>,
  editorSettingValueBuffer : {[key : string] : string},
  setEditorSettingValueBuffer : React.Dispatch<React.SetStateAction<{[key : string] : string}>>
}

type QuestionAreaStateType = {
  question : Question,
  setQuestion : React.Dispatch<React.SetStateAction<Question>>,
}

type CollaborationContextType = {
  codeEditingAreaState : CodeEditingAreaStateType,
  questionAreaState : QuestionAreaStateType
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

const CollaborationContextProvider = ({children} : {children : ReactNode}) => {
  const [displayLanguageSelectionPanel, setDisplayLanguageSelectionPanel] = useState(false);
  const [displayEditorSettingsPanel, setDisplayEditorSettingsPanel] = useState(false);
  const [currentlySelectedLanguage, setCurrentSelectedLanguage] = useState<ProgrammingLanguage>(ProgrammingLanguages[0]);
  const [rawCode, setRawCode] = useState("");
  const [editorSettings, setEditorSettings] = useState<CodeEditorSettings>(DEFAULT_CODE_EDITOR_SETTINGS);
  const [editorSettingValueBuffer, setEditorSettingValueBuffer] = useState<{[key:string] : string}>({}); // The buffer for holding the settings value that user just input into the settings panel. The values in this buffer are unparsed, so it may include invalid values. Only valid values will be assigned into the actual editor settings.
  const codeEditingAreaState : CodeEditingAreaStateType =
  {
    displayLanguageSelectionPanel, setDisplayLanguageSelectionPanel,
    displayEditorSettingsPanel, setDisplayEditorSettingsPanel,
    currentlySelectedLanguage, setCurrentSelectedLanguage,
    rawCode, setRawCode,
    editorSettings, setEditorSettings,
    editorSettingValueBuffer, setEditorSettingValueBuffer
  }

  const [question, setQuestion] = useState<Question>(PLACEHOLDER_LOADING_QUESTION);

  const questionAreaState : QuestionAreaStateType = {
    question, setQuestion
  }

  return (
      <CollaborationContext.Provider value={{codeEditingAreaState, questionAreaState}}>
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