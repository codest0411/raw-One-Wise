'use client'

import React from 'react'
import Sidebar from '../../components/sidebar/Sidebar'
import RequireAuth from '../../components/auth/RequireAuth'
import useAuth from '../../hooks/useAuth'
import type { UserRole } from '../../hooks/useAuth'

const dashboardCopy: Record<
  UserRole,
  {
    badge: string
    title: string
    subtitle: string
    stats: { label: string; value: string; detail: string }[]
    scheduleTitle: string
    schedule: { title: string; time: string; context: string; badge: string }[]
    quickActions: { label: string; description: string; tone: 'primary' | 'secondary' }[]
  }
> = {
  mentor: {
    badge: 'Mentor workspace',
    title: 'Mentor command center',
    subtitle: 'Track mentees, payouts, and upcoming sessions with full compliance telemetry.',
    stats: [
      { label: 'Active students', value: '12', detail: '+2 this week' },
      { label: 'Hours coached', value: '46h', detail: 'Rolling 30 days' },
      { label: 'Payout status', value: 'Ready', detail: 'Stripe transfer in 3 days' },
    ],
    scheduleTitle: 'Next coaching blocks',
    schedule: [
      { title: 'Senior React tear-down', time: 'Today • 7:30 PM IST', context: '1:1 with Riya Patel', badge: 'Mentoring' },
      { title: 'Code pairing review', time: 'Tomorrow • 9:00 AM IST', context: 'Cohort Phoenix', badge: 'Standup' },
    ],
    quickActions: [
      { label: 'Create private session', description: 'Spin up a secure room with recordings + code sandbox.', tone: 'primary' },
      { label: 'Approve payouts', description: 'Sync completed sessions to Stripe Connect.', tone: 'secondary' },
    ],
  },
  student: {
    badge: 'Student workspace',
    title: 'Student learning hub',
    subtitle: 'Review assignments, join upcoming live rooms, and monitor mentor feedback.',
    stats: [
      { label: 'Upcoming sessions', value: '3', detail: 'Next in 2 hours' },
      { label: 'Mentor responses', value: '4', detail: 'Awaiting review' },
      { label: 'Course progress', value: '78%', detail: 'Full-stack cohort' },
    ],
    scheduleTitle: 'Upcoming live sessions',
    schedule: [
      { title: 'Design systems AMA', time: 'Today • 6:00 PM IST', context: 'With Ananya Pillai', badge: 'Live' },
      { title: 'Pair-programming lab', time: 'Friday • 5:30 PM IST', context: 'Mentor: Nikhil Rao', badge: 'Workshop' },
    ],
    quickActions: [
      { label: 'Join session room', description: 'Launch low-latency audio + code streaming.', tone: 'primary' },
      { label: 'Upload assignment', description: 'Securely send notebooks & demos for review.', tone: 'secondary' },
    ],
  },
}

function DashboardContent() {
  const { user, loading } = useAuth()
  const resolvedRole: UserRole = user?.role === 'mentor' ? 'mentor' : 'student'
  const config = dashboardCopy[resolvedRole]

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-200">
        Securing your {resolvedRole} workspace&hellip;
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="md:flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col gap-3">
              <span className="inline-flex items-center w-fit rounded-full border border-indigo-200/60 dark:border-indigo-600/40 bg-indigo-50/80 dark:bg-indigo-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-200">
                {config.badge}
              </span>
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{config.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{config.subtitle}</p>
              </div>
            </header>

            <section className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {config.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.detail}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold tracking-wide text-gray-500 dark:text-gray-400">Schedule</p>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{config.scheduleTitle}</h2>
                  </div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">Synced to calendar</span>
                </div>
                <ul className="mt-5 space-y-4">
                  {config.schedule.map((slot) => (
                    <li key={slot.title} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{slot.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{slot.context}</p>
                        </div>
                        <span className="rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200 px-3 py-1 text-xs font-semibold">{slot.badge}</span>
                      </div>
                      <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">{slot.time}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                  <p className="text-xs uppercase font-semibold tracking-wide text-gray-500 dark:text-gray-400">Quick actions</p>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Do more with one click</h2>
                </div>
                <div className="mt-5 space-y-4">
                  {config.quickActions.map((action) => (
                    <button
                      key={action.label}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        action.tone === 'primary'
                          ? 'bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent shadow-lg shadow-indigo-500/30 hover:opacity-95'
                          : 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-indigo-200 dark:hover:border-indigo-400'
                      }`}
                    >
                      <p className="text-sm font-semibold">{action.label}</p>
                      <p className="text-xs">{action.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  )
}
