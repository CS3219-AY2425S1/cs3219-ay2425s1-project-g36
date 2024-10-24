import { Textarea } from "../../ui/textarea";

export default function QuestionInputField({ name, placeholder, value, setValue } : {
  name : string,
  placeholder : string,
  value : string,
  setValue : ( newValue : string ) => void
}) {
  return (
    <div>
      <label htmlFor={ "input-" + name }>{ name }</label>
      <Textarea 
        id={ "input-" + name } 
        placeholder={ placeholder }
        className="h-[300px]"
        value={ value }
        onChange={ (event) => setValue(event.target.value) }
      />
    </div>
  )
}