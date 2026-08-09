'use client'

import { useState } from 'react'
import { GamePlayer } from '@/types'
import { Button } from '@/components/ui/button'

interface EliminationModalProps {
  player: GamePlayer
  activePlayers: GamePlayer[]
  onConfirm: (killer: string) => void
  onCancel: () => void
}

export function EliminationModal({ player, activePlayers, onConfirm, onCancel }: EliminationModalProps) {
  const [killer, setKiller] = useState<string>('')

  const killerOptions = activePlayers.filter(p => p.name !== player.name)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-stone-900 border border-orange-500/30 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-1">💀 {player.name} is out</h2>
        <p className="text-stone-400 text-sm mb-4">Who delivered the final blow?</p>

        <div className="grid grid-cols-2 gap-2 mb-4 max-h-48 overflow-y-auto">
          {killerOptions.map(p => (
            <button
              key={p.name}
              onClick={() => setKiller(p.name)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                killer === p.name
                  ? 'bg-orange-500 text-white'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={() => setKiller('N/A')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors col-span-2 ${
              killer === 'N/A'
                ? 'bg-stone-600 text-white'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
            }`}
          >
            Unknown / N/A
          </button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 border-stone-700 text-stone-300 hover:bg-stone-800" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!killer}
            onClick={() => killer && onConfirm(killer)}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
