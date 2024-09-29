import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Difficulty, { TDifficulty } from "../Difficulty"

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
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            {
              values.map(v => <SelectItem value={v} key={v} className="hover:cursor-pointer"><Difficulty type={v} /></SelectItem>)
            }
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}