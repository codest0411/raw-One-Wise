import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

/**
 * useSocket - connects to a Socket.IO server and provides helpers to emit and listen to events.
 *
 * Defaults to connecting to http://localhost:4000. You may pass a different URL when calling the hook.
 *
 * Example:
 * const { socket, connected, emit, on, off, once } = useSocket()
 * useEffect(() => {
 *   const unsubscribe = on('message', (msg) => console.log(msg))
 *   return unsubscribe
 * }, [on])
 */

type AnyEventMap = Record<string, any>

type Handler = (...args: any[]) => void

export type UseSocketReturn<T extends AnyEventMap = AnyEventMap> = {
  socket: Socket | null
  connected: boolean
  emit: (event: keyof T | string, ...args: any[]) => void
  on: (event: keyof T | string, handler: Handler) => (() => void)
  off: (event: keyof T | string, handler?: Handler) => void
  once: (event: keyof T | string, handler: Handler) => void
}

export default function useSocket<T extends AnyEventMap = AnyEventMap>(url = 'http://localhost:4000'): UseSocketReturn<T> {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Create socket connection
    const socket = io(url, { autoConnect: true })
    socketRef.current = socket

    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', (err) => console.error('Socket connect error', err))

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error')
      socket.close()
      socketRef.current = null
    }
  }, [url])

  const emit = useCallback((event: string, ...args: any[]) => {
    socketRef.current?.emit(event, ...args)
  }, [])

  const on = useCallback((event: string, handler: Handler) => {
    socketRef.current?.on(event, handler)
    // Return an unsubscribe function for convenience
    return () => {
      socketRef.current?.off(event, handler)
    }
  }, [])

  const off = useCallback((event: string, handler?: Handler) => {
    if (handler) socketRef.current?.off(event, handler)
    else socketRef.current?.removeAllListeners(event)
  }, [])

  const once = useCallback((event: string, handler: Handler) => {
    socketRef.current?.once(event, handler)
  }, [])

  return { socket: socketRef.current, connected, emit, on, off, once }
}
