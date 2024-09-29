import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = ( isAdmin: boolean ) => {
    login(isAdmin);
    navigate('/');
  }

  document.title="Login | PeerPrep";

  return (
    <>
      <p>
        This is an empty login page to be filled up.
      </p>
      <Button onClick={ () => handleLogin(false) }>Login</Button>
      <Button onClick={ () => handleLogin(true) }>Login as Admin</Button>
    </>
  );
}