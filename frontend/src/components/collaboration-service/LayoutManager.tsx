import { ReactNode, useState } from "react";
import { Button } from "../ui/button";
import { ViewVerticalIcon, EnterFullScreenIcon } from "@radix-ui/react-icons";
import VerticallySplitView from "@/components/common/VerticallySplitView";

enum LayoutModes {
  VerticallySplitView,
  FullPage_Question,
  FullPage_Code,
}

/**
 * Creates the overall layout of the collaboration service interface, with the following props:
 * 
 * - `codeEditingArea`: The code editing area of the collaboration service interface.
 * - `questionArea`: The question area of the collaboration service interface.
 * - `otherButtons`: Utility buttons to be displayed alongside the layout change buttons, such as
 *   `End session` and `Run code` buttons.
 * 
 * @returns The overall layout of the collaboration service interface.
 */
export default function LayoutManager({codeEditingArea, questionArea, otherButtons} : {codeEditingArea: ReactNode, questionArea: ReactNode, otherButtons: ReactNode}) {

  const [layoutMode, setLayoutMode] = useState<LayoutModes>(LayoutModes.VerticallySplitView);
    
  const changeLayoutMode = (newMode : LayoutModes) => {
    setLayoutMode(newMode);
  }

  const BUTTON_VERTICALLY_SPLIT_VIEW = <Button id="vertically_split_view" onClick={()=>changeLayoutMode(LayoutModes.VerticallySplitView)} className="bg-gray-100"><ViewVerticalIcon className="mr-2"/>Vertically split view</Button>;
  const BUTTON_FULLWINDOW_CODE =  <Button id="code_full_page" onClick={()=>changeLayoutMode(LayoutModes.FullPage_Code)} className="bg-gray-100"><EnterFullScreenIcon className="mr-2"/>View code in full page</Button>;
  const BUTTON_FULLWINDOW_QUESTION = <Button id="question_full_page" onClick={()=>changeLayoutMode(LayoutModes.FullPage_Question)} className="bg-gray-100"><EnterFullScreenIcon className="mr-2"/>View question in full page</Button>;

  const renderLayout__VerticallySplittedView = () => {
    return (
      <>
        <div>
          <VerticallySplitView left={questionArea} right={codeEditingArea} minimumLeftWidthPercentage={20} maximumLeftWidthPercentage={80} />
        </div>
      </>
    );
  }

  const renderLayout__FullScreen_Code = () => {
    return (
      <>
        {codeEditingArea}
      </>
    );
  }

  const renderLayout__FullScreen_Question = () => {
    return (
      <>
        {questionArea}
      </>
    );
  }

  const renderLayoutMode = () => {
    switch(layoutMode) {
      case LayoutModes.VerticallySplitView:
        return renderLayout__VerticallySplittedView();
      case LayoutModes.FullPage_Question:
        return renderLayout__FullScreen_Question();
      case LayoutModes.FullPage_Code:
        return renderLayout__FullScreen_Code();
    }
  };

  const getLayoutMenuOperationButtons = () => {
    switch(layoutMode) {
      case LayoutModes.VerticallySplitView:
        return [
            BUTTON_FULLWINDOW_QUESTION,
            BUTTON_FULLWINDOW_CODE
        ];
      case LayoutModes.FullPage_Question:
        return [
          BUTTON_VERTICALLY_SPLIT_VIEW,
          BUTTON_FULLWINDOW_CODE
        ];
      case LayoutModes.FullPage_Code:
        return [
          BUTTON_VERTICALLY_SPLIT_VIEW,
          BUTTON_FULLWINDOW_QUESTION
        ];
    }
  }

  const renderLayoutOperation = () => {
    return (
      <>
        <div className="flex flex-row space-x-5">
          {getLayoutMenuOperationButtons()}
        </div>
      </>
    );
  }
  
  return (
    <>
      <div>
        <div className="flex flex-col gap-2 md:flex-row">
          <div>{renderLayoutOperation()}</div>
          <div className="flex-grow-0 md:flex-1"></div>
          { otherButtons }
        </div>

        <div className="mt-5 mb-5"/>
        {renderLayoutMode()}
      </div>
    </>
  );
}