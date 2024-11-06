import React from "react";

/**
 * Creates a page title using a `h2` element.
 * 
 * Example usage:
 * ```
 * <PageTitle>
 *   Edit Question
 * </PageTitle>
 * ```
 * 
 * @returns The page title
 */
export default function PageTitle({ children } : { children : React.ReactNode }) {
  return ( 
    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight mb-4">
      { children }
    </h2>
  );
}