import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TDifficulty } from "../Difficulty"
import DifficultyEdit from "../DifficultyEdit";

export default function QuestionSelectField({ value, setValue } : {
  value : TDifficulty,
  setValue : ( newValue : TDifficulty ) => void
}) {
  const values : TDifficulty[] = ["easy", "medium", "hard"];

  return (
    <div>
      <span id="difficulty-label">Difficulty</span>
      <Select
        onValueChange={setValue}
        value={value}
        defaultValue="easy"
        aria-labelledby="difficulty-label"
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a difficulty" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            {
              values.map(v => <SelectItem value={v} key={v} className="hover:cursor-pointer"><DifficultyEdit type={v} /></SelectItem>)
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}