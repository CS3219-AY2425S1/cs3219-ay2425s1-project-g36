type ProgrammingLanguage = {
    name: string,
    aceEditorModeName: string,
}

const ProgrammingLanguages : ProgrammingLanguage[] = [
    {
        name: "C",
        aceEditorModeName: "c_cpp"
    },
    {
        name: "C++",
        aceEditorModeName: "c_cpp"
    },
    {
        name: "C#",
        aceEditorModeName: "csharp"
    },
    {
        name: "Golang",
        aceEditorModeName: "golang"
    },
    {
        name: "Java",
        aceEditorModeName: "java"
    },
    {
        name: "JavaScript",
        aceEditorModeName: "javascript"
    },
    {
        name: "Lua",
        aceEditorModeName: "lua"
    },
    {
        name: "Python",
        aceEditorModeName: "python"
    },
    {
        name: "TypeScript",
        aceEditorModeName: "typescript"
    },
].sort((first, second) => first.name.localeCompare(second.name));

export { ProgrammingLanguages };
export type { ProgrammingLanguage };
