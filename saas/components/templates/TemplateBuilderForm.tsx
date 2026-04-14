'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TemplateRound } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBlind } from '@/lib/utils'

interface RoundDraft extends Omit<TemplateRound, 'id' | 'template_id'> {
  tempId: string
}

const DEFAULT_ROUNDS: RoundDraft[] = [
  { tempId: '1', position: 0, name: 'Test Round', small_blind: 0, big_blind: 0, duration_minutes: 1, is_break: false, is_test: true },
  { tempId: '2', position: 1, name: 'Round 1', small_blind: 5, big_blind: 10, duration_minutes: 20, is_break: false, is_test: false },
  { tempId: '3', position: 2, name: 'Round 2', small_blind: 10, big_blind: 20, duration_minutes: 20, is_break: false, is_test: false },
  { tempId: '4', position: 3, name: 'Round 3', small_blind: 20, big_blind: 40, duration_minutes: 20, is_break: false, is_test: false },
  { tempId: '5', position: 4, name: 'Break', small_blind: 0, big_blind: 0, duration_minutes: 30, is_break: true, is_test: false },
  { tempId: '6', position: 5, name: 'Round 4', small_blind: 50, big_blind: 100, duration_minutes: 20, is_break: false, is_test: false },
]

interface TemplateBuilderFormProps {
  existingTemplate?: any
}

