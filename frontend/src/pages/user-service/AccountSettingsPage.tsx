import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import AccountSettingsForm from "@/components/user-service/account-settings-page/AccountSettingsForm";

export default function AccountSettingsPage() {
  document.title="Account Settings | PeerPrep";

  return (
    <>
      <PageHeader />
      <MainContainer>
        <AccountSettingsForm />
      </MainContainer>
    </>
  );
}