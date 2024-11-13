import { Input } from "@/components/ui/input";
import { PersonIcon } from "@radix-ui/react-icons";

export default function EmailInputField({onChange} : {onChange : (newValue : string)=>void}) {
  return (
    <>
      <div className="flex items-center m-3">
        <PersonIcon className="m-2"/>
        <Input onChange = {evt => onChange(evt.target.value)} type="text" className="border w-full" placeholder="Your email address" />
      </div>
    </>
  )
}