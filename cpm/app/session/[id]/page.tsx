"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import RecordHand from "@/components/RecordHand"
import Layout from "@/components/Layout"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft } from 'lucide-react'

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

interface Hand {
  actions: HandAction[]
  scores: { [key: string]: number }
  transactions: PointTransaction[]
}

interface Session {
  id: string
  date: string
  players: string[]
  hands: Hand[]
}

export default function SessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null)
  const [finalScores, setFinalScores] = useState<{ [key: string]: number }>({})
  const [finalTransactions, setFinalTransactions] = useState<PointTransaction[]>([])

  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]')
    const currentSession = sessions.find((s: Session) => s.id === params.id)
    setSession(currentSession || null)
    if (currentSession) {
      calculateFinalScores(currentSession)
    }
  }, [params.id])

  const calculateFinalScores = (session: Session) => {
    const totalScores: { [key: string]: number } = {}
    
    // Initialize scores for all players
    session.players.forEach(player => {
      totalScores[player] = 0
    })

    // Sum up all scores from hands
    if (session.hands && Array.isArray(session.hands)) {
      session.hands.forEach(hand => {
        if (hand.scores) {
          Object.entries(hand.scores).forEach(([player, score]) => {
            if (session.players.includes(player)) {
              totalScores[player] = (totalScores[player] || 0) + score
            }
          })
        }
      })
    }

    setFinalScores(totalScores)

    // Calculate simplified final transactions
    const sortedPlayers = Object.entries(totalScores)
      .filter(([player]) => session.players.includes(player))
      .filter(([_, score]) => score !== 0) // Remove players with 0 points
      .sort(([, a], [, b]) => a - b) // Sort by score ascending (negative to positive)

    const newTransactions: PointTransaction[] = []

    // Find players with negative and positive scores
    const debtors = sortedPlayers.filter(([_, score]) => score < 0)
    const creditors = sortedPlayers.filter(([_, score]) => score > 0)

    // For each debtor, distribute their debt proportionally to creditors
    debtors.forEach(([debtorName, debtorScore]) => {
      const absDebt = Math.abs(debtorScore)
      const totalCredits = creditors.reduce((sum, [_, score]) => sum + score, 0)
      
      creditors.forEach(([creditorName, creditorScore]) => {
        // Calculate proportion of debt this creditor should receive
        const proportion = creditorScore / totalCredits
        const points = Math.round(absDebt * proportion)
        
        if (points > 0) {
          newTransactions.push({
            from: debtorName,
            to: creditorName,
            points
          })
        }
      })
    })

    setFinalTransactions(newTransactions)
  }

  const handleHandSubmitted = () => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]')
    const updatedSession = sessions.find((s: Session) => s.id === params.id)
    setSession(updatedSession || null)
    if (updatedSession) {
      calculateFinalScores(updatedSession)
    }
  }

  if (!session) {
    return (
      <Layout 
        navigation={
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
        }
      >
        <div>Session not found</div>
      </Layout>
    )
  }

  return (
    <Layout
      navigation={
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
      }
    >
      <div className="grid gap-8">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold">Session Details</h2>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="mb-2"><strong>Date:</strong> {session.date}</p>
          <p className="mb-4"><strong>Players:</strong> {session.players.join(", ")}</p>
          <RecordHand players={session.players.map(name => ({ name }))} onHandSubmitted={handleHandSubmitted} />
        </div>
        {session.hands && session.hands.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Hand History</h3>
            <ScrollArea className="h-[400px]">
              <ul className="space-y-6">
                {session.hands.map((hand, index) => (
                  <li key={index} className="border-b pb-4">
                    <h4 className="font-semibold mb-2">Hand {index + 1}:</h4>
                    {hand.actions && hand.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="mb-1">
                        {action.giver} → {action.owner}: {action.points} points
                      </div>
                    ))}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Final Results</h3>
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Final Scores:</h4>
            {session.players.map((player) => (
              <div key={player}>
                {player}: {finalScores[player] || 0} points
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Final Transactions:</h4>
            {finalTransactions.map((transaction, index) => (
              <div key={index} className="text-lg">
                {transaction.from} → {transaction.points} → {transaction.to}
              </div>
            ))}
            {finalTransactions.length === 0 && (
              <div className="text-gray-500">No transactions needed (all scores are 0)</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

