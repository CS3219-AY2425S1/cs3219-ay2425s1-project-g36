import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import ResetPasswordForm from "@/components/user-service/reset-password-page/ResetPasswordForm";
import UserServiceCommonContainer from "@/components/user-service/UserServiceCommonContainer";
import { Link, Navigate, useParams } from "react-router-dom";

export default function ResetPasswordPage() {
  document.title="Reset Password | PeerPrep";
  
  const params = useParams();

  const token = params.token;

  return (token) ? (
    <>
      <PageHeader isLoggedIn={false}/>
      <MainContainer>
        <UserServiceCommonContainer title="Reset Password">
          <ResetPasswordForm token={token} />
          <div className="flex items-center flex-col">
            <Link to='/login' className="m-1">Already remember your password? Log in</Link>
          </div>
        </UserServiceCommonContainer>
      </MainContainer>
    </>
  ) : (
    <Navigate to="/login" />
  )
}