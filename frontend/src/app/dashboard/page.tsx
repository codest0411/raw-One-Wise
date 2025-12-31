'use client'

import React, { useState } from 'react'
import Sidebar from '../../../components/sidebar/Sidebar'

export default function DashboardPage() {
  const [role, setRole] = useState<'mentor' | 'student'>('mentor')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="md:flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <header className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{role === 'mentor' ? 'Mentor' : 'Student'} Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Overview of recent activity and upcoming sessions.</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRole('mentor')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${role === 'mentor' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
                >
                  Mentor
                </button>
                <button
                  onClick={() => setRole('student')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${role === 'student' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
                >
                  Student
                </button>
              </div>
            </header>

            <section className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-6">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Upcoming Sessions</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">3</p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Active {role === 'mentor' ? 'Students' : 'Mentors'}</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{role === 'mentor' ? '12' : '1'}</p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Profile Completeness</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">78%</p>
              </div>
            </section>

            <section className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Session Schedule</h2>
                <ul className="mt-4 space-y-3">
                  <li className="p-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Intro to React</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Tomorrow, 10:00 AM</div>
                      </div>
                      <div className="text-xs text-indigo-600 font-medium">{role === 'mentor' ? 'Mentoring' : 'Attending'}</div>
                    </div>
                  </li>
                  <li className="p-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Design Review</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">In 2 days, 3:00 PM</div>
                      </div>
                      <div className="text-xs text-indigo-600 font-medium">Scheduled</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Quick Actions</h2>
                <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
                  <button className="px-4 py-2 rounded-md bg-indigo-600 text-white">Create Session</button>
                  <button className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">View Calendar</button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