export function TemplateBuilderForm({ existingTemplate }: TemplateBuilderFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(existingTemplate?.name ?? '')
  const [description, setDescription] = useState(existingTemplate?.description ?? '')
  const [buyIn, setBuyIn] = useState(existingTemplate?.buy_in_amount ?? 500)
  const [rebuy, setRebuy] = useState(existingTemplate?.rebuy_amount ?? 500)
  const [addon, setAddon] = useState(existingTemplate?.addon_amount ?? 0)
  const [firstPct, setFirstPct] = useState(existingTemplate?.prize_first_pct ?? 80)
  const [secondPct, setSecondPct] = useState(existingTemplate?.prize_second_pct ?? 20)
  const [housePct, setHousePct] = useState(existingTemplate?.house_fee_pct ?? 10)
  const [startingChips, setStartingChips] = useState(existingTemplate?.starting_chips ?? 1000)
  const [allowRebuys, setAllowRebuys] = useState(existingTemplate?.allow_rebuys ?? true)
  const [allowAddons, setAllowAddons] = useState(existingTemplate?.allow_addons ?? true)
  const [fireRoundsCount, setFireRoundsCount] = useState(existingTemplate?.fire_rounds_count ?? 3)
  const [fireRoundsBeforeBreak, setFireRoundsBeforeBreak] = useState(existingTemplate?.fire_rounds_before_break ?? true)
  const [rounds, setRounds] = useState<RoundDraft[]>(
    existingTemplate?.template_rounds
      ? existingTemplate.template_rounds.map((r: any) => ({ ...r, tempId: r.id }))
      : DEFAULT_ROUNDS
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateRound(tempId: string, field: keyof RoundDraft, value: any) {
    setRounds(rs => rs.map(r => r.tempId === tempId ? { ...r, [field]: value } : r))
  }

  function addRound() {
    const pos = rounds.length
    const last = rounds.filter(r => !r.is_break && !r.is_test).pop()
    setRounds(rs => [...rs, {
      tempId: Date.now().toString(),
      position: pos,
      name: `Round ${pos}`,
      small_blind: last ? last.small_blind * 2 : 10,
      big_blind: last ? last.big_blind * 2 : 20,
      duration_minutes: last?.duration_minutes ?? 20,
      is_break: false,
      is_test: false,
    }])
  }

  function addBreak() {
    const pos = rounds.length
    setRounds(rs => [...rs, {
      tempId: Date.now().toString(),
      position: pos,
      name: 'Break',
      small_blind: 0,
      big_blind: 0,
      duration_minutes: 30,
      is_break: true,
      is_test: false,
    }])
  }

  function removeRound(tempId: string) {
    setRounds(rs => rs.filter(r => r.tempId !== tempId).map((r, i) => ({ ...r, position: i })))
  }

  function moveRound(tempId: string, dir: -1 | 1) {
    setRounds(rs => {
      const idx = rs.findIndex(r => r.tempId === tempId)
      if (idx + dir < 0 || idx + dir >= rs.length) return rs
      const next = [...rs]
      ;[next[idx], next[idx + dir]] = [next[idx + dir], next[idx]]
      return next.map((r, i) => ({ ...r, position: i }))
    })
  }

  async function handleSave() {
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      let templateId = existingTemplate?.id

      if (templateId) {
        await supabase.from('templates').update({
          name, description, buy_in_amount: buyIn, rebuy_amount: rebuy, addon_amount: addon,
          prize_first_pct: firstPct, prize_second_pct: secondPct, house_fee_pct: housePct,
          starting_chips: startingChips, allow_rebuys: allowRebuys, allow_addons: allowAddons,
          fire_rounds_count: fireRoundsCount, fire_rounds_before_break: fireRoundsBeforeBreak,
          updated_at: new Date().toISOString(),
        }).eq('id', templateId)
        await supabase.from('template_rounds').delete().eq('template_id', templateId)
      } else {
        const { data: tpl, error: tplErr } = await supabase.from('templates').insert({
          user_id: user!.id, name, description, is_system: false,
          buy_in_amount: buyIn, rebuy_amount: rebuy, addon_amount: addon,
          prize_first_pct: firstPct, prize_second_pct: secondPct, house_fee_pct: housePct,
          starting_chips: startingChips, allow_rebuys: allowRebuys, allow_addons: allowAddons,
          fire_rounds_count: fireRoundsCount, fire_rounds_before_break: fireRoundsBeforeBreak,
        }).select().single()
        if (tplErr || !tpl) throw tplErr
        templateId = tpl.id
      }

      await supabase.from('template_rounds').insert(
        rounds.map((r, i) => ({
          template_id: templateId,
          position: i,
          name: r.name,
          small_blind: r.small_blind,
          big_blind: r.big_blind,
          duration_minutes: r.duration_minutes,
          is_break: r.is_break,
          is_test: r.is_test,
        }))
      )

      router.push('/templates')
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save template')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>}

      {/* Basic info */}
      <Card>
        <CardHeader><CardTitle>Template Info</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="My Home Game" />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this structure..." />
          </div>
        </CardContent>
      </Card>

      {/* Financial settings */}
      <Card>
        <CardHeader><CardTitle>Buy-in & Prizes</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Buy-in (pence)</label>
            <Input type="number" value={buyIn} onChange={e => setBuyIn(+e.target.value)} min={0} />
            <span className="text-xs text-stone-400">{(buyIn / 100).toFixed(2)} currency units</span>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Rebuy (pence)</label>
            <Input type="number" value={rebuy} onChange={e => setRebuy(+e.target.value)} min={0} disabled={!allowRebuys} />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Add-on (pence)</label>
            <Input type="number" value={addon} onChange={e => setAddon(+e.target.value)} min={0} disabled={!allowAddons} />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Starting chips</label>
            <Input type="number" value={startingChips} onChange={e => setStartingChips(+e.target.value)} min={100} />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">1st place %</label>
            <Input type="number" value={firstPct} onChange={e => setFirstPct(+e.target.value)} min={0} max={100} />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">2nd place %</label>
            <Input type="number" value={secondPct} onChange={e => setSecondPct(+e.target.value)} min={0} max={100} />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">House fee %</label>
            <Input type="number" value={housePct} onChange={e => setHousePct(+e.target.value)} min={0} max={50} />
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card>
        <CardHeader><CardTitle>Rules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: 'rebuys', label: 'Allow rebuys', checked: allowRebuys, set: setAllowRebuys },
            { id: 'addons', label: 'Allow add-ons (during break)', checked: allowAddons, set: setAllowAddons },
            { id: 'fire', label: 'Rounds of Fire before break', checked: fireRoundsBeforeBreak, set: setFireRoundsBeforeBreak },
          ].map(({ id, label, checked, set }) => (
            <label key={id} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" id={id} checked={checked} onChange={e => set(e.target.checked)} className="h-4 w-4 accent-orange-500" />
              <span className="text-sm text-stone-700">{label}</span>
            </label>
          ))}
          {fireRoundsBeforeBreak && (
            <div className="flex items-center gap-3 pl-7">
              <label className="text-sm text-stone-500">Number of fire rounds:</label>
              <Input type="number" value={fireRoundsCount} onChange={e => setFireRoundsCount(+e.target.value)} min={1} max={10} className="w-20 h-8" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blind structure */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Blind Structure</CardTitle>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={addBreak}>+ Break</Button>
              <Button type="button" size="sm" onClick={addRound}>+ Round</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rounds.map((round, i) => (
              <div
                key={round.tempId}
                className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
                  round.is_break ? 'bg-blue-50 border-blue-200' :
                  round.is_test ? 'bg-yellow-50 border-yellow-200' :
                  'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveRound(round.tempId, -1)} className="text-stone-400 hover:text-stone-600 leading-none text-xs">▲</button>
                  <button type="button" onClick={() => moveRound(round.tempId, 1)} className="text-stone-400 hover:text-stone-600 leading-none text-xs">▼</button>
                </div>

                <input
                  className="font-medium w-28 bg-transparent border-0 border-b border-transparent hover:border-stone-300 focus:border-orange-400 outline-none px-1 py-0.5 text-stone-700"
                  value={round.name}
                  onChange={e => updateRound(round.tempId, 'name', e.target.value)}
                />

                {!round.is_break && !round.is_test && (
                  <>
                    <input
                      type="number"
                      className="w-20 text-center bg-transparent border border-stone-200 rounded px-2 py-0.5 text-xs focus:border-orange-400 outline-none"
                      value={round.small_blind}
                      onChange={e => updateRound(round.tempId, 'small_blind', +e.target.value)}
                      placeholder="SB"
                    />
                    <span className="text-stone-400 text-xs">/</span>
                    <input
                      type="number"
                      className="w-20 text-center bg-transparent border border-stone-200 rounded px-2 py-0.5 text-xs focus:border-orange-400 outline-none"
                      value={round.big_blind}
                      onChange={e => updateRound(round.tempId, 'big_blind', +e.target.value)}
                      placeholder="BB"
                    />
                    <span className="text-xs text-stone-400">
                      {formatBlind(round.small_blind)}/{formatBlind(round.big_blind)}
                    </span>
                  </>
                )}
                {(round.is_break || round.is_test) && (
                  <span className="text-xs text-stone-400 flex-1">{round.is_break ? '☕ Break' : '⚡ Test'}</span>
                )}

                <div className="flex items-center gap-1 ml-auto">
                  <input
                    type="number"
                    className="w-16 text-center bg-transparent border border-stone-200 rounded px-2 py-0.5 text-xs focus:border-orange-400 outline-none"
                    value={round.duration_minutes}
                    onChange={e => updateRound(round.tempId, 'duration_minutes', +e.target.value)}
                    min={1}
                  />
                  <span className="text-xs text-stone-400">min</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeRound(round.tempId)}
                  className="text-stone-300 hover:text-red-500 transition-colors ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSave} disabled={loading || !name.trim()}>
        {loading ? 'Saving...' : '💾 Save Template'}
      </Button>
    </div>
  )
}
