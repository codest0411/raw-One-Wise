import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../lib/supabase'
import { HttpError } from '../utils/httpError'
import {
  addCodeSnapshot,
  addSessionMessage,
  ensureSessionParticipant,
  formatPostgrestError,
  getSessionForUser,
  listSessionsForUser,
} from '../services/session'

const router = Router()

const sessionSelect =
  'id,title,status,scheduled_at,duration_minutes,created_at,created_by,summary,participants:session_participants(id,user_id,role,joined_at)'

router.get('/', async (req, res, next) => {
  try {
    if (!req.user?.id) throw new HttpError(401, 'Not authenticated')

    const sessions = await listSessionsForUser(req.user.id)
    res.json({ data: sessions })
  } catch (err) {
    next(err)
  }
})

const createSchema = z.object({
  title: z.string().min(3).max(200),
  scheduled_at: z.string().datetime().optional(),
  duration_minutes: z.number().int().positive().max(600).optional(),
  participant_ids: z.array(z.string().uuid()).min(1),
})

router.post('/', async (req, res, next) => {
  try {
    if (!req.user?.id) throw new HttpError(401, 'Not authenticated')
    if (req.user.role !== 'mentor') throw new HttpError(403, 'Only mentors can create sessions')

    const payload = createSchema.parse(req.body ?? {})

    const { data, error } = await supabaseAdmin
      .from('mentorship_sessions')
      .insert({
        title: payload.title,
        scheduled_at: payload.scheduled_at,
        duration_minutes: payload.duration_minutes,
        created_by: req.user.id,
      })
      .select('id')
      .single()

    if (error || !data) throw new HttpError(500, 'Unable to create session', formatPostgrestError(error))

    const participantsPayload = [
      { session_id: data.id, user_id: req.user.id, role: 'mentor' },
      ...payload.participant_ids.map((userId) => ({ session_id: data.id, user_id: userId, role: 'student' })),
    ]

    const { error: participantError } = await supabaseAdmin.from('session_participants').insert(participantsPayload)
    if (participantError) throw new HttpError(500, 'Unable to add participants', formatPostgrestError(participantError))

    res.status(201).json({ data: { id: data.id } })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    if (!req.user?.id) throw new HttpError(401, 'Not authenticated')

    const session = await getSessionForUser(req.user.id, req.params.id)

    res.json({ data: session })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/messages', async (req, res, next) => {
  try {
    if (!req.user?.id) throw new HttpError(401, 'Not authenticated')

    const { message } = z.object({ message: z.string().min(1).max(2000) }).parse(req.body ?? {})

    await addSessionMessage(req.params.id, req.user.id, message)

    res.status(201).json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/code', async (req, res, next) => {
  try {
    if (!req.user?.id) throw new HttpError(401, 'Not authenticated')

    const payload = z
      .object({
        language: z.string().optional(),
        code: z.string().min(1),
      })
      .parse(req.body ?? {})

    await addCodeSnapshot(req.params.id, req.user.id, payload.code, payload.language ?? 'javascript')

    res.status(201).json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
