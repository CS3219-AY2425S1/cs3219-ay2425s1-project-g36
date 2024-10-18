import { Input } from "../../ui/input";

export default function QuestionInputField({ name, placeholder, value, setValue } : {
  name : string,
  placeholder : string,
  value : string,
  setValue : ( newValue : string ) => void
}) {
  return (
    <div>
      <label htmlFor={ "input-" + name }>{ name }</label>
      <Input 
        type="text"
        placeholder={ placeholder }
        id={ "input-" + name } 
        value={ value }
        onChange={ (event) => setValue(event.target.value) }
      />
    </div>
  )
}