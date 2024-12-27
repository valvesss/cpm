"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Layout from "@/components/Layout"
import { ChevronLeft } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PlayersPage() {
  const [players, setPlayers] = useState<string[]>([])
  const [newPlayer, setNewPlayer] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch players');
      }
      setPlayers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load players. Please try again.');
      console.error('Error fetching players:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    if (newPlayer && !players.includes(newPlayer)) {
      setError(null)
      try {
        const response = await fetch('/api/players', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newPlayer }),
        })
        if (!response.ok) {
          throw new Error('Failed to add player')
        }
        const updatedPlayers = await response.json()
        setPlayers(updatedPlayers)
        setNewPlayer("")
      } catch (err) {
        setError('Failed to add player. Please try again.')
        console.error('Error adding player:', err)
      }
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddPlayer()
    }
  }

  const handleRemovePlayer = async (playerToRemove: string) => {
    setError(null)
    try {
      const response = await fetch('/api/players', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: playerToRemove }),
      })
      if (!response.ok) {
        throw new Error('Failed to remove player')
      }
      const updatedPlayers = await response.json()
      setPlayers(updatedPlayers)
    } catch (err) {
      setError('Failed to remove player. Please try again.')
      console.error('Error removing player:', err)
    }
  }

  return (
    <Layout
      navigation={
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
            <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className="sr-only">Back to Home</span>
          </Button>
        </Link>
      }
    >
      <div className="grid gap-6 sm:gap-8">
        <h2 className="text-xl sm:text-2xl font-semibold">Manage Players</h2>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              type="text"
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter player name"
              className="flex-grow"
            />
            <Button 
              onClick={handleAddPlayer} 
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              disabled={isLoading}
            >
              Add Player
            </Button>
          </div>
          {isLoading ? (
            <p>Loading players...</p>
          ) : (
            <ul className="space-y-2">
              {players.map((player) => (
                <li key={player} className="flex justify-between items-center border p-2 rounded">
                  <span className="text-sm sm:text-base">{player}</span>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRemovePlayer(player)}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}

