'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useAuth from '../../../hooks/useAuth'
import SimpleCodeEditor from '../../../components/editor/SimpleCodeEditor'
import { Mic, MicOff, Video, VideoOff, Phone, Copy, Check } from 'lucide-react'

type Message = {
  id: string
  author: string
  text: string
  time: string
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const sessionId = params?.id as string

  const [sessionTitle, setSessionTitle] = useState('')
  const [code, setCode] = useState('// Start coding here...')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [copied, setCopied] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/student/login')
      return
    }

    if (user) {
      fetchSession()
      initializeMedia()
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
    }
  }, [user, loading, sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSessionTitle(data.data?.title || 'Session')
      }
    } catch (error) {
      console.error('Failed to fetch session:', error)
    }
  }

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      }
      peerConnectionRef.current = new RTCPeerConnection(configuration)

      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream)
      })

      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }
    } catch (error) {
      console.error('Failed to initialize media:', error)
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
    router.back()
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      author: user?.name || user?.email || 'You',
      text: newMessage,
      time: new Date().toLocaleTimeString(),
    }

    setMessages([...messages, message])
    setNewMessage('')
  }

  const copySessionLink = () => {
    const link = `${window.location.origin}/session/${sessionId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Loading session...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{sessionTitle}</h1>
            <p className="text-sm text-gray-400">Session ID: {sessionId}</p>
          </div>
          <button
            onClick={copySessionLink}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-900">
            <SimpleCodeEditor
              value={code}
              onChange={handleCodeChange}
              language="javascript"
            />
          </div>
        </div>

        <div className="w-96 bg-gray-800 flex flex-col">
          <div className="p-4 space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isVideoEnabled ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Phone className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col border-t border-gray-700">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white">{msg.author}</span>
                    <span className="text-xs text-gray-400">{msg.time}</span>
                  </div>
                  <p className="text-sm text-gray-200">{msg.text}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
