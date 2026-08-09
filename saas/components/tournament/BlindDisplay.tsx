'use client'

import { TemplateRound } from '@/types'
import { formatBlind, formatTime } from '@/lib/utils'

interface BlindDisplayProps {
  currentRound: TemplateRound
  nextRound: TemplateRound | null
  timeLeft: number
  timerRunning: boolean
}

export function BlindDisplay({ currentRound, nextRound, timeLeft, timerRunning }: BlindDisplayProps) {
  const isBreak = currentRound.is_break
  const isTest = currentRound.is_test

  return (
    <div className="text-center">
      {/* Round name */}
      <div className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isBreak ? 'text-blue-400' : isTest ? 'text-yellow-400' : 'text-orange-400'}`}>
        {currentRound.name}
      </div>

      {/* Blinds */}
      {!isBreak && !isTest && (
        <div className="text-3xl font-black text-white mb-1 tabular-nums">
          {formatBlind(currentRound.small_blind)} / {formatBlind(currentRound.big_blind)}
        </div>
      )}
      {isBreak && (
        <div className="text-2xl font-black text-blue-300 mb-1">☕ BREAK</div>
      )}
      {isTest && (
        <div className="text-2xl font-black text-yellow-300 mb-1">⚡ TEST</div>
      )}

      {/* Timer */}
      <div className={`text-5xl font-black tabular-nums mb-2 ${
        timeLeft <= 60 && timerRunning ? 'text-red-400 animate-pulse' : 'text-white'
      }`}>
        {formatTime(timeLeft)}
      </div>

      {/* Next round preview */}
      {nextRound && (
        <div className="text-xs text-stone-400">
          Next: {nextRound.is_break ? '☕ Break' : `${formatBlind(nextRound.small_blind)}/${formatBlind(nextRound.big_blind)}`}
          {' '}· {nextRound.duration_minutes}min
        </div>
      )}
    </div>
  )
}
