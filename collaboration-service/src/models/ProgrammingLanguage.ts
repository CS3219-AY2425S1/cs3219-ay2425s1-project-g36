/**
 * Type representing a programming language with properties required for integration with 
 * various systems like Ace Editor and JDoodle.
 */
type ProgrammingLanguage = {
    name: string,
    aceEditorModeName: string,
    JDoodleName: string,
}

export type { ProgrammingLanguage }