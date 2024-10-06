import { Input } from "@/components/ui/input";
import { LockClosedIcon } from "@radix-ui/react-icons";

export default function PasswordInputField({onChange} : {onChange : (newValue : string)=>void}) {
    return (
      <>
        <div className="flex items-center m-3">
          <LockClosedIcon className="m-2"/>
          <Input onChange={evt => onChange(evt.target.value)} type="password" className="border w-full" placeholder="Your password" />
        </div>
      </>
    )
  }