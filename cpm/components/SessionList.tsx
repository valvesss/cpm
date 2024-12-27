"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Session {
  id: string
  date: string
  players: string[]
}

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    const loadSessions = () => {
      const storedSessions = JSON.parse(localStorage.getItem('sessions') || '[]')
      setSessions(storedSessions)
    }

    loadSessions()
    window.addEventListener('focus', loadSessions)
    return () => {
      window.removeEventListener('focus', loadSessions)
    }
  }, [])

  return (
    <div className="mt-4 sm:mt-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Sessions</h2>
      {sessions.length === 0 ? (
        <p className="text-gray-500 text-sm sm:text-base">No sessions yet. Create one to get started!</p>
      ) : (
        <ul className="space-y-2 sm:space-y-3">
          {sessions.map((session) => (
            <li key={session.id} className="border p-3 sm:p-4 rounded-lg">
              <Link href={`/session/${session.id}`} className="block">
                <span className="text-blue-600 hover:underline text-sm sm:text-base">
                  {session.date} - {session.players.join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

