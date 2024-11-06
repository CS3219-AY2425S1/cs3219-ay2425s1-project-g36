import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Plus, X, Check } from "lucide-react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { ProgrammingLanguages } from "../collaboration-service/ProgrammingLanguages";
export default function ProgLangField({
  value,
  setValue,
}: {
  value: string[];
  setValue: (newValue: string[]) => void;
}) {
  const [progLang, setProglang] = useState<string[]>([]);

  useEffect(() => {
    setProglang(ProgrammingLanguages.map((lang) => lang.name));
  }, []);

  const removeLang = (removed: string) => {
    setValue(value.filter((lang) => lang !== removed));
  };

  const toggleLang = (newLang: string) => {
    if (!value.includes(newLang)) {
      setValue([...value, newLang]);
    } else {
      setValue(value.filter(lang => lang !== newLang));
    }
  };

  return (
    <div>
      <span id="topics-label">Programming Language</span>
      <div className="flex gap-2">
        <div className="flex items-center flex-wrap w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
          {value.length > 0 ? (
            value.map((lang) => (
              <Badge
                className="mr-2 mb-0.5 mt-0.5 flex flex-row gap-1"
                key={lang}
              >
                <span>{lang}</span>
                <Button
                  variant="ghost"
                  className="p-0 m-0 h-0"
                  onClick={() => removeLang(lang)}
                >
                  <X className="size-3.5" />
                </Button>
              </Badge>
            ))
          ) : (
            <span className="flex mb-0.5 mt-0.5">No language chosen yet...</span>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Plus className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[300px] my-1 border rounded-md border-solid border-gray-300 bg-white shadow-md"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Topics">
                  <div className="flex flex-wrap gap-1">
                    {progLang.map((lang) => (
                      <CommandItem
                        key={lang}
                        onSelect={() => toggleLang(lang)}
                        className="cursor-pointer rounded-md px-2 py-1 text-sm hover:bg-gray-100"
                      >
                        <span className={cn(
                          "border rounded-md px-1",
                          value.includes(lang) ? "bg-green-500" : "bg-gray-200"  
                        )}
                        >{lang}</span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            value.includes(lang) ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
