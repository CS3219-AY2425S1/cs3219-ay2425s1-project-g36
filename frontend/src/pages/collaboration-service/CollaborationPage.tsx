import CodeEditingArea from "@/components/collaboration-service/CodeEditingArea";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";

export default function CollaborationPage() {
    return (
      <>
        <PageHeader/>
        <MainContainer>
          <CodeEditingArea/>
        </MainContainer>
      </>
    );
}