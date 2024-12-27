"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from 'lucide-react'

interface Player {
  name: string
}

interface PointTransaction {
  from: string
  to: string
  points: number
}

interface HandAction {
  giver: string
  owner: string
  points: number
}

interface RecordHandProps {
  players: Player[]
  onHandSubmitted: () => void
}

export default function RecordHand({ players, onHandSubmitted }: RecordHandProps) {
  const [scores, setScores] = useState<{ [key: string]: number }>({})
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [pointsOnTop, setPointsOnTop] = useState<number>(0)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [handActions, setHandActions] = useState<HandAction[]>([])

  useEffect(() => {
    calculateFinalTransactions()
  }, [scores])

  const handlePlayerSelect = (index: number, playerName: string) => {
    setSelectedPlayers(prev => {
      const newSelected = [...prev]
      newSelected[index] = playerName
      return newSelected
    })
  }

  const handlePointsOnTopChange = (value: string) => {
    setPointsOnTop(value === '' ? 0 : parseInt(value) || 0)
  }

  const handleAddPoints = () => {
    if (selectedPlayers.length === 2 && pointsOnTop > 0) {
      const [giver, owner] = selectedPlayers
      setScores(prev => ({
        ...prev,
        [owner]: (prev[owner] || 0) + pointsOnTop,
        [giver]: (prev[giver] || 0) - pointsOnTop,
      }))
      setHandActions(prev => [...prev, {
        giver,
        owner,
        points: pointsOnTop
      }])
      setSelectedPlayers([])
      setPointsOnTop(0)
    }
  }

  const handleRemoveAction = (index: number) => {
    const actionToRemove = handActions[index]
    setHandActions(prev => prev.filter((_, i) => i !== index))
    setScores(prev => ({
      ...prev,
      [actionToRemove.owner]: prev[actionToRemove.owner] - actionToRemove.points,
      [actionToRemove.giver]: prev[actionToRemove.giver] + actionToRemove.points,
    }))
  }

  const calculateFinalTransactions = () => {
    const sortedPlayers = Object.entries(scores)
      .filter(([player]) => players.some(p => p.name === player))
      .sort(([, a], [, b]) => b - a)
    
    const newTransactions: PointTransaction[] = []

    for (let i = 0; i < sortedPlayers.length - 1; i++) {
      const [fromPlayer, fromScore] = sortedPlayers[i]
      const [toPlayer, toScore] = sortedPlayers[i + 1]
      const points = Math.min(fromScore, -toScore)
      if (points > 0) {
        newTransactions.push({ from: toPlayer, to: fromPlayer, points })
      }
    }

    setTransactions(newTransactions)
  }

  const canAddMoreTransactions = handActions.length < 3

  const getAvailablePlayers = (isGiver: boolean) => {
    const [currentGiver, currentOwner] = selectedPlayers
    return players.filter(player => {
      if (isGiver) {
        return player.name !== currentOwner
      }
      return player.name !== currentGiver
    })
  }

  const handleSubmitHand = () => {
    // Allow submission with 0-3 transactions
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]')
    const sessionIndex = sessions.findIndex((s: any) => s.players.every((p: string) => players.some(player => player.name === p)))
    if (sessionIndex !== -1) {
      sessions[sessionIndex].hands = sessions[sessionIndex].hands || []
      sessions[sessionIndex].hands.push({
        actions: handActions,
        scores,
        transactions
      })
      localStorage.setItem('sessions', JSON.stringify(sessions))
    }
    
    onHandSubmitted()
    
    setScores({})
    setTransactions([])
    setHandActions([])
  }

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-semibold mb-2">Record Hand</h2>
      <div className="flex gap-2 mb-4">
        <Select onValueChange={(value) => handlePlayerSelect(0, value)} value={selectedPlayers[0] || ''}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select giver" />
          </SelectTrigger>
          <SelectContent>
            {getAvailablePlayers(true).map((player) => (
              <SelectItem key={player.name} value={player.name}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handlePlayerSelect(1, value)} value={selectedPlayers[1] || ''}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select owner" />
          </SelectTrigger>
          <SelectContent>
            {getAvailablePlayers(false).map((player) => (
              <SelectItem key={player.name} value={player.name}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          value={pointsOnTop === 0 ? '' : pointsOnTop}
          onChange={(e) => handlePointsOnTopChange(e.target.value)}
          placeholder="Points on top"
          className="w-[120px]"
        />
        <Button 
          onClick={handleAddPoints} 
          disabled={selectedPlayers.length !== 2 || pointsOnTop <= 0 || !canAddMoreTransactions}
        >
          Add Points
        </Button>
      </div>

      {handActions.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Current Hand Transactions:</h3>
          <ScrollArea className="h-24 rounded-md border p-2">
            {handActions.map((action, index) => (
              <div key={index} className="mb-1 flex items-center justify-between">
                <span>{action.giver} → {action.owner}: {action.points} points</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAction(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      <Button 
        onClick={handleSubmitHand}
      >
        Submit Hand
      </Button>
    </div>
  )
}

