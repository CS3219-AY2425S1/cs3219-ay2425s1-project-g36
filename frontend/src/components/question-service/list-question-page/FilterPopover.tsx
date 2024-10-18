import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterIcon } from "lucide-react";
import { TDifficulty } from "../Difficulty";
import DifficultyEdit from "../DifficultyEdit";

/**
 * Popover component that contains the filter button and 
 * when the filter button is clicked. Requires the following props:
 * 
 * - `dChecked`: The currently checked difficulties.
 * - `onDChecked`: The handler for when a specific difficulty is checked (or unchecked).
 * - `topics`: The full list of topics to be displayed.
 * - `tChecked`: The currently checked topics.
 * - `onTChecked`: The handler for when a specific topic is checked (or unchecked).
 * - `onResetFilters`: Event handler when the `Reset Filters` button is clicked.
 */
export default function FilterPopover({ dChecked, onDChecked, topics, tChecked, onTChecked, onResetFilters } : {
  dChecked : TDifficulty[],
  onDChecked : (c : TDifficulty[]) => void,
  topics : string[],
  tChecked : string[],
  onTChecked : (c : string[]) => void,
  onResetFilters : () => void
}) {

  const difficulties = ["easy", "medium", "hard"] as TDifficulty[];
  const inclNoTopics = [...topics, "No topic"];

  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <Button variant="ghost" className="p-0 flex items-center">
            <FilterIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-white">
          <h3 className="font-bold size-7">Filters</h3>
          <h4 className="font-semibold size-4 mb-3">Difficulty</h4>
          <div className="flex flex-wrap items-center gap-2.5">
            {
              difficulties.map((difficulty : TDifficulty) => (
                <div className="flex items-center gap-1">
                  <Checkbox
                    checked={dChecked.includes(difficulty)}
                    id={"difficulty-" + difficulty}
                    onCheckedChange={(checked) => {
                      return checked
                        ? onDChecked([...dChecked, difficulty])
                        : onDChecked(
                            dChecked.filter(
                              (value: TDifficulty) => value !== difficulty
                            )
                          )
                    }}
                  />
                  <label
                    htmlFor={"difficulty-" + difficulty}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <DifficultyEdit type={ difficulty } />
                  </label>
                </div>
              ))
            }
          </div>
          <h4 className="font-semibold size-4 mb-3 mt-4">Topics</h4>
          <div className="flex flex-wrap items-center gap-2.5">
            {
              inclNoTopics.map((topic : string) => (
                <div className="flex items-center gap-1">
                  <Checkbox
                    checked={tChecked.includes(topic)}
                    id={"topic-" + topic}
                    onCheckedChange={(checked) => {
                      return checked
                        ? onTChecked([...tChecked, topic])
                        : onTChecked(
                            tChecked.filter(
                              (value: string) => value !== topic
                            )
                          )
                    }}
                  />
                  <label
                    htmlFor={"topic-" + topic}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    { topic }
                  </label>
                </div>
              ))
            }
          </div>
          <Button className="mt-3 btnblack" onClick={ onResetFilters }>
            Reset filters
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}