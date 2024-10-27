import { ProgrammingLanguage } from "./ProgrammingLanguages";

export default function LanguageSelectionButton({language, isCurrentlySelected, onClick} : {language: ProgrammingLanguage, isCurrentlySelected: boolean, onClick: (language: ProgrammingLanguage)=>void}) {
    return (
      <>
        <div className={"shadow-sm flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-100 pl-1 pr-1 mt-1 md-1" + (isCurrentlySelected ? " bg-green-200" : "")} onClick={() => onClick(language)}>
          <p>{language.name}</p>
        </div>
      </>
    )
  }