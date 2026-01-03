'use client'

import Link from 'next/link'

const sessions = [
  { id: 'design-review', title: 'Design Review', role: 'Mentor', date: 'Jan 3 · 6:00 PM IST', status: 'Upcoming' },
  { id: 'react-live', title: 'React Live Pairing', role: 'Student', date: 'Jan 5 · 9:00 PM IST', status: 'Scheduled' },
  { id: 'algorithms', title: 'Algorithms Deep Dive', role: 'Mentor', date: 'Jan 8 · 7:30 PM IST', status: 'Waitlist' },
]

export default function SessionsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 md:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard / Sessions</p>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Sessions overview</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage upcoming, in-progress, and past sessions.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/session/demo" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold">
              Start instant session
            </Link>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold">
              Back to dashboard
            </Link>
          </div>
        </header>

        <section className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{session.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {session.role} · {session.date}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 px-3 py-1 text-xs font-semibold dark:bg-indigo-900 dark:border-indigo-700">
                  {session.status}
                </span>
                <Link
                  href={`/session/${session.id}`}
                  className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold"
                >
                  Open session →
                </Link>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
