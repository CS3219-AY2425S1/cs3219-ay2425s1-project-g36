import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import LoginForm from "@/components/user-service/login-page/LoginForm";
import UserServiceCommonContainer from "@/components/user-service/UserServiceCommonContainer";
import { Link } from "react-router-dom";

export default function LoginPage() {
  document.title="Login | PeerPrep";

  return (
    <>
      <PageHeader isLoggedIn={false}/>
      <MainContainer>
        <UserServiceCommonContainer title="Welcome to PeerPrep">
          <LoginForm/>
          <div className="flex items-center flex-col">
            <Link to='/signup' className="m-1">Don't have an account yet? Sign up</Link>
            <Link to='/forgot-password' className="m-1">Forgot your password?</Link>
          </div>
        </UserServiceCommonContainer>  
      </MainContainer>
    </>
  );
}