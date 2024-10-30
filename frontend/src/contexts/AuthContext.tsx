import { sendCancelMatchingRequest } from '@/api/matching-service/MatchingService';
import { getUsers, sendLogoutRequest } from '@/api/user-service/UserService';
import React, { createContext, useContext, useEffect, useState } from 'react';

// authentication state
interface AuthState {
  isLoggedIn: boolean; // whether a user is logged in.
  isAdmin: boolean; // whether a user is an admin.
  id: string; // the ID of the logged in user.
  username: string; // the username of the logged in user.
  email: string; // the email address of the logged in user.
  token: string; // the token of the current user (if logged in)
}

// the default authentication state.
const DEFAULT_AUTH_STATE = {
  isLoggedIn: false,
  isAdmin: false,
  id: "",
  username: "",
  email: "",
  token: "",
}

interface AuthContextType {
  auth: AuthState; // current authentication state (logged in? admin?)
  login: (token : string, id: string, username: string, email: string, isAdmin?: boolean) => void; // function for login
  update: (username: string, email: string) => void; // function for updating auth status
  logout: () => void; // function for logout
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Function to load auth state from localStorage
const loadAuthState = (): AuthState => {
  const storedAuth = localStorage.getItem('authState');
  return storedAuth ? JSON.parse(storedAuth) : DEFAULT_AUTH_STATE;
};

// Function to save auth state to localStorage
const saveAuthState = (auth: AuthState) => {
  localStorage.setItem('authState', JSON.stringify(auth));
};

export const AuthProvider = ({ children } : { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(loadAuthState);

  const _logout = async () => {
    // no matter what, try to send a cancel matching request if required
    await sendCancelMatchingRequest(auth.id);

    const newAuthState = DEFAULT_AUTH_STATE;
    setAuth(newAuthState);
    saveAuthState(newAuthState);
  }

  const checkAuth = async () => {
    try {
      const response = await getUsers();
      if (response.status === 401) {
        _logout();
      }
    } catch (err : any) {
      _logout();
    }
  }

  // check authentication when app loads
  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token : string, id : string, username: string, email: string, isAdmin: boolean = false) => {
    const newAuthState = { isLoggedIn: true, isAdmin, id: id, token: token, username: username, email: email };

    setAuth(newAuthState);
    saveAuthState(newAuthState);
  };

  const logout = async () => {
    const response = await sendLogoutRequest();
    console.log(response);

    _logout();
  };

  /**
   * Updates the current auth context with the new username and email.
   * @param username The username to update the current auth context.
   * @param email The email to update the current auth context.
   */
  const update = async (username : string, email : string) => {
    const newAuthState = { ...auth, username: username, email: email };

    setAuth(newAuthState);
    saveAuthState(newAuthState);
  }

  // Effect to sync auth state changes to localStorage
  useEffect(() => {
    saveAuthState(auth);
  }, [auth]);

  // update auth state across browser tabs
  useEffect(() => {
    const handleStorageChange = (event : StorageEvent) => {
      const newAuthState = JSON.parse(event.newValue ?? "");

      setAuth(newAuthState);
      saveAuthState(newAuthState);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, update }}>
      { children }
    </AuthContext.Provider> 
  )
};

// Custom hook to use authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
