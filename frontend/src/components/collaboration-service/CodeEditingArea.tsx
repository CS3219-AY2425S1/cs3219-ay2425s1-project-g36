import AceEditor from "react-ace";
import { Button } from "../ui/button";
import LanguageSelectionButton from "./LanguageSelectionButton";
import { ProgrammingLanguage, ProgrammingLanguages } from "./ProgrammingLanguages";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { AceEditorThemes } from "./AceEditorThemes";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { DEFAULT_CODE_EDITOR_SETTINGS } from "./CodeEditorSettings";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateUserProgLang } from "@/api/collaboration-service/CollaborationService";
import { useAuth } from "@/contexts/AuthContext";

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
import "ace-builds/src-noconflict/theme-cloud9_night"
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/theme-terminal";

const SAVE_INTERVAL_MS = 1000;

export default function CodeEditingArea({ roomId }: { roomId: string }) {
  const { codeEditingAreaState, socketState, matchedUserState } = useCollaborationContext();

  const {
    displayLanguageSelectionPanel, setDisplayLanguageSelectionPanel,
    displayEditorSettingsPanel, setDisplayEditorSettingsPanel,
    currentlySelectedLanguage, setCurrentSelectedLanguage,
    rawCode, setRawCode,
    editorSettings, setEditorSettings,
    editorSettingValueBuffer, setEditorSettingValueBuffer,
    runCodeResult, setRunCodeResult,
    isCodeRunning, setIsCodeRunning,
    userRanCode, setUserRanCode
  } = codeEditingAreaState;

  const { socket } = socketState;
  const { matchedUser } = matchedUserState 
  
  const isLanguageChangeFromServer = useRef(false);
  const prevLanguageRef = useRef(currentlySelectedLanguage);

  const { toast } = useToast();
  const { auth } = useAuth()

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

  const hasGetDocumentEmitted = useRef(false);

  // upon entering the collaboration page, socket retrieves the document from db (if exists)
  // or creates a new one. Then, load the raw code to the code editor.
  useEffect(() => {
    if (rawCode !== "") return; // To make sure that the code in the editor doesn't lost when the user switches view in the collaboration frontend
    if (socket === null || !socket.connected) return;
    socket.on('load-document', rawCode => {
      console.log("code: " + (rawCode===undefined ? "undefined" : rawCode));
      setRawCode(rawCode);
    })  
    
    // Emit only if hasn't been emitted already
    if (!hasGetDocumentEmitted.current) {
      console.log("invoked");
      socket.emit('get-document', roomId);
      hasGetDocumentEmitted.current = true;
    }
  
    // Cleanup function to avoid memory leaks
    return () => {
      socket.off('load-document');
    };
  }, [socket, roomId])

  // saves changes to db every 2 seconds
  useEffect(() => {
    if (socket === null) return;

    const handler = setTimeout(() => {
      socket.emit('save-document', rawCode)
    }, SAVE_INTERVAL_MS)

    return () => {
      clearTimeout(handler)
    }
  }, [rawCode])

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

  // whenever client clicks 'run code' and runCodeResult changes, send the result to server
  useEffect(() => {
    if (socket === null) return
    
    socket.emit('run-code', runCodeResult)
    
  }, [runCodeResult])
  
  // whenever socket receives the updated code execution result, update runCodeResult
  useEffect(() => {
    if (socket === null) return
    const handler = (runCodeResult: string) => {
      setRunCodeResult(runCodeResult)
    }

    socket.on('run-code-result', handler)
    return () => {
      socket.off('run-code-result', handler)
    }

  }, [socket])
  
  // send 'isCodeRunning' to server
  useEffect(() => {
    if (socket === null) return
    
    socket.emit('update-isCodeRunning', isCodeRunning)
    
  }, [isCodeRunning])
  
  // receive 'isCodeRunning' from server, update state
  useEffect(() => {
    if (socket === null) return
    const handler = (isCodeRunning: boolean) => {
      setIsCodeRunning(isCodeRunning)
    }

    socket.on('update-isCodeRunning', handler)
    return () => {
      socket.off('update-isCodeRunning', handler)
    }

  }, [socket])

  // send 'userRanCode' to server
  useEffect(() => {
    if (socket === null) return
    
    socket.emit('update-userRanCode', userRanCode)
    
  }, [userRanCode])
  
  // receive 'userRanCode' from server, update state
  useEffect(() => {
    if (socket === null) return
    const handler = (userRanCode: boolean) => {
      setUserRanCode(userRanCode)
    }

    socket.on('update-userRanCode', handler)
    return () => {
      socket.off('update-userRanCode', handler)
    }

  }, [socket])

  // whenever user changes language, send the new language to the server
  useEffect(() => {
    const handleLanguageChange = async () => {
      if (socket === null || isLanguageChangeFromServer.current) {
        // Prevent infinite loop between 'change-prog-language' and 'update-prog-language' events
        isLanguageChangeFromServer.current = false;
        return;
      }
  
      try {
        // update collabStore to reflect the new progLang for both users
        await updateUserProgLang(auth.id, currentlySelectedLanguage.name);
        if (matchedUser) {
          await updateUserProgLang(matchedUser._id, currentlySelectedLanguage.name);
        }
        socket.emit('change-prog-language', currentlySelectedLanguage);
      } catch (error) {
        console.error("Failed to update user programming language:", error);
      }
    };
  
    // Only call handleLanguageChange if the language has genuinely changed
    if (prevLanguageRef.current !== currentlySelectedLanguage) {
      handleLanguageChange();
      prevLanguageRef.current = currentlySelectedLanguage;
    }

  }, [currentlySelectedLanguage]);
  
  // whenever socket receives the updated programming language, update currentlySelectedLanguage
  useEffect(() => {
    if (socket === null) return
    const handler = (updatedLanguage: ProgrammingLanguage) => {
      isLanguageChangeFromServer.current = true
      setCurrentSelectedLanguage(updatedLanguage)

      toast({
        description: `${matchedUser?.username} has changed the prog language to ${updatedLanguage.name}`,
        duration: 2500,
        className: "bg-gray-800 text-white",
      });
    }

    socket.on('update-prog-language', handler)
    return () => {
      socket.off('update-prog-language', handler)
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
          height="600px"
          fontSize={editorSettings.fontSize}
          wrapEnabled={editorSettings.wrap}
          theme={editorSettings.theme.internalName}
        />
      </div>
    </>
  )
}