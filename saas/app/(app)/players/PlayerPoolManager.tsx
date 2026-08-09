'use client'

import { useState } from 'react'
import { Player } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface PlayerPoolManagerProps {
  initialPlayers: Player[]
  maxPlayers: number
  isPro: boolean
}

export function PlayerPoolManager({ initialPlayers, maxPlayers, isPro }: PlayerPoolManagerProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const canAdd = players.length < maxPlayers

  async function addPlayer() {
    const name = newName.trim()
    if (!name) return
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError('A player with this name already exists')
      return
    }

    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error: err } = await supabase
      .from('players')
      .insert({ user_id: user!.id, name })
      .select()
      .single()

    if (err) {
      setError(err.message)
    } else {
      setPlayers(p => [...p, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
    }
    setLoading(false)
  }

  async function removePlayer(id: string) {
    const { error: err } = await supabase.from('players').delete().eq('id', id)
    if (!err) {
      setPlayers(p => p.filter(pl => pl.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>
      )}

      <Card>
        <CardHeader><CardTitle>Add Player</CardTitle></CardHeader>
        <CardContent>
          {!canAdd && !isPro ? (
            <div className="text-center py-3">
              <p className="text-stone-500 text-sm mb-2">Free tier is limited to 10 players.</p>
              <Link href="/pricing"><Button variant="pro" size="sm">Upgrade for unlimited players</Button></Link>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Player name"
                onKeyDown={e => e.key === 'Enter' && addPlayer()}
                disabled={!canAdd}
              />
              <Button onClick={addPlayer} disabled={loading || !newName.trim() || !canAdd}>
                {loading ? '...' : 'Add'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{players.length} Player{players.length !== 1 ? 's' : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-4">No players yet. Add your first regular player above.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {players.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2 group"
                >
                  <span className="text-sm font-medium text-stone-700">{p.name}</span>
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
