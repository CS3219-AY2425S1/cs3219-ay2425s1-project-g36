import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import ForgotPasswordForm from "@/components/user-service/forgot-password-page/ForgotPasswordForm";
import UserServiceCommonContainer from "@/components/user-service/UserServiceCommonContainer";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  document.title="Forgot Password | PeerPrep";

  return (
    <>
      <PageHeader isLoggedIn={false}/>
      <MainContainer>
        <UserServiceCommonContainer title="Reset Password">
          <ForgotPasswordForm />
          <div className="flex items-center flex-col">
            <Link to='/signup' className="m-1">Don't have an account yet? Signup</Link>
          </div>
        </UserServiceCommonContainer>  
      </MainContainer>
    </>
  );
}