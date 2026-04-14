'use client'

import { useState } from 'react'
import { GamePlayer, Template } from '@/types'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { EliminationModal } from './EliminationModal'

interface PlayerTableProps {
  players: GamePlayer[]
  template: Template
  godMode: boolean
  isBreak: boolean
  tournamentStarted: boolean
  tournamentEnded: boolean
  onEliminate: (playerName: string, killerName: string) => void
  onRebuy: (playerName: string) => void
  onAddon: (playerName: string) => void
  onGodKill: (name: string) => void
  onGodRevive: (name: string) => void
  onAdjustStack: (name: string, delta: number) => void
}

export function PlayerTable({
  players,
  template,
  godMode,
  isBreak,
  tournamentStarted,
  tournamentEnded,
  onEliminate,
  onRebuy,
  onAddon,
  onGodKill,
  onGodRevive,
  onAdjustStack,
}: PlayerTableProps) {
  const [eliminatingPlayer, setEliminatingPlayer] = useState<GamePlayer | null>(null)

  const activePlayers = players.filter(p => !p.isEliminated)
  const sortedPlayers = [
    ...players.filter(p => !p.isEliminated),
    ...players.filter(p => p.isEliminated).sort((a, b) => (b.eliminatedAt ?? 0) - (a.eliminatedAt ?? 0)),
  ]

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-orange-100 text-stone-500 text-xs uppercase tracking-wide">
              <th className="text-left py-2 px-3">Player</th>
              <th className="text-center py-2 px-2">Stacks</th>
              <th className="text-center py-2 px-2">Paid</th>
              <th className="text-center py-2 px-2">Status</th>
              {isBreak && template.allow_addons && <th className="text-center py-2 px-2">Add-on</th>}
              {!tournamentEnded && <th className="text-center py-2 px-2">Actions</th>}
              {godMode && <th className="text-center py-2 px-2">God</th>}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map(player => (
              <tr
                key={player.name}
                className={`border-b border-stone-100 transition-colors ${
                  player.isEliminated ? 'opacity-50 bg-stone-50' : 'hover:bg-orange-50/30'
                }`}
              >
                <td className="py-2.5 px-3 font-medium">
                  <div className="flex items-center gap-2">
                    <span className={player.isEliminated ? 'line-through text-stone-400' : 'text-stone-800'}>
                      {player.name}
                    </span>
                    {player.rebuyCount > 0 && (
                      <span className="text-xs text-orange-400">🔥×{player.rebuyCount}</span>
                    )}
                  </div>
                  {player.eliminatedBy && player.isEliminated && (
                    <div className="text-xs text-stone-400">by {player.eliminatedBy}</div>
                  )}
                </td>

                <td className="text-center py-2.5 px-2">
                  <div className="flex items-center justify-center gap-1">
                    {godMode && (
                      <button onClick={() => onAdjustStack(player.name, -1)} className="text-stone-400 hover:text-red-500 text-xs w-5">−</button>
                    )}
                    <span className="font-mono font-medium text-stone-700">{player.stacks}</span>
                    {godMode && (
                      <button onClick={() => onAdjustStack(player.name, 1)} className="text-stone-400 hover:text-green-500 text-xs w-5">+</button>
                    )}
                  </div>
                </td>

                <td className="text-center py-2.5 px-2 text-stone-600 font-mono text-xs">
                  {formatCurrency(player.totalPaid)}
                </td>

                <td className="text-center py-2.5 px-2">
                  {player.isEliminated ? (
                    <span className="text-xs text-red-500 font-medium">💀 Out</span>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">✓ In</span>
                  )}
                </td>

                {isBreak && template.allow_addons && (
                  <td className="text-center py-2.5 px-2">
                    {!player.isEliminated && !player.hasAddon ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs"
                        onClick={() => onAddon(player.name)}
                      >
                        ➕ Add-on
                      </Button>
                    ) : player.hasAddon ? (
                      <span className="text-xs text-green-600">✓ Done</span>
                    ) : null}
                  </td>
                )}

                {!tournamentEnded && (
                  <td className="text-center py-2.5 px-2">
                    <div className="flex items-center justify-center gap-1">
                      {!player.isEliminated && tournamentStarted && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() => setEliminatingPlayer(player)}
                        >
                          Eliminate
                        </Button>
                      )}
                      {player.isEliminated && template.allow_rebuys && !isBreak && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 text-xs"
                          onClick={() => onRebuy(player.name)}
                        >
                          🔥 Rebuy
                        </Button>
                      )}
                    </div>
                  </td>
                )}

                {godMode && (
                  <td className="text-center py-2.5 px-2">
                    <div className="flex items-center justify-center gap-1">
                      {!player.isEliminated && (
                        <button
                          onClick={() => onGodKill(player.name)}
                          className="text-xs text-red-400 hover:text-red-600 px-1"
                          title="God Kill"
                        >
                          ⚡💀
                        </button>
                      )}
                      {player.isEliminated && (
                        <button
                          onClick={() => onGodRevive(player.name)}
                          className="text-xs text-green-400 hover:text-green-600 px-1"
                          title="God Revive"
                        >
                          ⚡✨
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {eliminatingPlayer && (
        <EliminationModal
          player={eliminatingPlayer}
          activePlayers={activePlayers}
          onConfirm={(killer) => {
            onEliminate(eliminatingPlayer.name, killer)
            setEliminatingPlayer(null)
          }}
          onCancel={() => setEliminatingPlayer(null)}
        />
      )}
    </>
  )
}
