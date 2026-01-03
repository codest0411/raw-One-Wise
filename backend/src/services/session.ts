import type { PostgrestError } from '@supabase/supabase-js'
import { supabaseAdmin } from '../lib/supabase'
import { HttpError } from '../utils/httpError'

const SESSION_SELECT =
  'id,title,status,scheduled_at,duration_minutes,created_at,created_by,summary,participants:session_participants(id,user_id,role,joined_at)'

type ParticipantRow = {
  session_id: string
  user_id: string
  role: string
}

export const formatPostgrestError = (error: PostgrestError | null) => {
  if (!error) return undefined
  const { message, details, hint, code } = error
  return { message, details, hint, code }
}

export async function listSessionsForUser(userId: string) {
  const { data: participantRows, error: participantError } = await supabaseAdmin
    .from('session_participants')
    .select('session_id')
    .eq('user_id', userId)

  if (participantError) {
    throw new HttpError(500, 'Unable to load session memberships', formatPostgrestError(participantError))
  }

  const sessionIds = [...new Set(participantRows?.map((row) => row.session_id) ?? [])]
  if (sessionIds.length === 0) {
    return []
  }

  const { data, error } = await supabaseAdmin
    .from('mentorship_sessions')
    .select(SESSION_SELECT)
    .in('id', sessionIds)
    .order('scheduled_at', { ascending: true, nullsFirst: true })

  if (error) {
    throw new HttpError(500, 'Unable to load sessions', formatPostgrestError(error))
  }

  return data
}

export async function ensureSessionParticipant(userId: string, sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from('session_participants')
    .select('user_id,role')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new HttpError(500, 'Unable to verify session access', formatPostgrestError(error))
  }

  if (!data) {
    throw new HttpError(403, 'You are not a participant in this session')
  }

  return data as ParticipantRow
}

export async function getSessionForUser(userId: string, sessionId: string) {
  await ensureSessionParticipant(userId, sessionId)

  const { data, error } = await supabaseAdmin
    .from('mentorship_sessions')
    .select(SESSION_SELECT)
    .eq('id', sessionId)
    .maybeSingle()

  if (error) {
    throw new HttpError(500, 'Unable to load session', formatPostgrestError(error))
  }

  if (!data) {
    throw new HttpError(404, 'Session not found')
  }

  return data
}

export async function addSessionMessage(sessionId: string, userId: string, content: string) {
  await ensureSessionParticipant(userId, sessionId)

  const { error } = await supabaseAdmin.from('session_messages').insert({
    session_id: sessionId,
    author_id: userId,
    content,
  })

  if (error) {
    throw new HttpError(500, 'Unable to store message', formatPostgrestError(error))
  }
}

export async function addCodeSnapshot(sessionId: string, userId: string, code: string, language: string) {
  await ensureSessionParticipant(userId, sessionId)

  const { error } = await supabaseAdmin.from('session_code_snapshots').insert({
    session_id: sessionId,
    author_id: userId,
    language,
    code,
  })

  if (error) {
    throw new HttpError(500, 'Unable to store code snapshot', formatPostgrestError(error))
  }
}
