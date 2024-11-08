import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Phone, PhoneCall, PhoneOff, Video, X, Minimize2, Maximize2, User } from "lucide-react"
import { useCollaborationContext } from '@/contexts/CollaborationContext'
import Peer from 'simple-peer'

export default function Component() {
    
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showOtherUser, setShowOtherUser] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [incomingCall, setIncomingCall] = useState(false)
  const [ me, setMe ] = useState("")
  const [ stream, setStream ] = useState<MediaStream>()
  const [ receivingCall, setReceivingCall ] = useState(false)
  const [ caller, setCaller ] = useState("")
  const [ callerSignal, setCallerSignal ] = useState<Peer.SignalData>()
  const [ callAccepted, setCallAccepted ] = useState(false)
  const [ idToCall, setIdToCall ] = useState("")
  const [ callEnded, setCallEnded ] = useState(false)
  const [ name, setName ] = useState("")

  const myVideo = useRef<HTMLVideoElement>(null)
  const userVideo = useRef<HTMLVideoElement>(null)
  const connectionRef= useRef<Peer.Instance>()

  const { socketState } = useCollaborationContext();
  const { socket } = socketState;
  
  useEffect(() => {
    // Ask for permission to use the camera and microphone when the component mounts
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
        if (myVideo.current && myVideo.current) {
          myVideo.current.srcObject = stream
        }
		})
  
    // Set up my id
	  socket?.on("me", (id) => {
			setMe(id)
		})

    // When receiving a call
		socket?.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal)
		})
	}, [])

  // Functions for calling (logic for calling feature)

  // Call the matched user
	const callUser = (id: string) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket?.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			if (userVideo.current) {
				userVideo.current.srcObject = stream
      }
		})
		socket?.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}

  // Answer the call from the matched user
	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket?.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream
      }
		})

    if (callerSignal) {
      peer.signal(callerSignal)
    }
		connectionRef.current = peer
	}

  // Leave the call
	const leaveCall = () => {
		setCallEnded(true)
    if (connectionRef.current) {
      connectionRef.current.destroy()
    }

	}

  // UI for the video call feature

  // Start the call with the matched user
  const startCall = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsCallActive(true);
      callUser(idToCall); // Start the call with the selected user
    }, 2000); // Simulate call connecting
  };



  // End the call
  const endCall = () => {
    setIsCallActive(false)
    setIsMinimized(false)
    setShowOtherUser(false)
    leaveCall()
  }

  // Minimize the call window
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
    if (!isMinimized) {
      setShowOtherUser(false)
    }
  }

  const answerIncomingCall = () => {
    setIncomingCall(false)
    startCall()
    answerCall()
  }

  // TODO: Implement this function
  const rejectCall = () => {
    setIncomingCall(false)
  }


  // Toggle the other user's video
  const toggleOtherUser = () => {
    setShowOtherUser(!showOtherUser)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        {/* <h1 className="text-2xl font-bold mb-4">Video Call Interface</h1> */}

        {/* Start Call Button */}
        {!isCallActive && !incomingCall && (
          <div className="flex justify-center space-x-4">
            <Button onClick={startCall} disabled={isConnecting} className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-200 flex items-center justify-center">
              {isConnecting ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Phone className="w-8 h-8 text-white" />
              )}
            </Button>
            {/* <Button onClick={simulateIncomingCall} className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center">
              <PhoneCall className="w-8 h-8 text-white" />
            </Button> */}
          </div>
        )}

        {/* Incoming Call UI */}
        {incomingCall && (
          <div className="fixed inset-x-0 bottom-4 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-4 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">Incoming Call</h3>
                <p className="text-sm text-gray-500">Matched User is calling...</p>
              </div>
              <div className="flex-shrink-0 space-x-2">
                <Button onClick={rejectCall} variant="destructive" size="sm">
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={answerIncomingCall} variant="default" size="sm">
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Answer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Call UI */}
        {isCallActive && (
          <div className={`fixed ${isMinimized ? 'bottom-4 right-4' : 'inset-0'} flex items-center justify-center bg-black bg-opacity-50 transition-all duration-300 ease-in-out`}>
            <div className={`bg-white rounded-lg shadow-xl overflow-hidden ${isMinimized ? 'w-64' : 'w-full max-w-2xl h-3/4 max-h-[600px]'}`}>
              <div className="bg-gray-800 p-2 flex justify-between items-center">
                <span className="text-white font-semibold">Active Call</span>
                <div className="flex items-center space-x-2">
                  {isMinimized && (
                    <Button variant="ghost" size="icon" onClick={toggleOtherUser} className="text-white hover:text-gray-300">
                      <User className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={toggleMinimize} className="text-white hover:text-gray-300">
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={endCall} className="text-white hover:text-gray-300">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {(!isMinimized || (isMinimized && showOtherUser)) && (
                <div className={`bg-gray-900 ${isMinimized ? 'h-36' : 'h-full'} flex items-center justify-center relative`}>
                  <video className="w-full h-full object-cover" autoPlay muted loop ref={myVideo}></video>
                  {!isMinimized && (
                    <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
                      <video className="w-full h-full object-cover" autoPlay muted loop ref={userVideo}></video>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // useEffect(() => {
  //   const handleEscape = (event: KeyboardEvent) => {
  //     if (event.key === 'Escape') {
  //       endCall()
  //     }
  //   }

  //   window.addEventListener('keydown', handleEscape)

  //   return () => {
  //     window.removeEventListener('keydown', handleEscape)
  //   }
  // }, [])

  // return (
  //   <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
  //     <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
  //       <h1 className="text-2xl font-bold mb-4">Video Call Interface</h1>
  //       {!isCallActive && (
  //         <Button onClick={startCall} disabled={isConnecting} className="w-full">
  //           {isConnecting ? 'Connecting...' : (
  //             <>
  //               <Video className="mr-2 h-4 w-4" />
  //               Start Video Call
  //             </>
  //           )}
  //         </Button>
  //       )}
  //       {isCallActive && (
  //         <div className={`fixed ${isMinimized ? 'bottom-4 right-4' : 'inset-0'} flex items-center justify-center bg-black bg-opacity-50 transition-all duration-300 ease-in-out`}>
  //           <div className={`bg-white rounded-lg shadow-xl overflow-hidden ${isMinimized ? 'w-64' : 'w-full max-w-2xl h-3/4 max-h-[600px]'}`}>
  //             <div className="bg-gray-800 p-2 flex justify-between items-center">
  //               <span className="text-white font-semibold">Active Call</span>
  //               <div className="flex items-center space-x-2">
  //                 {isMinimized && (
  //                   <Button variant="ghost" size="icon" onClick={toggleOtherUser} className="text-white hover:text-gray-300">
  //                     <User className="h-4 w-4" />
  //                   </Button>
  //                 )}
  //                 <Button variant="ghost" size="icon" onClick={toggleMinimize} className="text-white hover:text-gray-300">
  //                   {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
  //                 </Button>
  //                 <Button variant="ghost" size="icon" onClick={endCall} className="text-white hover:text-gray-300">
  //                   <X className="h-4 w-4" />
  //                 </Button>
  //               </div>
  //             </div>
  //             {(!isMinimized || (isMinimized && showOtherUser)) && (
  //               <div className={`bg-gray-900 ${isMinimized ? 'h-36' : 'h-full'} flex items-center justify-center relative`}>
  //                 <video className="w-full h-full object-cover" autoPlay muted loop>
  //                   <source src="/placeholder.svg?height=400&width=600" type="video/mp4" />
  //                   Your browser does not support the video tag.
  //                 </video>
  //                 {!isMinimized && (
  //                   <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
  //                     <video className="w-full h-full object-cover" autoPlay muted loop>
  //                       <source src="/placeholder.svg?height=200&width=300" type="video/mp4" />
  //                       Your browser does not support the video tag.
  //                     </video>
  //                   </div>
  //                 )}
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // )
}