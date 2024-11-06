import { ReactNode, useState } from "react";
import { Button } from "../ui/button";
import {ArrowLeftIcon, ArrowRightIcon} from "@radix-ui/react-icons";

export default function VerticallySplitView({left, right, enableDragToResize = true, enableSwitchLeftAndRight = true, minimumLeftWidthPercentage = 10, maximumLeftWidthPercentage = 90} : {left : ReactNode, right : ReactNode, enableDragToResize? : boolean, enableSwitchLeftAndRight? : boolean, minimumLeftWidthPercentage? : number, maximumLeftWidthPercentage? : number}) {
  
  const [leftElement, setLeftElement] = useState<ReactNode>(left);
  const [rightElement, setRightElement] = useState<ReactNode>(right);
  const [leftWidthPercentage, setLeftWidthPercentage] = useState(50);
  
  const CONTAINER_DIV_ID = "vertically_split_view_container";

  const dragBarOnDragStart = (e : any) => {
    e.preventDefault();
    if(!enableDragToResize) return;
    document.addEventListener("mousemove", dragBarOnDragging);
    document.addEventListener("mouseup", dragBarOnDragEnd);
  }

  const dragBarOnDragging = (e : MouseEvent) => {
    e.preventDefault();
    const viewContainer = document.getElementById(CONTAINER_DIV_ID) as HTMLElement;
    const newLeftWidthPercentage = Math.min(maximumLeftWidthPercentage, Math.max(minimumLeftWidthPercentage, (e.clientX - viewContainer.offsetLeft) / viewContainer.offsetWidth * 100));
    setLeftWidthPercentage(newLeftWidthPercentage);
  }

  const dragBarOnDragEnd = (e : MouseEvent) => {
    e.preventDefault();
    document.removeEventListener("mousemove", dragBarOnDragging);
    document.removeEventListener("mouseup", dragBarOnDragEnd);
  }

  const switchLeftAndRight = () => {
    if(!enableSwitchLeftAndRight) return;
    const originalLeftElement = leftElement;
    const originalRightElement = rightElement;
    setLeftElement(originalRightElement);
    setRightElement(originalLeftElement);
  }


  return (
    <>
      <div id={CONTAINER_DIV_ID}>
        <div className="flex flex-row">
          <div style={{width: leftWidthPercentage.toString() + "%"}}>
            {leftElement}
          </div>
          <div className="relative w-3 bg-gray-200 cursor-ew-resize flex flex-row space-x-0.5" onMouseDown={dragBarOnDragStart}>
            {enableDragToResize && (<>
              <div className="w-[2px] h-full bg-gray-400 ml-0.5"></div>
              <div className="w-[2px] h-full bg-gray-400 "></div>
            </>)}
            {enableSwitchLeftAndRight && (<>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" style={{margin: "0px"}}>
                <Button onClick={switchLeftAndRight} className="bg-orange-300 hover:bg-orange-200 opacity-70 p-1"><ArrowLeftIcon/><ArrowRightIcon/></Button>
              </div>
            </>)}
          </div>
          <div style={{width: (100 - leftWidthPercentage).toString() + "%"}}>
            {rightElement}
          </div>
        </div>
      </div>
    </>
  )
}