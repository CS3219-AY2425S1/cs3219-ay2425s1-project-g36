import { useCallback, useEffect, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from "socket.io-client"

const SAVE_INTERVAL_MS = 2000

export default function TextEditor({ documentId }: { documentId: string }) {
    const [quill, setQuill] = useState<any>()
    const [socket, setSocket] = useState<any>()
    
    // connects to socket upon component mount
    useEffect(() => {
        const s = io("http://localhost:3001")
        setSocket(s)
        return () => {
            s.disconnect()
        }
    }, [])

    // upon entering the collaboration page, socket retrieves the document from db (if exists)
    // or creates a new one. Quill loads the document data to the frontend
    useEffect(() => {
        if (socket == null || quill == null) return

        socket.once('load-document', document => {
            quill.setContents(document)
            quill.enable()
        })
        socket.emit('get-document', documentId)
    }, [quill, socket, documentId])

    // saves changes to db every 2 seconds
    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents())
        }, SAVE_INTERVAL_MS)
        return () => {
            clearInterval(interval)
        }
    }, [quill, socket])

    // whenever socket receives changes, update Quill
    useEffect(() => {
        if (socket == null || quill == null) return
        const handler = delta => {
            quill.updateContents(delta)
        }

        socket.on('receive-changes', handler)
        return () => {
            socket.off('receive-changes', handler)
        }

    }, [quill, socket])

    // whenever user makes changes to Quill, send theco changes to socket
    useEffect(() => {
        if (socket == null || quill == null) return
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return
            socket.emit('send-changes', delta)
        }

        quill.on('text-change', handler)
        return () => {
            quill.off('text-change', handler)
        }
    }, [quill, socket])

    // 'inserts' Quill text editor into your div element
    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return

        wrapper.innerHTML = ''
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q = new Quill(editor, {
            modules: {
                toolbar: false
            },
            theme: 'snow'
        })
        q.disable()
        q.setText('Loading...')
        setQuill(q)
    }, []) 

    return (
        <div ref={wrapperRef} className="h-full"></div>
    )
}