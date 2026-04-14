import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { NarrationReport } from '@/components/tournament/NarrationReport'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentResultsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: tournament }, { data: profile }] = await Promise.all([
    supabase
      .from('tournaments')
      .select('*, tournament_players(*), tournament_events(*)')
      .eq('id', id)
      .eq('user_id', user!.id)
      .single(),
    supabase.from('profiles').select('subscription_tier, narration_used_free').eq('id', user!.id).single(),
  ])

  if (!tournament) notFound()

  const gameState = tournament.game_state as any
  const players = (tournament as any).tournament_players ?? []
  const events = (tournament as any).tournament_events ?? []

  const sortedPlayers = [...players].sort((a: any, b: any) => {
    if (a.final_rank && b.final_rank) return a.final_rank - b.final_rank
    if (a.final_rank) return -1
    if (b.final_rank) return 1
    return 0
  })

  // If game_state has prize info, use that
  const grossPot = players.reduce((sum: number, p: any) => sum + p.total_paid, 0)

  const canNarrate = profile?.subscription_tier === 'pro' || !profile?.narration_used_free

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{tournament.name}</h1>
          <p className="text-stone-500 text-sm">
            {tournament.ended_at
              ? new Date(tournament.ended_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : 'In progress'}
          </p>
        </div>
        <div className="flex gap-2">
          {tournament.is_major && <Badge variant="pro">Major</Badge>}
          <Badge variant={tournament.status === 'completed' ? 'success' : 'default'}>{tournament.status}</Badge>
        </div>
      </div>

      {/* Pot info */}
      <Card>
        <CardHeader><CardTitle>💰 Prize Pool</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-stone-800">{formatCurrency(grossPot)}</div>
              <div className="text-xs text-stone-500">Gross pot</div>
            </div>
            <div>
              <div className="text-xl font-bold text-yellow-600">{formatCurrency(Math.round(grossPot * 0.72))}</div>
              <div className="text-xs text-stone-500">🥇 1st place</div>
            </div>
            <div>
              <div className="text-xl font-bold text-stone-500">{formatCurrency(Math.round(grossPot * 0.18))}</div>
              <div className="text-xs text-stone-500">🥈 2nd place</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader><CardTitle>🏆 Final Standings</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wide">
                <th className="text-left py-2 px-3">Rank</th>
                <th className="text-left py-2 px-3">Player</th>
                <th className="text-center py-2 px-3">Stacks</th>
                <th className="text-center py-2 px-3">Rebuys</th>
                <th className="text-center py-2 px-3">Paid</th>
                <th className="text-center py-2 px-3">Prize</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((p: any, i: number) => (
                <tr key={p.id} className={`border-b border-stone-50 ${i === 0 ? 'bg-yellow-50' : ''}`}>
                  <td className="py-2.5 px-3 font-bold text-stone-500">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-stone-800">{p.name}</td>
                  <td className="py-2.5 px-3 text-center text-stone-600">{p.stacks}</td>
                  <td className="py-2.5 px-3 text-center text-orange-500">{p.rebuy_count || '—'}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-xs text-stone-500">{formatCurrency(p.total_paid)}</td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    {p.prize_won > 0 ? <span className="text-green-600">{formatCurrency(p.prize_won)}</span> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* AI Narration */}
      <NarrationReport
        tournamentId={tournament.id}
        canNarrate={canNarrate}
        isPro={profile?.subscription_tier === 'pro'}
      />

      <div className="flex gap-3">
        <Link href="/tournaments"><Button variant="outline">← All Tournaments</Button></Link>
        <Link href="/stats"><Button variant="ghost">📊 View Stats</Button></Link>
      </div>
    </div>
  )
}
