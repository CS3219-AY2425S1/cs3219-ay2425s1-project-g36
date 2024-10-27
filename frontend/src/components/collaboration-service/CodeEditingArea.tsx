import AceEditor from "react-ace";
import { Button } from "../ui/button";
import LanguageSelectionButton from "./LanguageSelectionButton";
import { ProgrammingLanguage, ProgrammingLanguages } from "./ProgrammingLanguages";
import { useState } from "react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { AceEditorTheme, AceEditorThemes } from "./AceEditorThemes";

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

type EditorSettings = {
  fontSize : number,
  theme: AceEditorTheme,
  warp: boolean,
}

const DEFAULT_EDITOR_SETTINGS : EditorSettings = {
  fontSize: 20,
  theme: AceEditorThemes[0],
  warp: false,
}

export default function CodeEditingArea() {
  const [displayLanguageSelectionPanel, setDisplayLanguageSelectionPanel] = useState(false);
  const [displayEditorSettingsPanel, setDisplayEditorSettingsPanel] = useState(false);
  const [currentlySelectedLanguage, setCurrentSelectedLanguage] = useState<ProgrammingLanguage>(ProgrammingLanguages[0]);
  const [rawCode, setRawCode] = useState("");
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(DEFAULT_EDITOR_SETTINGS);
  const [editorSettingValueBuffer, setEditorSettingValueBuffer] = useState<{[key:string] : string}>({}); // The buffer for holding the settings value that user just input into the settings panel. The values in this buffer are unparsed, so it may include invalid values. Only valid values will be assigned into the actual editor settings.

  const languageSelectionPanel = () => {
    return (
        <>
        <div className="flex shadow-md p-3 absolute top-0 left-full rounded-lg bg-white bg-opacity-80 z-10 ml-2 max-h-56 overflow-y-auto">
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
    console.log(valueName + "  " + value)
    setEditorSettingValueBuffer(()=>{
        const newBuffer = {...editorSettingValueBuffer};
        newBuffer[valueName] = value;
        return newBuffer;
    });
  }

  return (
    <>
      <div className="flex flex-row justify-between">
        <div className="relative flex flex-row items-center">
          <Button
            className="btngreen"
            onClick={()=>setDisplayLanguageSelectionPanel(!displayLanguageSelectionPanel)}
          >
            Select Language &gt;
          </Button>
          {displayLanguageSelectionPanel ? languageSelectionPanel() : <p className="ml-5">{currentlySelectedLanguage.name}</p>}
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
                      newFontSize = DEFAULT_EDITOR_SETTINGS.fontSize;
                    }
                    setEditorSettings({...editorSettings, fontSize: newFontSize});}
                  }
                  value={editorSettingValueBuffer["fontSize"] !== undefined ? editorSettingValueBuffer["fontSize"] : DEFAULT_EDITOR_SETTINGS.fontSize}
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
                <p>Warp:&nbsp;</p><Checkbox onCheckedChange={checked=>{setEditorSettings({...editorSettings, warp: checked as boolean});}} checked={editorSettings.warp}/>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 md-3"/>
      <AceEditor
        onChange={code=>setRawCode(code)}
        value={rawCode}
        mode={currentlySelectedLanguage.aceEditorModeName}
        onFocus={()=>{setDisplayLanguageSelectionPanel(false);setDisplayEditorSettingsPanel(false)}}
        width="100%"
        fontSize={editorSettings.fontSize}
        wrapEnabled={editorSettings.warp}
        theme={editorSettings.theme.internalName}
      />
    </>
  )
}