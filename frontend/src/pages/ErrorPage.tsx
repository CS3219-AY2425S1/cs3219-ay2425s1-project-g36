import MainContainer from "@/components/common/MainContainer"
import PageTitle from "@/components/common/PageTitle";

/**
 * The error page is displayed when trying to access an invalid URL.
 */
export default function ErrorPage() {

  document.title="Error | PeerPrep"

  return (
    <MainContainer>
      <PageTitle>Something went wrong :(</PageTitle>
      <strong>Error: </strong>The page you were trying to visit is invalid. <a href="/">Return to home page</a>
    </MainContainer>
  );
}