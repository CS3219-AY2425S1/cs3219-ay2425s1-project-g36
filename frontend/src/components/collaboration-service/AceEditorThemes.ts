type AceEditorTheme = {
  displayName: string,
  internalName: string,
};

const AceEditorThemes : AceEditorTheme[] = [
    {
        displayName: "Cloud9 Night",
        internalName: "cloud9_night",
    },
    {
        displayName: "GitHub",
        internalName: "github",
    },
    {
        displayName: "GitHub Dark",
        internalName: "github_dark",
    },
    {
        displayName: "Terminal",
        internalName: "terminal",
    },
    {
        displayName: "Twilight",
        internalName: "twilight",
    },
];

export { AceEditorThemes };
export type { AceEditorTheme };
