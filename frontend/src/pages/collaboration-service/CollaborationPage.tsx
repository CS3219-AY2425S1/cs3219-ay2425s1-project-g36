import { Link, useSearchParams } from "react-router-dom";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button"
import { useParams } from "react-router-dom"
import { CollaborationContextProvider } from "@/contexts/CollaborationContext";
import LayoutManager from "@/components/collaboration-service/LayoutManager";
import CodeEditingArea from "@/components/collaboration-service/CodeEditingArea";
import QuestionArea from "@/components/collaboration-service/QuestionArea";
import PageTitle from "@/components/common/PageTitle";

export default function CollaborationPage() {
  const { documentId } = useParams()
  const [ parameters ] = useSearchParams()
  console.log(`documentId is: ${documentId}`)
  const questionId = parameters.get("questionId");
  const collaboratorName = parameters.get("collaboratorName");

  if (documentId == null) {
    return (
      <MainContainer className="px-4 text-center gap-3 flex flex-col">
        <h2 className="text-2xl">
          You are at an invalid document ID for collaborating
        </h2>
        <div className="flex justify-center">
          <Button className="btnblack">
            <Link to="/questions">
              Go back to question list
            </Link>
          </Button>
        </div>
      </MainContainer>
    )
  }

  return (
    <>
      <PageHeader />
      <MainContainer>
        <CollaborationContextProvider>
          <PageTitle>You are now collaborating with {collaboratorName}.</PageTitle>
          <LayoutManager
            codeEditingArea={<CodeEditingArea documentId={documentId}/>}
            questionArea={<QuestionArea questionId={questionId || "72"}/>}
          />
        </CollaborationContextProvider>
      </MainContainer>
    </>
  )
}