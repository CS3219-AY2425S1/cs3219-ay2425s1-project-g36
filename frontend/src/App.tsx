import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import LoginPage from "./pages/user-service/LoginPage"
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import EditQuestionPage from "./pages/question-service/EditQuestionPage";
import ViewQuestionPage from "./pages/question-service/ViewQuestionPage";
import ListQuestionPage from "./pages/question-service/ListQuestionPage";
import SignupPage from "./pages/user-service/SignupPage";
import ForgotPasswordPage from "./pages/user-service/ForgotPasswordPage";
import AccountSettingsPage from "./pages/user-service/AccountSettingsPage";
import ErrorPage from "./pages/ErrorPage";
import AddQuestionPage from "./pages/question-service/AddQuestionPage";
import { Toaster } from "./components/ui/toaster";
import ResetPasswordPage from "./pages/user-service/ResetPasswordPage";
import StartMatchingPage from "./pages/matching-service/StartMatchingPage";
import WaitForMatchingPage from "./pages/matching-service/WaitForMatchingPage";
import MatchingFailedPage from "./pages/matching-service/MatchingFailedPage";
import GetReadyPage from "./pages/matching-service/GetReadyPage";
import CollaborationPage from "./pages/collaboration-service/CollaborationPage";
import AttemptedHistoryPage from "./pages/AttemptedHistoryPage";
import { CollaborationContextProvider } from "./contexts/CollaborationContext";

/**
 * A wrapper around routes that should only be accessed by logged-in users.
 * If a user is not logged in, automatically navigates to `/login`.
 * 
 * Usage:
 * ```
 * <PrivateRoute>
 *   <QuestionList />
 * </PrivateRoute>
 * ```
 */
function PrivateRoute({ children } : { children : React.ReactNode }) {
  const { auth } = useAuth();
  
  return ( auth.isLoggedIn ) ? (
    <>
      { children }
    </>
  ) : (
    <Navigate to="/login" />
  )
}


/**
 * A wrapper around routes that should only be accessed by not logged-in users.
 * If a user is logged in, automatically navigates to `/`.
 * 
 * Usage:
 * ```
 * <PublicRoute>
 *   <SignupPage />
 * </PublicRoute>
 * ```
 */
function PublicRoute({ children } : { children : React.ReactNode }) {
  const { auth } = useAuth();
  
  return ( !auth.isLoggedIn ) ? (
    <>
      { children }
    </>
  ) : (
    <Navigate to="/" />
  )
}

/**
 * A wrapper around routes that should only be accessed by admins. Admin routes
 * implicitly contain the `PrivateRoute` component, so you do not have to further
 * wrap the route around the `PrivateRoute` component.
 * 
 * If a user is an admin, navigates to the component represented by prop `adminRoute`.
 * 
 * If a user is not an admin, navigates to the component represented by prop `nonAdminRoute`.
 * 
 * Usage:
 * ```
 * <AdminRoute 
 *   adminRoute={ <EditQuestionPage /> }
 *   nonAdminRoute={ <ViewQuestionPage /> } 
 * />
 * ```
 */
function AdminRoute({ adminRoute, nonAdminRoute } : { adminRoute : React.ReactNode, nonAdminRoute : React.ReactNode }) {
  const { auth } = useAuth();
  
  return ( auth.isAdmin ) ? (
    <PrivateRoute>
      { adminRoute }
    </PrivateRoute>
  ) : (
    <PrivateRoute>
      { nonAdminRoute }
    </PrivateRoute>
  )
}

/**
 * @returns Main application, which routes different pages to different components.
 */
function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <Navigate to="/questions" />
            </PrivateRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } />
          <Route path="/reset-password/:token" element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <AccountSettingsPage />
            </PrivateRoute>
          } />
          <Route path="/questions/" element={
            <PrivateRoute>
              <ListQuestionPage />
            </PrivateRoute>
          } />
          <Route path="/questions/:id" element={
            <AdminRoute
              adminRoute={ <EditQuestionPage /> }
              nonAdminRoute={ <ViewQuestionPage /> }
            />
          } />
          <Route path="/questions/new" element={
            <AdminRoute
              adminRoute={ <AddQuestionPage /> }
              nonAdminRoute={ <Navigate to="/questions" /> }
            />
          } />
          <Route path="/attempts/:id/:timeSubmitted" element={
            <PrivateRoute>
              <ViewQuestionPage hasCode={true}/>
            </PrivateRoute>
          } />
          <Route path="/matching/start" element={
            <PrivateRoute>
              <StartMatchingPage />
            </PrivateRoute>
          } />
          <Route path="/matching/wait" element={
            <PrivateRoute>
              <WaitForMatchingPage />
            </PrivateRoute>
          }
          />
          <Route path="/matching/failed" element={
            <PrivateRoute>
              <MatchingFailedPage />
            </PrivateRoute>
          }
          />
          <Route path="/matching/get_ready" element={
            <PrivateRoute>
              <GetReadyPage />
            </PrivateRoute>
          }
          />
          <Route path="/collaboration" element={
            <PrivateRoute>
              <CollaborationContextProvider>
                <CollaborationPage />
              </CollaborationContextProvider>
            </PrivateRoute>
          }
          />
          <Route path='/history' element={
            <PrivateRoute>
              <AttemptedHistoryPage />
            </PrivateRoute>
          }
          /> 
          <Route path="*" Component={ ErrorPage } />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  )
}

export default App
