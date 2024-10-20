import { Input } from "@/components/ui/input";

export default function EmailAddressInputField({onChange} : {onChange : (newValue : string)=>void}) {
    return (
      <>
        <div className="flex items-center m-3">
          <Input onChange = {evt => onChange(evt.target.value)} type="text" className="border w-full" placeholder="Your email address" />
        </div>
      </>
    )
  }