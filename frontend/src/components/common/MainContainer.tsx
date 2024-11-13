

import React from "react";

/**
 * Creates the main container for a page, with the default style classes of
 * `container mx-auto py-10`. You may add more style classes using the 
 * `className` prop.
 * 
 * Example usage:
 * ```
 * <>
 *   <PageHeader />
 *   <MainContainer className="more-classes">
 *     <PageTitle>Edit question</PageTitle>
 *     { your page content here... }
 *   </MainContainer>
 * </>
 * ```
 * 
 * @returns The main container for the page.
 */
export default function MainContainer({ children, className } : { children : React.ReactNode, className? : string }) {
  return ( 
    <div className={"container mx-auto py-10" + (className ? (" " + className) : "") }>
      { children }
    </div>
  );
}