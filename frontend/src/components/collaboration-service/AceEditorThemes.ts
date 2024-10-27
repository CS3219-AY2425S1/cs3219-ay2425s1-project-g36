type AceEditorTheme = {
  displayName: string,
  internalName: string,
};

const AceEditorThemes : AceEditorTheme[] = [
    {
        displayName: "GitHub",
        internalName: "github",
    },
    {
        displayName: "GitHub Dark",
        internalName: "github_dark",
    },
    {
        displayName: "Twilight",
        internalName: "twilight",
    },
    {
        displayName: "Terminal",
        internalName: "terminal",
    }
];

export { AceEditorThemes };
export type { AceEditorTheme };
