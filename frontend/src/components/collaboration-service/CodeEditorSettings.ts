import { AceEditorTheme, AceEditorThemes } from "./AceEditorThemes"

type CodeEditorSettings = {
    fontSize : number,
    theme: AceEditorTheme,
    warp: boolean,
  }
  
const DEFAULT_CODE_EDITOR_SETTINGS : CodeEditorSettings = {
  fontSize: 20,
  theme: AceEditorThemes[0],
  warp: false,
}

export {type CodeEditorSettings, DEFAULT_CODE_EDITOR_SETTINGS};