import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import EditQuestionForm from "@/components/question-service/edit-question-page/EditQuestionForm";

/**
 * Page for admins to add questions.
 */
export default function AddQuestionPage() {
  document.title="Add New Question | PeerPrep";

  return (
    <>
      <PageHeader />
      <MainContainer>
        <EditQuestionForm />
      </MainContainer>
    </>
  );
}