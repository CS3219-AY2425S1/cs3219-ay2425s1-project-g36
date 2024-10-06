import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from '../components/ui/button'
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Returns a sample main page. The main page is now the `ListQuestionPage` or `LoginPage`.
 * 
 * @returns Sample main page. Currently not used.
 */
export default function SamplePage() {
  const { auth, logout } = useAuth();
  const [count, setCount] = useState(0)
  const navigate = useNavigate();

  return (
    <div className="justify-self-center text-center">
    <div>
      <p>Here are some logos for testing:</p>
      <div className="flex gap-2 justify-center">
        <img src={viteLogo} className="logo" alt="Vite logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
    </div>
    <h1 className="text-3xl font-bold underline">
      Hello world! You are { !auth.isAdmin ? "not" : "" } logged in as an admin.
    </h1>
    <div className="card">
      <Button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </Button>
      <Button onClick={() => navigate('/questions/1')}>
        View Question 1
      </Button>
      <Button onClick={ logout }>
        Logout
      </Button>
    </div>
    <p className="read-the-docs">
      Click on the Vite and React logos to learn more
    </p>
    </div>
  );
}