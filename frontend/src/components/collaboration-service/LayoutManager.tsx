import { ReactNode, useState } from "react";
import { Button } from "../ui/button";
import { HamburgerMenuIcon, Cross1Icon, ViewVerticalIcon, EnterFullScreenIcon } from "@radix-ui/react-icons";
import VerticallySplitedView from "../common/VerticallySplitedView";

enum LayoutModes {
  VerticallySplittedView,
  FullPage_Question,
  FullPage_Code,
}

export default function LayoutManager({codeEditingArea, questionArea} : {codeEditingArea: ReactNode, questionArea: ReactNode}) {

  const [layoutMode, setLayoutMode] = useState<LayoutModes>(LayoutModes.VerticallySplittedView);
  const [displayLayoutOperationMenu, setDisplayLayoutOperationMenu] = useState(false);
  
  const changeLayoutMode = (newMode : LayoutModes) => {
    setLayoutMode(newMode);
    setDisplayLayoutOperationMenu(false);
  }

  const BUTTON_VERTICALLY_SPLITTED_VIEW = <Button id="vertically_splited_view" onClick={()=>changeLayoutMode(LayoutModes.VerticallySplittedView)} className="bg-gray-100"><ViewVerticalIcon className="mr-2"/>Vertically splited view</Button>;
  const BUTTON_FULLWINDOW_CODE =  <Button id="code_full_page" onClick={()=>changeLayoutMode(LayoutModes.FullPage_Code)} className="bg-gray-100"><EnterFullScreenIcon className="mr-2"/>View code in full page</Button>;
  const BUTTON_FULLWINDOW_QUESTION = <Button id="question_full_page" onClick={()=>changeLayoutMode(LayoutModes.FullPage_Question)} className="bg-gray-100"><EnterFullScreenIcon className="mr-2"/>View question in full page</Button>;

  const renderLayout__VerticallySplittedView = () => {
    return (
      <>
        <div>
          <VerticallySplitedView left={questionArea} right={codeEditingArea} minimumLeftWidthPercentage={20} maximumLeftWidthPercentage={80} />
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
      case LayoutModes.VerticallySplittedView:
        return renderLayout__VerticallySplittedView();
      case LayoutModes.FullPage_Question:
        return renderLayout__FullScreen_Question();
      case LayoutModes.FullPage_Code:
        return renderLayout__FullScreen_Code();
    }
  };

  const getLayoutMenuOperationButtons = () => {
    switch(layoutMode) {
      case LayoutModes.VerticallySplittedView:
        return [
            BUTTON_FULLWINDOW_QUESTION,
            BUTTON_FULLWINDOW_CODE
        ];
      case LayoutModes.FullPage_Question:
        return [
          BUTTON_VERTICALLY_SPLITTED_VIEW,
          BUTTON_FULLWINDOW_CODE
        ];
      case LayoutModes.FullPage_Code:
        return [
          BUTTON_VERTICALLY_SPLITTED_VIEW,
          BUTTON_FULLWINDOW_QUESTION
        ];
    }
  }

  const renderLayoutOperation = () => {
    return (
      <>
        <div className="absolute top-10 z-20">
          <div className="flex">
            <div className="w-20 h-20 mt-5">
              <Button className="bg-orange-300 hover:bg-orange-200" onClick={()=>setDisplayLayoutOperationMenu(!displayLayoutOperationMenu)}>
                {!displayLayoutOperationMenu ?
                  <HamburgerMenuIcon />
                :
                  <Cross1Icon />
                }
              </Button>
              {displayLayoutOperationMenu && (
                <div className="flex flex-col items-center min-w-64 space-y-2 bg-white rounded-lg mt-1 border-4 p-1">
                  {getLayoutMenuOperationButtons()}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div>
        {renderLayoutMode()}
        {renderLayoutOperation()}
      </div>
    </>
  );
}