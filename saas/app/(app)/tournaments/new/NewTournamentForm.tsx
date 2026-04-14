'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Template, Player, SubscriptionTier, TournamentState } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDuration } from '@/lib/utils'
import { initTournamentState } from '@/lib/tournament-engine'

interface NewTournamentFormProps {
  templates: Template[]
  players: Player[]
  tier: SubscriptionTier
}

export function NewTournamentForm({ templates, players, tier }: NewTournamentFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [isMajor, setIsMajor] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id ?? '')
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([])
  const [customPlayerName, setCustomPlayerName] = useState('')
  const [customPlayers, setCustomPlayers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
  const systemTemplates = templates.filter(t => t.is_system)
  const userTemplates = templates.filter(t => !t.is_system)

  const allPlayerNames = [
    ...players.map(p => p.name),
    ...customPlayers.filter(n => !players.some(p => p.name === n)),
  ]

  const allSelected = [...selectedPlayerNames, ...customPlayers.filter(n => selectedPlayerNames.includes(n))]
  const selectedNames = selectedPlayerNames

  function togglePlayer(name: string) {
    setSelectedPlayerNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  function addCustomPlayer() {
    const n = customPlayerName.trim()
    if (!n) return
    if (!customPlayers.includes(n) && !players.some(p => p.name === n)) {
      setCustomPlayers(prev => [...prev, n])
      setSelectedPlayerNames(prev => [...prev, n])
    }
    setCustomPlayerName('')
  }

  const isFreeLimitHit = tier === 'free' && userTemplates.length >= 1

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTemplate || selectedPlayerNames.length < 2) return

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const rounds = (selectedTemplate as any).template_rounds ?? []

      const initialState = initTournamentState(
        selectedTemplate,
        selectedPlayerNames,
        name || selectedTemplate.name,
        isMajor
      )

      const { data: tournament, error: err } = await supabase
        .from('tournaments')
        .insert({
          user_id: user!.id,
          template_id: selectedTemplate.id,
          name: name || selectedTemplate.name,
          is_major: isMajor,
          status: 'pending',
          game_state: initialState,
        })
        .select()
        .single()

      if (err || !tournament) throw err ?? new Error('Failed to create tournament')

      // Insert tournament players
      await supabase.from('tournament_players').insert(
        selectedPlayerNames.map(pName => {
          const poolPlayer = players.find(p => p.name === pName)
          return {
            tournament_id: tournament.id,
            player_pool_id: poolPlayer?.id ?? null,
            name: pName,
            stacks: 1,
            total_paid: selectedTemplate.buy_in_amount,
          }
        })
      )

      // Log start event
      await supabase.from('tournament_events').insert({
        tournament_id: tournament.id,
        event_type: 'start',
        player_name: null,
        metadata: { player_count: selectedPlayerNames.length },
        elapsed_minutes: 0,
      })

      router.push(`/tournaments/${tournament.id}`)
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>
      )}

      {/* Tournament name */}
      <Card>
        <CardHeader><CardTitle>Tournament Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1.5">Name (optional)</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={selectedTemplate?.name ?? 'Tournament name'}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isMajor"
              checked={isMajor}
              onChange={e => setIsMajor(e.target.checked)}
              className="h-4 w-4 accent-orange-500"
            />
            <label htmlFor="isMajor" className="text-sm font-medium text-stone-700">
              Major tournament <span className="text-stone-400 font-normal">(2× points, 2× killer bonus)</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Template selection */}
      <Card>
        <CardHeader><CardTitle>Structure Template</CardTitle></CardHeader>
        <CardContent>
          {systemTemplates.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wide mb-2">Pre-made</p>
              <div className="grid gap-2">
                {systemTemplates.map(t => (
                  <label
                    key={t.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplateId === t.id
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-stone-200 hover:border-orange-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={t.id}
                      checked={selectedTemplateId === t.id}
                      onChange={() => setSelectedTemplateId(t.id)}
                      className="mt-0.5 accent-orange-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-800 text-sm">{t.name}</div>
                      {t.description && <div className="text-xs text-stone-500 mt-0.5">{t.description}</div>}
                      <div className="flex gap-3 mt-1.5 text-xs text-stone-400">
                        <span>Buy-in: {formatCurrency(t.buy_in_amount)}</span>
                        {t.allow_rebuys && <span>Rebuys ✓</span>}
                        {t.allow_addons && <span>Add-ons ✓</span>}
                        {t.fire_rounds_count > 0 && <span>🔥 Rounds of Fire</span>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {userTemplates.length > 0 && (
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wide mb-2">Your Templates</p>
              <div className="grid gap-2">
                {userTemplates.map(t => (
                  <label
                    key={t.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplateId === t.id
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-stone-200 hover:border-orange-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={t.id}
                      checked={selectedTemplateId === t.id}
                      onChange={() => setSelectedTemplateId(t.id)}
                      className="mt-0.5 accent-orange-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-800 text-sm flex items-center gap-2">
                        {t.name}
                      </div>
                      {t.description && <div className="text-xs text-stone-500 mt-0.5">{t.description}</div>}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player selection */}
      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {players.length > 0 && (
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wide mb-2">Your Player Pool</p>
              <div className="grid grid-cols-3 gap-2">
                {players.map(p => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                      selectedPlayerNames.includes(p.name)
                        ? 'border-orange-400 bg-orange-50 text-orange-700 font-medium'
                        : 'border-stone-200 text-stone-600 hover:border-orange-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayerNames.includes(p.name)}
                      onChange={() => togglePlayer(p.name)}
                      className="accent-orange-500"
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom player */}
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wide mb-2">Add Guest</p>
            <div className="flex gap-2">
              <Input
                value={customPlayerName}
                onChange={e => setCustomPlayerName(e.target.value)}
                placeholder="Guest name"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomPlayer())}
              />
              <Button type="button" variant="outline" onClick={addCustomPlayer}>Add</Button>
            </div>
            {customPlayers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {customPlayers.map(n => (
                  <div key={n} className="flex items-center gap-1 bg-orange-100 text-orange-700 rounded-full px-3 py-1 text-xs font-medium">
                    {n}
                    <button type="button" onClick={() => {
                      setCustomPlayers(p => p.filter(x => x !== n))
                      setSelectedPlayerNames(p => p.filter(x => x !== n))
                    }} className="hover:text-red-500">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-stone-400">{selectedPlayerNames.length} player{selectedPlayerNames.length !== 1 ? 's' : ''} selected (minimum 2)</p>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="xl"
        className="w-full"
        disabled={loading || selectedPlayerNames.length < 2 || !selectedTemplateId}
      >
        {loading ? 'Creating...' : '🃏 Launch Tournament'}
      </Button>
    </form>
  )
}
