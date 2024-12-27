"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { v4 as uuidv4 } from 'uuid'

export default function CreateSessionForm() {
  const [allPlayers, setAllPlayers] = useState<string[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const storedPlayers = JSON.parse(localStorage.getItem('players') || '[]')
    setAllPlayers(storedPlayers)
  }, [])

  const handlePlayerToggle = (playerName: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerName)
        ? prev.filter(name => name !== playerName)
        : [...prev, playerName]
    )
  }

  const handleCreateSession = () => {
    if (selectedPlayers.length >= 2) {
      const newSession = {
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0],
        players: selectedPlayers,
        hands: []
      }
      const existingSessions = JSON.parse(localStorage.getItem('sessions') || '[]')
      localStorage.setItem('sessions', JSON.stringify([...existingSessions, newSession]))
      router.push(`/session/${newSession.id}`)
    }
  }

  return (
    <div className="mt-2 sm:mt-4">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Create New Session</h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Select Players:</h3>
        {allPlayers.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">No players available. Add players in the Manage Players section.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allPlayers.map((player) => (
              <div key={player} className="flex items-center space-x-2">
                <Checkbox
                  id={player}
                  checked={selectedPlayers.includes(player)}
                  onCheckedChange={() => handlePlayerToggle(player)}
                />
                <label htmlFor={player} className="text-sm sm:text-base">{player}</label>
              </div>
            ))}
          </div>
        )}
      </div>
      <Button 
        onClick={handleCreateSession} 
        disabled={selectedPlayers.length < 2}
        className="w-full sm:w-auto"
      >
        Create Session
      </Button>
    </div>
  )
}

