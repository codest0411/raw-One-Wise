'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePathname, useParams } from 'next/navigation'
import CodeEditor from '../../../components/editor/CodeEditor'
import ChatPanel, { ChatMessage } from '../../../components/chat/ChatPanel'
import VideoPanel from '../../../components/video/VideoPanel'
import SessionHeader from '../../../components/session/SessionHeader'
import useSocket from '../../../hooks/useSocket'
import { Session } from '../../../types'

export default function SessionPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [session] = useState<Session>({ id, title: `Session ${id}` })
  const { socket, connected, emit, on, off } = useSocket()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [code, setCode] = useState<string>(`// Welcome to session ${id}\n\nfunction hello() {\n  console.log('Hello world')\n}`)

  // Subscribe to chat messages
  useEffect(() => {
    const unsub = on('chat:message', (data: any) => {
      const msg: ChatMessage = {
        id: data.id ?? String(Date.now()),
        author: data.author,
        text: data.text,
        time: data.time ?? new Date().toISOString(),
        isOwn: false,
      }
      setMessages((m) => [...m, msg])
    })

    const codeSub = on('code:update', (payload: any) => {
      if (payload?.code) setCode(payload.code)
    })

    return () => {
      unsub()
      codeSub()
    }
  }, [on])

  const handleSendMessage = (text: string) => {
    const payload = { id: String(Date.now()), text, time: new Date().toISOString() }
    // Optimistic UI
    setMessages((m) => [...m, { id: payload.id, text, time: payload.time, isOwn: true }])
    emit('chat:message', payload)
  }

  const handleCodeChange = (value?: string) => {
    setCode(value ?? '')
    emit('code:update', { code: value })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <SessionHeader session={session} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <CodeEditor initialCode={code} language="javascript" onChange={handleCodeChange} height={480} />
            </div>

            <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Notes</h3>
              <textarea className="w-full min-h-[120px] px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" placeholder="Shared notes..." />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 h-[340px]">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Video</h3>
              <VideoPanel />
            </div>

            <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 h-[360px] flex flex-col">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Chat</h3>
              <div className="flex-1 overflow-hidden">
                <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 text-sm text-gray-500">Socket status: {connected ? 'connected' : 'disconnected'}</div>
      </div>
    </div>
  )
}
