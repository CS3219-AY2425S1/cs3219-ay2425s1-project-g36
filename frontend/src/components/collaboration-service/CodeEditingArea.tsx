import AceEditor from "react-ace";
import { Button } from "../ui/button";
import LanguageSelectionButton from "./LanguageSelectionButton";
import { ProgrammingLanguages } from "./ProgrammingLanguages";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { AceEditorThemes } from "./AceEditorThemes";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { DEFAULT_CODE_EDITOR_SETTINGS } from "./CodeEditorSettings";
import { useEffect } from "react";

// Ace Editor Modes
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-lua";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-typescript";

// Ace Editor Themes
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/theme-terminal";

const SAVE_INTERVAL_MS = 2000;

export default function CodeEditingArea({ roomId }: { roomId: string }) {
  const { codeEditingAreaState, socketState } = useCollaborationContext();
  const {
    displayLanguageSelectionPanel, setDisplayLanguageSelectionPanel,
    displayEditorSettingsPanel, setDisplayEditorSettingsPanel,
    currentlySelectedLanguage, setCurrentSelectedLanguage,
    rawCode, setRawCode,
    editorSettings, setEditorSettings,
    editorSettingValueBuffer, setEditorSettingValueBuffer
  } = codeEditingAreaState;

  const { socket } = socketState;

  const languageSelectionPanel = () => {
    return (
        <>
        <div className="flex shadow-md p-3 absolute top-full left-0 rounded-lg bg-white bg-opacity-80 z-10 mt-2 max-h-56 overflow-y-auto">
          <div>
            {
              function () {
                  let currentInitialLetterGroup = "";
                  return ProgrammingLanguages.map(language => {
                      const initialLetter = language.name[0];
                      const returnValue = [];
                      if(initialLetter !== currentInitialLetterGroup) {
                        currentInitialLetterGroup = initialLetter;
                        returnValue.push(<p key={"initial_letter_" + initialLetter} className="text-lg font-bold mt-3">{initialLetter}</p>);
                      }
                      returnValue.push(
                        <div key={"language_" + returnValue.length}>
                          <LanguageSelectionButton
                            language={language}
                            onClick={language => {setCurrentSelectedLanguage(language); setDisplayLanguageSelectionPanel(false);}}
                            isCurrentlySelected={currentlySelectedLanguage === language}
                          />
                        </div>
                      );
                      return returnValue;
                  })
              }()
            }
            <div className="mt-10"/>
          </div>
        </div>
        </>
    )
  }

  const setSingleValueInEditorSettingValueBuffer = (valueName : string, value : string) => {
    setEditorSettingValueBuffer(()=>{
        const newBuffer = {...editorSettingValueBuffer};
        newBuffer[valueName] = value;
        return newBuffer;
    });
  }


  const editCode = (rawCode : string) => {
    setRawCode(rawCode);
    if(!socket) return;
    socket.emit('send-changes', rawCode);
  }

  // upon entering the collaboration page, socket retrieves the document from db (if exists)
  // or creates a new one. Then, load the raw code to the code editor.
  useEffect(() => {
    if (rawCode !== "") return; // To make sure that the code in the editor doesn't lost when the user switches view in the collaboration frontend
    const retryTimeout = 200; // Because the websocket requires time to connect, so here the frontend will retry again and again based on the timeout when the websocket is not connect, to make sure that the frontend will wait for the websocket to connect before getting code from backend.
    const getCodeFromBackend = () => {
      if (socket === null || !socket.connected) {
        window.setTimeout(getCodeFromBackend, retryTimeout);
        return;
      }
      socket.on('load-document', rawCode => {
        console.log("code: " + (rawCode===undefined ? "undefined" : rawCode));
        setRawCode(rawCode);
      })
      socket.emit('get-document', roomId)
    }
    window.setTimeout(getCodeFromBackend, retryTimeout);
  }, [socket, roomId])

    // saves changes to db every 2 seconds
  useEffect(() => {
    if (socket === null) return
    const interval = setInterval(() => {
      socket.emit('save-document', rawCode)
    }, SAVE_INTERVAL_MS)
    return () => {
      clearInterval(interval)
    }
  }, [socket])

  // whenever socket receives changes, update the code in the editor.
  useEffect(() => {
    if (socket === null) return
    const handler = (rawCode: string) => {
      setRawCode(rawCode);
    }

    socket.on('receive-changes', handler)
    return () => {
      socket.off('receive-changes', handler)
    }

  }, [socket])

  return (
    <>
      <div>
        <div className="flex flex-row justify-between">
          <div className="relative flex flex-row items-center">
            <Button
              className="btngreen"
              onClick={()=>setDisplayLanguageSelectionPanel(!displayLanguageSelectionPanel)}
            >
              Language: {currentlySelectedLanguage.name}
            </Button>
            {displayLanguageSelectionPanel && languageSelectionPanel()}
          </div>
          <div className="relative flex flex-row items-center">
            <Button
              className="btnwhite"
              onClick={()=>setDisplayEditorSettingsPanel(!displayEditorSettingsPanel)}
            >
              Editor Settings
            </Button>
            {displayEditorSettingsPanel && (
              <div className="flex flex-col shadow-md p-3 absolute top-0 right-full rounded-lg bg-white bg-opacity-80 z-10 mr-2 w-full">
                <div className="flex flex-col mt-1 mb-1">
                  <p>Font Size:&nbsp;</p><Input
                    onChange={e=>{
                      setSingleValueInEditorSettingValueBuffer("fontSize", e.target.value);
                      let newFontSize = Number.parseInt(e.target.value);
                      if(!Number.isInteger(newFontSize)){
                        newFontSize = DEFAULT_CODE_EDITOR_SETTINGS.fontSize;
                      }
                      setEditorSettings({...editorSettings, fontSize: newFontSize});}
                    }
                    value={editorSettingValueBuffer["fontSize"] !== undefined ? editorSettingValueBuffer["fontSize"] : DEFAULT_CODE_EDITOR_SETTINGS.fontSize}
                  />
                </div>
                <div className="flex flex-col mt-1 mb-1">
                  <p>Theme:&nbsp;</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button>{editorSettings.theme.displayName}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-300 w-full rounded-lg p-1">
                      {AceEditorThemes.map(theme => 
                        <>
                          <DropdownMenuItem className="cursor-pointer text-center" onClick={()=>setEditorSettings({...editorSettings, theme: theme})}>{theme.displayName}</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-row items-center mt-1 mb-1">
                  <p>Wrap:&nbsp;</p><Checkbox onCheckedChange={checked=>{setEditorSettings({...editorSettings, wrap: checked as boolean});}} checked={editorSettings.wrap}/>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 md-3"/>
        <AceEditor
          onChange={code=>editCode(code)}
          value={rawCode}
          mode={currentlySelectedLanguage.aceEditorModeName}
          onFocus={()=>{setDisplayLanguageSelectionPanel(false);setDisplayEditorSettingsPanel(false)}}
          width="100%"
          height="800px"
          fontSize={editorSettings.fontSize}
          wrapEnabled={editorSettings.wrap}
          theme={editorSettings.theme.internalName}
        />
      </div>
    </>
  )
}