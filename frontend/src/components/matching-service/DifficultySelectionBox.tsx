import { useState } from "react";
import Difficulty, { TDifficulty } from "../question-service/Difficulty";
import { Checkbox } from "../ui/checkbox";

export type SelectedDifficultyData = {[difficulty in TDifficulty] : boolean};
export const DEFAULT_SELECTED_DIFFICULTY_DATA = {easy: false, medium: false, hard: false};

export default function DifficultySelectionBox({onChange} : {onChange : (newValue : SelectedDifficultyData) => void}) {
  
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const [selectedDifficultyData, setSelectedDifficultyData] = useState<SelectedDifficultyData>(DEFAULT_SELECTED_DIFFICULTY_DATA);
  const availableDifficulties : TDifficulty[] = ["easy", "medium", "hard"];

  const setDifficultySelected = (difficulty : TDifficulty, isSelected : boolean) => {
    const newData = {...selectedDifficultyData, [difficulty] : isSelected}
    setSelectedDifficultyData(newData);
    onChange(newData);
  }

  const isDifficultySelected = (difficulty : TDifficulty) => selectedDifficultyData[difficulty];

  const inverseDifficultySelection = (difficulty : TDifficulty) => {
    setDifficultySelected(difficulty, !isDifficultySelected(difficulty))
  }

  return(
    <>
      <div className="flex flex-col min-w-[115px]" onMouseEnter={() => setDisplayDropdown(true)} onMouseLeave={() => setDisplayDropdown(false)}>
        <div>Difficulties</div>
        <div
          className="flex flex-row space-x-1 p-1 h-9 w-full rounded-md border border-input"
        >
          {availableDifficulties.map(difficulty => isDifficultySelected(difficulty) && (<Difficulty key={difficulty} type={difficulty as TDifficulty}/>))}
        </div>
        {displayDropdown && (
          <div className="flex flex-col space-y-1 p-2 bg-black rounded-md bg-opacity-10">
            {
              availableDifficulties.map(difficulty=>
                <div key={difficulty} className="flex flex-row space-x-1 items-center" onClick={()=>inverseDifficultySelection(difficulty)}>
                  {isDifficultySelected(difficulty)  && (<Checkbox checked={true} onClick={()=>inverseDifficultySelection(difficulty)}/>)}
                  <Difficulty type={difficulty}/>
                </div>
              )
            }
          </div>
        )}
      </div>
    </>
  )
}