import { Link, useSearchParams } from "react-router-dom";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import TextEditor from "@/components/collaboration-service/TextEditor";
import { useParams } from "react-router-dom"
import { CollaborationContextProvider } from "@/contexts/CollaborationContext";
import LayoutManager from "@/components/collaboration-service/LayoutManager";
import CodeEditingArea from "@/components/collaboration-service/CodeEditingArea";
import QuestionArea from "@/components/collaboration-service/QuestionArea";

export default function CollaborationPage() {
  const { documentId } = useParams()
  const [ parameters ] = useSearchParams()
  console.log(`documentId is: ${documentId}`)
  const questionId = parameters.get("questionId");

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
          <LayoutManager
            codeEditingArea={<CodeEditingArea/>}
            questionArea={<QuestionArea questionId={questionId || "72"}/>}
          />
        </CollaborationContextProvider>
      </MainContainer>
    </>
  )
}