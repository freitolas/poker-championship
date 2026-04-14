'use client'

import { TemplateRound } from '@/types'
import { BlindDisplay } from './BlindDisplay'
import { KillFeed } from './KillFeed'
import { KillFeedEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface TimerPanelProps {
  currentRound: TemplateRound
  nextRound: TemplateRound | null
  timeLeft: number
  timerRunning: boolean
  inFireRounds: boolean
  totalPlayers: number
  activePlayers: number
  grossPot: number
  firstPrize: number
  secondPrize: number
  killFeed: KillFeedEntry[]
  godMode: boolean
  canGoPrev: boolean
  tournamentStarted: boolean
  tournamentEnded: boolean
  onStart: () => void
  onPause: () => void
  onSkip: () => void
  onPrev: () => void
  onToggleGodMode: () => void
  onUndo: () => void
}

export function TimerPanel({
  currentRound,
  nextRound,
  timeLeft,
  timerRunning,
  inFireRounds,
  totalPlayers,
  activePlayers,
  grossPot,
  firstPrize,
  secondPrize,
  killFeed,
  godMode,
  canGoPrev,
  tournamentStarted,
  tournamentEnded,
  onStart,
  onPause,
  onSkip,
  onPrev,
  onToggleGodMode,
  onUndo,
}: TimerPanelProps) {
  return (
    <div className="bg-stone-900 text-white h-full flex flex-col p-4 gap-4 min-w-[280px]">
      {/* God Mode Banner */}
      {godMode && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-3 py-1.5 text-center">
          <span className="text-yellow-400 text-xs font-bold">⚡ GOD MODE ACTIVE</span>
        </div>
      )}

      {/* Blind / Timer display */}
      <div className="bg-stone-800 rounded-xl p-4">
        <BlindDisplay
          currentRound={currentRound}
          nextRound={nextRound}
          timeLeft={timeLeft}
          timerRunning={timerRunning}
        />
      </div>

      {/* Timer controls */}
      {!tournamentEnded && (
        <div className="flex gap-2">
          {godMode && (
            <Button size="sm" variant="ghost" className="text-stone-400" onClick={onPrev} disabled={!canGoPrev}>
              ◀
            </Button>
          )}
          {timerRunning ? (
            <Button size="sm" variant="secondary" className="flex-1 bg-stone-700 hover:bg-stone-600 text-white" onClick={onPause}>
              ⏸ Pause
            </Button>
          ) : (
            <Button size="sm" className="flex-1" onClick={onStart} disabled={tournamentEnded || inFireRounds}>
              ▶ {timeLeft === currentRound.duration_minutes * 60 ? 'Start' : 'Resume'}
            </Button>
          )}
          <Button size="sm" variant="ghost" className="text-stone-400" onClick={onSkip} disabled={inFireRounds}>
            ▶▶
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-stone-800 rounded-lg p-2">
          <div className="text-xl font-bold text-orange-400">{activePlayers}</div>
          <div className="text-xs text-stone-400">Players left</div>
        </div>
        <div className="bg-stone-800 rounded-lg p-2">
          <div className="text-xl font-bold text-orange-400">{totalPlayers - activePlayers}</div>
          <div className="text-xs text-stone-400">Eliminated</div>
        </div>
      </div>

      {/* Prize info */}
      <div className="bg-stone-800 rounded-lg p-3 text-xs">
        <div className="text-stone-400 font-semibold uppercase tracking-wide mb-2">Prize Pool</div>
        <div className="flex justify-between text-stone-300 mb-1">
          <span>Gross pot</span>
          <span className="font-mono">{formatCurrency(grossPot)}</span>
        </div>
        <div className="flex justify-between text-yellow-400 font-bold">
          <span>🥇 1st</span>
          <span className="font-mono">{formatCurrency(firstPrize)}</span>
        </div>
        <div className="flex justify-between text-stone-400">
          <span>🥈 2nd</span>
          <span className="font-mono">{formatCurrency(secondPrize)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          className={`flex-1 text-xs ${godMode ? 'text-yellow-400 bg-yellow-500/10' : 'text-stone-400'}`}
          onClick={onToggleGodMode}
        >
          ⚡ God Mode
        </Button>
        <Button size="sm" variant="ghost" className="text-stone-500 text-xs" onClick={onUndo}>
          ↩ Undo
        </Button>
      </div>

      {/* Kill feed */}
      <div className="flex-1 overflow-hidden">
        <div className="text-xs text-stone-500 font-semibold uppercase tracking-wide mb-2">Events</div>
        <KillFeed entries={killFeed} />
      </div>
    </div>
  )
}
