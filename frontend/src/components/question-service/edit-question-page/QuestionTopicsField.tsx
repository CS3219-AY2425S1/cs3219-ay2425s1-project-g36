import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react"

export default function QuestionTopicsField({ value, setValue } : {
  value : string[],
  setValue : ( newValue : string[] ) => void
}) {

  const { toast } = useToast();

  const removeTopic = (removed : string) => {
    setValue(value.filter(
      topic => topic !== removed
    ));
  }

  const addTopic = () => {
    const newTopic = prompt("Enter a topic here...");
    if (newTopic !== null && newTopic !== "" && !value.includes(newTopic)) {
      setValue([ ...value, newTopic ]);
    } else if (newTopic === "") {
      toast({
        description: "Topic not added as content is empty."
      })
    } else if (newTopic !== null && value.includes(newTopic)) {
      toast({
        description: "Topic not added as topic already exists."
      })
    }
    // if new topic is null or topic is already present, don't add a new topic
  }

  return (
    <div>
      <span id="topics-label">Topics</span>
      <div className="flex gap-2">
        <div className="flex items-center flex-wrap w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
          { (value.length > 0) ? 
          value.map( topic => (
            <Badge className="mr-2 mb-0.5 mt-0.5 flex flex-row gap-1" key={ topic }>
              <span>{ topic }</span>
              <Button variant="ghost" className="p-0 m-0 h-0" onClick={ () => removeTopic(topic) }>
                <X className="size-3.5" />
              </Button>
            </Badge>
          )) : (
            <span className="flex mb-0.5 mt-0.5">No topics yet...</span>
          )}
        </div>
        <Button onClick={ addTopic }>
          <Plus className="size-3.5" />
        </Button>
      </div>

    </div>
  )
}