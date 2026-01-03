'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const channels = [
  { key: 'sessions', label: 'Session reminders' },
  { key: 'chat', label: 'Chat mentions' },
  { key: 'product', label: 'Product updates' },
  { key: 'billing', label: 'Billing alerts' },
]

const STORAGE_KEY = 'onewise_notification_settings'

const defaultSettings = Object.fromEntries(channels.map((c) => [c.key, { email: true, push: c.key !== 'product' }]))

export default function NotificationsPage() {
  const [settings, setSettings] = useState<Record<string, { email: boolean; push: boolean }>>(defaultSettings)
  const [digestEnabled, setDigestEnabled] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings((prev) => ({ ...prev, ...(parsed.settings ?? {}) }))
        if (typeof parsed.digest === 'boolean') setDigestEnabled(parsed.digest)
      }
    } catch (err) {
      console.warn('Failed to load notification settings', err)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, digest: digestEnabled }))
  }, [settings, digestEnabled])

  const toggle = (key: string, type: 'email' | 'push') => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], [type]: !prev[key][type] },
    }))
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 md:px-8 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard / Notifications</p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Notification settings</h1>
              <p className="text-gray-600 dark:text-gray-300">Choose which alerts reach your inbox or device.</p>
            </div>
            <Link
              href="/dashboard"
              className="self-start md:self-auto px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              Back to dashboard
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 space-y-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Channels</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Toggle per-notification email or push alerts.</p>
            </div>
            <button
              onClick={() => {
                const allMuted = Object.values(settings).every((s) => !s.email && !s.push)
                setSettings(
                  Object.fromEntries(
                    channels.map((c) => [c.key, { email: allMuted ? defaultSettings[c.key].email : false, push: allMuted ? defaultSettings[c.key].push : false }])
                  )
                )
              }}
              className="text-sm text-indigo-600 dark:text-indigo-300 font-semibold"
            >
              {Object.values(settings).every((s) => !s.email && !s.push) ? 'Unmute all' : 'Mute all'}
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {channels.map((channel) => (
              <div key={channel.key} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{channel.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {channel.key === 'sessions'
                      ? 'Upcoming sessions, cancellations, and reschedules.'
                      : channel.key === 'chat'
                        ? 'Direct mentions or replies in live chat.'
                        : channel.key === 'product'
                          ? 'Product improvements every few weeks.'
                          : 'Renewal reminders, receipts, and failed payments.'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={settings[channel.key].email}
                      onChange={() => toggle(channel.key, 'email')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Email
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={settings[channel.key].push}
                      onChange={() => toggle(channel.key, 'push')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Push
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 space-y-4 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Digest emails</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Receive a condensed summary of active mentees, session metrics, and outstanding tasks.
          </p>
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 dark:bg-gray-900 dark:border-gray-700">
            <span className="text-sm text-gray-700 dark:text-gray-200">Weekly mentor digest</span>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={digestEnabled}
                onChange={() => setDigestEnabled((prev) => !prev)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Enabled
            </label>
          </div>
        </section>
      </div>
    </main>
  )
}
