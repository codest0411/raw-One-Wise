import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { env } from './config/env'
import { logger } from './logger'
import { authenticate } from './middleware/authenticate'
import { errorHandler } from './middleware/errorHandler'
import profileRoutes from './routes/profile'
import sessionsRoutes from './routes/sessions'
import { supabaseAdmin } from './lib/supabase'
import type { AuthedUser } from './types'
import { addCodeSnapshot, addSessionMessage, ensureSessionParticipant } from './services/session'
import { HttpError } from './utils/httpError'

const app = express()

app.set('trust proxy', 1)

app.use(
  cors({
    origin: env.cors.allowedOrigins,
    credentials: true,
  })
)
app.use(helmet())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

app.get('/health', (_req, res) =>
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
)

app.use(authenticate)

app.use('/api/profile', profileRoutes)
app.use('/api/sessions', sessionsRoutes)

app.use(errorHandler)

const server = createServer(app)

type SocketAuthedUser = AuthedUser & { name?: string | null }

type SocketData = {
  user?: SocketAuthedUser
  sessionId?: string
}

const io = new SocketIOServer(server, {
  cors: {
    origin: env.socket.allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

io.use(async (socket, next) => {
  try {
    const headerToken = socket.handshake.headers.authorization?.replace('Bearer', '').trim()
    const token = socket.handshake.auth?.token ?? headerToken

    if (!token) {
      return next(new Error('Missing authentication token'))
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data?.user) {
      return next(new Error('Invalid or expired authentication token'))
    }

    const role =
      (data.user.user_metadata as Record<string, any> | undefined)?.role ??
      (data.user.app_metadata as Record<string, any> | undefined)?.role

    const socketUser: SocketAuthedUser = {
      ...data.user,
      role,
    }

    ;(socket.data as SocketData).user = socketUser
    next()
  } catch (err) {
    next(err instanceof Error ? err : new Error('Unable to authenticate socket connection'))
  }
})

io.on('connection', (socket) => {
  const data = socket.data as SocketData
  const user = data.user

  if (!user) {
    socket.disconnect(true)
    return
  }

  logger.info('Socket connected', { userId: user.id, socketId: socket.id })

  socket.on('disconnect', (reason) => {
    logger.info('Socket disconnected', { userId: user.id, reason })
  })

  socket.on('session:join', async ({ sessionId }: { sessionId?: string }, callback?: (payload: any) => void) => {
    try {
      if (!sessionId) {
        throw new HttpError(400, 'sessionId is required')
      }

      await ensureSessionParticipant(user.id, sessionId)

      const room = `session:${sessionId}`
      await socket.join(room)
      data.sessionId = sessionId

      callback?.({ ok: true })
      socket.emit('session:joined', { sessionId })
    } catch (err) {
      const message = err instanceof HttpError ? err.message : 'Unable to join session'
      callback?.({ ok: false, message })
      socket.emit('session:error', { message })
    }
  })

  socket.on('chat:message', async (payload: { id?: string; text?: string; time?: string }, callback?: (res: any) => void) => {
    try {
      const sessionId = data.sessionId
      if (!sessionId) {
        throw new HttpError(400, 'Join a session before sending messages')
      }

      if (!payload?.text) {
        throw new HttpError(400, 'Message text is required')
      }

      await addSessionMessage(sessionId, user.id, payload.text)

      const enriched = {
        id: payload.id ?? String(Date.now()),
        text: payload.text,
        time: payload.time ?? new Date().toISOString(),
        author: { id: user.id, name: user.user_metadata?.name ?? user.email },
        sessionId,
      }

      io.to(`session:${sessionId}`).emit('chat:message', enriched)
      callback?.({ ok: true })
    } catch (err) {
      const message = err instanceof HttpError ? err.message : 'Unable to send message'
      callback?.({ ok: false, message })
      socket.emit('session:error', { message })
    }
  })

  socket.on(
    'code:update',
    async (payload: { code?: string; language?: string }, callback?: (res: { ok: boolean; message?: string }) => void) => {
      try {
        const sessionId = data.sessionId
        if (!sessionId) {
          throw new HttpError(400, 'Join a session before sharing code')
        }

        if (!payload?.code) {
          throw new HttpError(400, 'Code content is required')
        }

        await addCodeSnapshot(sessionId, user.id, payload.code, payload.language ?? 'javascript')

        io.to(`session:${sessionId}`).emit('code:update', {
          code: payload.code,
          language: payload.language,
          sessionId,
          authorId: user.id,
          updatedAt: new Date().toISOString(),
        })

        callback?.({ ok: true })
      } catch (err) {
        const message = err instanceof HttpError ? err.message : 'Unable to update code'
        callback?.({ ok: false, message })
        socket.emit('session:error', { message })
      }
    }
  )
})

server.listen(env.port, () => {
  logger.info(`API server listening on http://localhost:${env.port}`, {
    port: env.port,
    nodeEnv: env.nodeEnv,
  })
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', typeof reason === 'object' ? (reason as Record<string, unknown>) : { reason })
})

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully')
  server.close(() => process.exit(0))
})
