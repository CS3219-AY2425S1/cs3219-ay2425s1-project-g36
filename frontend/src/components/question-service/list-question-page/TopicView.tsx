import { Badge } from "@/components/ui/badge";

/**
 * Converts the list of topics into a more readable and aesthetic badge format.
 * Requires the following props:
 * 
 * - `topics`: The topics to display in the List Question Table.
 * 
 * @return The content of the topics column, in a more human-readable format.
 */
export default function TopicView({ topics } : { topics : string[] }) {
  return (
    <>
      { topics.map( topic => (
        <Badge className="mr-2 mb-0.5 mt-0.5" key={ topic }>{ topic }</Badge>
      ))}
    </>
  );
}