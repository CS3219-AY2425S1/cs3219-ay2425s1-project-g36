import { ReactNode } from "react";

export default function SpinningCircle({children} : {children? : ReactNode | undefined}) {
  return(
    <>
      <div className="flex justify-center items-center relative w-20 h-20">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-transparent border-black" />
        {children}
      </div>
    </>
  )
}