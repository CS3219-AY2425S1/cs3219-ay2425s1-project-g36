import LayoutManager from "@/components/collaboration-service/LayoutManager";
import CodeEditingArea from "@/components/collaboration-service/CodeEditingArea";
import QuestionArea from "@/components/collaboration-service/QuestionArea";
import PageTitle from "@/components/common/PageTitle";
import ChattingOverlay from "@/components/collaboration-service/communication/ChattingOverlay";
import { useEffect, useState } from "react";
import { fetchQuestion } from "@/api/question-service/QuestionService";
import MainContainer from "@/components/common/MainContainer";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getUserById, updateUserAttemptHistory } from "@/api/user-service/UserService";
import { getCollabInfo, isUserInCollabStore, removeUserFromCollabStore } from "@/api/collaboration-service/CollaborationService";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { executeCodeInSandboxEnvironment, getCreditsSpent } from "@/api/collaboration-service/CollaborationService";
import { ProgrammingLanguage, ProgrammingLanguages } from "@/components/collaboration-service/ProgrammingLanguages";
import { formatRawCode } from "./LanguageScripts";

export default function CollaborationPage() {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null)
  const [questionId, setQuestionId] = useState<string | null>(null)
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [isQuestionLoading, setIsQuestionLoading] = useState(true)

  const { auth } = useAuth()
  const navigate = useNavigate();

  const { codeEditingAreaState, matchedUserState, questionAreaState } = useCollaborationContext();
  
  const { rawCode, setRunCodeResult, currentlySelectedLanguage, setCurrentSelectedLanguage, isCodeRunning, setIsCodeRunning, setUserRanCode } = codeEditingAreaState;
  const { matchedUser, setMatchedUser } = matchedUserState
  const { question, setQuestion } = questionAreaState

  
  // When user enters this page, check if his ID is in collabStore. If isn't, block the user from entering this page
  useEffect(() => {
    const checkIfUserInStore = async () => {
      if (auth.id === null) return
      
      try {
        const response1 = await isUserInCollabStore(auth.id)
        if (response1.status === 200) {
          // Using the user's ID, retrieve collaboration details
          const response2 = await getCollabInfo(auth.id)
          const data = response2.data
          
          setRoomId(data.roomId)
          setMatchedUserId(data.matchedUserId)
          setQuestionId(data.questionId)

          // fall back to the first language in ProgrammingLanguages if this fails
          const lang: ProgrammingLanguage = ProgrammingLanguages.find(lang => lang.name === data.progLang) || ProgrammingLanguages[0] 

          setCurrentSelectedLanguage(lang)

        } else {
          // Means that user is not in user store, so he cannot access the collab-page
          navigate("/matching/start")
        }
      } catch (error) {
        console.error(error)
      } 
    }

    checkIfUserInStore()
  }, [])

  // Use matchedUserId to retrieve matched user's details 
  useEffect(() => {
    const fetchMatchedUser = async () => {
      if (matchedUserId === null) return
      
      try {
        const response = await getUserById(matchedUserId)
        setMatchedUser(response.data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsUserLoading(false)
      }
    }
    
    fetchMatchedUser()
  }, [matchedUserId])

  // Use questionId to retrieve question details 
  useEffect(() => {
    const fetchQues = async () => {
      if (questionId === null) return

      try {
        const ques = await fetchQuestion(questionId)
        if (ques === null) return
        setQuestion(ques)
      } catch (error) {
        console.error(error)
      } finally {
        setIsQuestionLoading(false)
      }
    }

    fetchQues()
  }, [questionId])

  
  const handleSubmitCode = async () => {
    setIsCodeRunning(true) // disables 'run code' button for both users
    setRunCodeResult('executing code.. please be patient!') 
    setUserRanCode(false)
    
    const stdin = question.testInputs.join('\n')
    const language = currentlySelectedLanguage.JDoodleName
    const versionIndex = "0" // all the languages we support **should have** a versionIndex of 0
    
    const script = formatRawCode(rawCode, language) 

    console.log(script)

    try {
      const run_code_response = await executeCodeInSandboxEnvironment(
        script,
        stdin,
        language,
        versionIndex,
      )

      console.log('the result of executing code is: ', run_code_response.output)
      setRunCodeResult(run_code_response.output.output);

      const credits_spent_response = await getCreditsSpent()
      console.log('credits spent today is: ', credits_spent_response.data.used)
      console.log(`you have: ${20 - credits_spent_response.data.used} credits left for today`)
 
    } catch (error: any) {
      setRunCodeResult(`Error: ${error.response ? error.response.data.error : error.message}`);
    } finally {
      setIsCodeRunning(false)
    }
  };

  const handleRunCode = async () => {
    setIsCodeRunning(true) // disables 'run code' button for both users
    setRunCodeResult('executing code.. please be patient!') 
    setUserRanCode(true)
    
    console.log(rawCode)

    try {
      const run_code_response = await executeCodeInSandboxEnvironment(
        rawCode,
        "",
        currentlySelectedLanguage.JDoodleName,
        "0",
      )

      console.log('the result of executing code is: ', run_code_response.output)
      if (run_code_response.output !== null) {
        setRunCodeResult(run_code_response.output.output);
      }

      const credits_spent_response = await getCreditsSpent()
      console.log('credits spent today is: ', credits_spent_response.data.used)
      console.log(`you have: ${20 - credits_spent_response.data.used} credits left for today`)
 
    } catch (error: any) {
      setRunCodeResult(`Error: ${error.response ? error.response.data.error : error.message}`);
    } finally {
      setIsCodeRunning(false)
    }
  };

  // When user ends session, remove user from collabStore
  const endSession = async () => {
    try {
      await removeUserFromCollabStore(auth.id)
      await updateUserAttemptHistory(
        auth.id,
        questionId!, 
        question.title, 
        rawCode, 
        currentlySelectedLanguage.name, 
      );
      navigate("/matching/start")
    } catch (error) {
      console.error(error)
    }
  }

  if (isUserLoading || isQuestionLoading) return <div>loading</div>

  if (roomId == null || matchedUser == null || question == null) {
    console.log('if you see this message, means either roomId, matchedUser, or question is null, hence CollabPage cannot load')
    console.log(`roomId: ${roomId}`)
    console.log(`matchedUser: ${matchedUser}`)
    console.log(`questionId: ${questionId}`)
    console.log(`question: ${question}`)

    return (
      <>
        <PageHeader />
        <MainContainer className="px-4 text-center gap-3 flex flex-col">
          <h2 className="text-2xl">
          It seems like you are not in a valid collaboration environment. Please try matching again.
          </h2>
          <div className="flex justify-center">
            <Button className="btnblack">
              <Link to="/questions">
                Go back to question list
              </Link>
            </Button>
          </div>
        </MainContainer>
      </>
    )
  }

  return (
    <>
      <PageHeader />
      <MainContainer>
        <PageTitle>You are now collaborating with {matchedUser.username}.</PageTitle>
        <LayoutManager
          codeEditingArea={<CodeEditingArea roomId={roomId}/>}
          questionArea={<QuestionArea questionId={questionId || "72"}/>}
          otherButtons={
            <div className="flex gap-2">   
              <Button variant="outline" onClick={handleRunCode} disabled={isCodeRunning}>Run code</Button>
              <Button variant="green" onClick={handleSubmitCode} disabled={isCodeRunning}>Submit code</Button>
              <Button variant="destructive" className="btnred text-white" onClick={endSession}>End session</Button>
            </div>
          }
        />
        <ChattingOverlay roomId={roomId} otherUserName={matchedUser.username} questionId={questionId} />
      </MainContainer>
    </>
  )
}