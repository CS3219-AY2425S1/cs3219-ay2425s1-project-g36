

import React from "react";

/**
 * Creates the main container for a page.
 * 
 * Example usage:
 * ```
 * <>
 *   <PageHeader />
 *   <MainContainer>
 *     <PageTitle>Edit question</PageTitle>
 *     { your page content here... }
 *   </MainContainer>
 * </>
 * ```
 * 
 * @returns The main container for the page.
 */
export default function MainContainer({ children } : { children : React.ReactNode }) {
  return ( 
    <div className="container mx-auto py-10">
      { children }
    </div>
  );
}