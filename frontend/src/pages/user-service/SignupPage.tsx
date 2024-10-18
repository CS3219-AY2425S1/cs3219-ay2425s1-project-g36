import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import SignupForm from "@/components/user-service/signup-page/SignupForm";
import UserServiceCommonContainer from "@/components/user-service/UserServiceCommonContainer";
import { Link } from "react-router-dom";

export default function SignupPage() {
  document.title="Sign Up | PeerPrep";

  return (
    <>
      <PageHeader isLoggedIn={false}/>
      <MainContainer>
        <UserServiceCommonContainer title="Join PeerPrep">
          <SignupForm />
          <div className="flex items-center flex-col">
            <Link to='/login' className="m-1">Already have an account? Log in</Link>
            <Link to='/forgot-password' className="m-1">Forgot your password?</Link>
          </div>
        </UserServiceCommonContainer>
      </MainContainer>
      </>
  );
}