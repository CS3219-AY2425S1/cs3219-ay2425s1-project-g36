/**
 * The enum type that represents the difficulty.
 */
export type TDifficulty = "easy" | "medium" | "hard";

/**
 * Component for formatting the difficulty colour.
 */
export default function Difficulty({ type } : { type: TDifficulty }) {
  const colors = {
    "easy": "bg-green-500",
    "medium": "bg-yellow-500",
    "hard": "bg-red-500"
  };

  return (
    <span className={ colors[type] + " px-2 py-1 rounded text-white" }>{ type[0].toUpperCase() + type.slice(1) }</span>
  )
}