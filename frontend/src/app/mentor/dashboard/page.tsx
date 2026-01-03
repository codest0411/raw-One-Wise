'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '../../../hooks/useAuth'
import { Video, Users, Calendar, Plus } from 'lucide-react'

type Session = {
  id: string
  title: string
  status: string
  scheduled_at?: string
  participants?: any[]
}

export default function MentorDashboard() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'mentor')) {
      router.replace('/auth/mentor/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetchSessions()
    }
  }, [user])

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSessions(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const createSession = async () => {
    if (!newSessionTitle.trim()) return

    setCreating(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          title: newSessionTitle,
          participant_ids: [],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setShowCreateModal(false)
        setNewSessionTitle('')
        router.push(`/session/${data.data.id}`)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    } finally {
      setCreating(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">OneWise</h1>
              <span className="ml-4 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                Mentor
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">{user.name || user.email}</span>
              <button
                onClick={() => logout()}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mentor Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your mentorship sessions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{sessions.length}</p>
              </div>
              <Video className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {sessions.filter(s => s.status === 'live').length}
                </p>
              </div>
              <Users className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {sessions.filter(s => s.status === 'scheduled').length}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Sessions</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Session
            </button>
          </div>

          {loadingSessions ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No sessions yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Create Your First Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/session/${session.id}`)}
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{session.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: <span className="capitalize">{session.status}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {session.participants?.length || 0} participants
                    </span>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Session</h3>
            <input
              type="text"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              placeholder="Session title"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={createSession}
                disabled={creating || !newSessionTitle.trim()}
                className="flex-1 px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
