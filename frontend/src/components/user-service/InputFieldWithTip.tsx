import { Input } from "@/components/ui/input";
import { ReactNode, useState } from "react";

export default function InputFieldWithTip({children, placeholder, onChange, type} : {children : ReactNode, placeholder : string, onChange : (newValue : string) => void, type : ("text" | "password")}) {
    
    const [displayTipBox, setDisplayTipBox] = useState(false);
    const onMouseEnterHander = () => setDisplayTipBox(true);
    const onMouseLeaveHandler = () => setDisplayTipBox(false);

    return (
      <>
        <div className="flex justify-start flex-row relative">
        <Input onMouseEnter={onMouseEnterHander} onMouseLeave={onMouseLeaveHandler} onChange={evt => onChange(evt.target.value)} type={type} placeholder={placeholder} />
        {displayTipBox && (
            <div className="absolute left-full">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent translate-y-1/2 ml-1" style={{borderRight: "15px solid rgba(0,0,0,0.5)"}} />
              <div className="bg-black bg-opacity-50 rounded-lg text-white p-1 min-w-[300px]" style={{transform: "translate(18.5px, -50%)"}}>
                {children}
              </div>
            </div>
          )}
        </div>
      </>
    );
}