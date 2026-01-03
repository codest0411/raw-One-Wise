'use client'

import Link from 'next/link'

export default function Home() {

  return (
    <main className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(80,70,255,0.35),transparent_45%)]" />
      <div className="absolute inset-y-0 right-0 w-full md:w-1/2 bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.25),transparent_55%)] blur-3xl opacity-60" />

      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              OneWise
            </h1>
            <p className="text-xl md:text-2xl text-white/80">
              Real-time mentorship platform with video conferencing and collaborative coding
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">For Mentors</h2>
              <p className="text-white/70 mb-6">Create sessions, share knowledge, and guide students</p>
              <div className="space-y-3">
                <Link 
                  href="/auth/mentor/login"
                  className="block w-full px-6 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Mentor Login
                </Link>
                <Link 
                  href="/auth/mentor/signup"
                  className="block w-full px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all"
                >
                  Mentor Signup
                </Link>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">For Students</h2>
              <p className="text-white/70 mb-6">Join sessions, learn, and grow your skills</p>
              <div className="space-y-3">
                <Link 
                  href="/auth/student/login"
                  className="block w-full px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all"
                >
                  Student Login
                </Link>
                <Link 
                  href="/auth/student/signup"
                  className="block w-full px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all"
                >
                  Student Signup
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-white/60 text-sm">
              Experience real-time video conferencing, collaborative code editing with Monaco, and seamless mentorship
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
