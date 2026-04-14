'use client'

import { Button } from '@/components/ui/button'

interface FireRoundsGateProps {
  totalFireRounds: number
  completedFireRounds: number
  onComplete: () => void
  onSkipToBreak: () => void
}

export function FireRoundsGate({ totalFireRounds, completedFireRounds, onComplete, onSkipToBreak }: FireRoundsGateProps) {
  const allDone = completedFireRounds >= totalFireRounds

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none">
      <div className="bg-stone-900/95 border-t border-orange-500/50 w-full max-w-2xl mx-auto p-4 pointer-events-auto">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-orange-400 font-bold text-sm">🔥 Rounds of Fire</p>
            <p className="text-stone-400 text-xs">Complete all rebuy rounds before break</p>
            <div className="flex gap-2 mt-2">
              {Array.from({ length: totalFireRounds }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i < completedFireRounds ? 'bg-orange-500' : 'bg-stone-700'}`}
                />
              ))}
            </div>
            <p className="text-xs text-stone-500 mt-1">{completedFireRounds} / {totalFireRounds} complete</p>
          </div>
          <div className="flex flex-col gap-2">
            {!allDone && (
              <Button size="sm" onClick={onComplete} className="bg-orange-600 hover:bg-orange-700">
                🔥 Fire Round {completedFireRounds + 1} Done
              </Button>
            )}
            {allDone && (
              <Button size="sm" onClick={onSkipToBreak} className="bg-blue-600 hover:bg-blue-700">
                ☕ Proceed to Break
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
