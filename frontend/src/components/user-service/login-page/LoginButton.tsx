import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function LoginButton({onClick} : {onClick : ()=>void}) {
    return (
      <>
        <div className="flex justify-center m-3"> 
          <Button onClick={onClick} className="border bg-orange-300 rounded-lg p-1 flex items-center">
            <ArrowRightIcon className="ml-1 mr-1" />
            <div className="mr-2">Login</div>
          </Button>
        </div> 
      </>
    )
  }