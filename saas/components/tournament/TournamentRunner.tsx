'use client'

import { useEffect, useCallback } from 'react'
import { useTournamentStore } from '@/store/tournament'
import { Template, TemplateRound, TournamentState, SmartHomeConfig } from '@/types'
import { PlayerTable } from './PlayerTable'
import { TimerPanel } from './TimerPanel'
import { FireRoundsGate } from './FireRoundsGate'
import { calculatePrizes, getActivePlayers } from '@/lib/tournament-engine'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface TournamentRunnerProps {
  initialState: TournamentState
  template: Template
  rounds: TemplateRound[]
  tournamentId: string
  smartHomeConfig: SmartHomeConfig | null
}

export function TournamentRunner({
  initialState,
  template,
  rounds,
  tournamentId,
  smartHomeConfig,
}: TournamentRunnerProps) {
  const router = useRouter()
  const store = useTournamentStore()
  const { state, timerRunning, pendingWinner } = store

  useEffect(() => {
    store.initialize(initialState, template, rounds, tournamentId, smartHomeConfig)
    return () => store.reset()
  }, [tournamentId])

  // Keyboard shortcut: Ctrl+Z to undo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        store.undo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!state) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-stone-400">Loading tournament...</div>
      </div>
    )
  }

  const currentRound = rounds[state.currentRoundPosition]
  const nextRound = rounds[state.currentRoundPosition + 1] ?? null
  const activePlayers = getActivePlayers(state)
  const prizes = calculatePrizes(state, template)
  const isBreak = currentRound?.is_break ?? false

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-stone-50">
        {/* Header */}
        <div className="bg-white border-b border-orange-100 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-stone-800">{state.tournamentName}</h1>
            <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
              <span>{activePlayers.length} players active</span>
              {state.isMajor && <span className="text-orange-500 font-semibold">⭐ Major</span>}
              {state.tournamentEnded && <span className="text-green-600 font-semibold">✓ Completed</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {state.tournamentEnded && (
              <Button size="sm" onClick={() => router.push(`/tournaments/${tournamentId}/results`)}>
                View Results →
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => router.push('/tournaments')}>
              ← Tournaments
            </Button>
          </div>
        </div>

        {/* Player table */}
        <div className="p-4">
          <PlayerTable
            players={state.players}
            template={template}
            godMode={state.godMode}
            isBreak={isBreak}
            tournamentStarted={state.tournamentStarted}
            tournamentEnded={state.tournamentEnded}
            onEliminate={store.eliminate}
            onRebuy={store.rebuy}
            onAddon={store.addon}
            onGodKill={store.godKillPlayer}
            onGodRevive={store.godRevivePlayer}
            onAdjustStack={store.adjustPlayerStack}
          />
        </div>
      </div>

      {/* Timer sidebar */}
      <div className="w-72 shrink-0 border-l border-stone-700 overflow-y-auto">
        <TimerPanel
          currentRound={currentRound}
          nextRound={nextRound}
          timeLeft={state.timeLeft}
          timerRunning={timerRunning}
          inFireRounds={state.inFireRounds}
          totalPlayers={state.players.length}
          activePlayers={activePlayers.length}
          grossPot={prizes.grossPot}
          firstPrize={prizes.firstPrize}
          secondPrize={prizes.secondPrize}
          killFeed={state.killFeed}
          godMode={state.godMode}
          canGoPrev={state.currentRoundPosition > 0}
          tournamentStarted={state.tournamentStarted}
          tournamentEnded={state.tournamentEnded}
          onStart={store.startTimer}
          onPause={store.pauseTimer}
          onSkip={store.skipRound}
          onPrev={store.goToPrevRound}
          onToggleGodMode={store.toggleGodMode}
          onUndo={store.undo}
        />
      </div>

      {/* Fire rounds gate */}
      {state.inFireRounds && !state.tournamentEnded && (
        <FireRoundsGate
          totalFireRounds={template.fire_rounds_count}
          completedFireRounds={state.fireRoundsDone}
          onComplete={store.completeFireRound}
          onSkipToBreak={store.skipRound}
        />
      )}

      {/* Winner modal */}
      {pendingWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative bg-stone-900 border-2 border-yellow-500 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-black text-yellow-400 mb-2">We have a winner!</h2>
            <p className="text-3xl font-bold text-white mb-2">{pendingWinner}</p>
            <p className="text-stone-400 text-sm mb-6">Prize: {formatCurrency(prizes.firstPrize)}</p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 text-stone-400"
                onClick={store.dismissWinner}
              >
                Continue playing
              </Button>
              <Button
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-stone-900 font-bold"
                onClick={() => store.confirmWinner(pendingWinner)}
              >
                End Tournament
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
