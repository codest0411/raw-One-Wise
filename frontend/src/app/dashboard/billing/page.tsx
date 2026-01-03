'use client'

import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    price: '$0',
    description: 'Perfect for mentees getting started',
    perks: ['2 live sessions / month', 'Shared notes', 'Email support'],
    cta: 'Switch to Starter',
  },
  {
    name: 'Pro Mentor',
    price: '$89',
    description: 'For mentors running multiple cohorts',
    perks: ['Unlimited sessions', 'Realtime editor + video', 'Priority support'],
    cta: 'Current plan',
    highlight: true,
  },
  {
    name: 'Studio Teams',
    price: '$219',
    description: 'Studios & bootcamps with custom workflows',
    perks: ['Multi-mentor access', 'Custom branding', 'Dedicated CSM'],
    cta: 'Contact sales',
  },
]

const invoices = [
  { id: 'INV-1024', period: 'Nov 2025', amount: '$89', status: 'Paid' },
  { id: 'INV-1023', period: 'Oct 2025', amount: '$89', status: 'Paid' },
  { id: 'INV-1022', period: 'Sep 2025', amount: '$89', status: 'Paid' },
]

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 md:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard / Billing</p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Billing & plans</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your subscription, invoices, and payment methods.</p>
            </div>
            <Link
              href="/dashboard"
              className="self-start md:self-auto px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              Back to dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-4">
          <div className="rounded-2xl border border-indigo-200 bg-white px-6 py-4 dark:bg-gray-800 dark:border-indigo-900/60">
            <p className="text-sm text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">Current plan</p>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-2">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Pro Mentor · Monthly</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Renews on Jan 15, 2026</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Update payment
                </button>
                <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
                  Cancel plan
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border px-6 py-6 space-y-4 ${
                plan.highlight
                  ? 'border-indigo-400 bg-white shadow-xl dark:bg-gray-800 dark:border-indigo-600'
                  : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700'
              }`}
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{plan.name}</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{plan.price}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <span className="text-emerald-500">•</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full rounded-xl px-4 py-2 text-sm font-semibold ${
                  plan.highlight
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Invoices</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Download receipts for your records.</p>
            </div>
            <button className="text-sm text-indigo-600 dark:text-indigo-300 font-semibold">Download all</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex flex-col md:flex-row md:items-center justify-between py-3 text-sm text-gray-700 dark:text-gray-200">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{invoice.id}</span>
                  <span className="text-gray-500 dark:text-gray-400">{invoice.period}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                  <span>{invoice.amount}</span>
                  <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 px-3 py-1 text-xs">{invoice.status}</span>
                  <button className="text-indigo-600 dark:text-indigo-300 font-medium">Download</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
