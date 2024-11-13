import { ReactNode } from "react";

export default function UserServiceCommonContainer({children, title} : {children : ReactNode, title : string}) {
    return (
        <>
          <div className="min-h-screen flex justify-center items-center">
            <div className="bg-gray-100 p-5 rounded-lg w-full max-w-md">
              <p className="text-center font-bold mb-8 text-xl">{title}</p>
              <div className="flex items-center flex-col">
                {children}
              </div>
            </div>
          </div>
        </>
    );
}