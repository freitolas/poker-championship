import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateLeaderboard } from '@/lib/tournament-engine'
import { formatCurrency } from '@/lib/utils'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, tournament_players(*), tournament_events(*)')
    .eq('user_id', user!.id)
    .eq('status', 'completed')
    .order('ended_at', { ascending: false })

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Stats & Leaderboard</h1>
        <Card>
          <CardContent className="py-12 text-center text-stone-400">
            <div className="text-5xl mb-3">📊</div>
            <p className="font-medium">No completed tournaments yet</p>
            <p className="text-sm mt-1">Complete your first tournament to see stats here</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Build leaderboard data from tournament_players
  const leaderboardInput = tournaments.map(t => ({
    tournamentName: t.name,
    isMajor: t.is_major,
    players: ((t as any).tournament_players ?? []).map((p: any) => {
      const elimEvents = ((t as any).tournament_events ?? []).filter(
        (e: any) => e.event_type === 'elimination' && e.actor_name === p.name
      )
      return {
        name: p.name,
        rank: p.final_rank ?? 99,
        kills: elimEvents.length,
        totalPaid: p.total_paid,
        prize: p.prize_won,
      }
    }),
  }))

  const leaderboard = calculateLeaderboard(leaderboardInput)

  // Per-player extended stats
  const playerStats: Record<string, {
    totalPaid: number
    totalWon: number
    rebuys: number
    addons: number
  }> = {}

  for (const t of tournaments) {
    for (const p of (t as any).tournament_players ?? []) {
      if (!playerStats[p.name]) playerStats[p.name] = { totalPaid: 0, totalWon: 0, rebuys: 0, addons: 0 }
      playerStats[p.name].totalPaid += p.total_paid
      playerStats[p.name].totalWon += p.prize_won
      playerStats[p.name].rebuys += p.rebuy_count
      if (p.has_addon) playerStats[p.name].addons += 1
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Stats & Leaderboard</h1>
      <p className="text-stone-500 text-sm">{tournaments.length} completed tournament{tournaments.length !== 1 ? 's' : ''}</p>

      {/* Leaderboard */}
      <Card>
        <CardHeader><CardTitle>🏆 Championship Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wide">
                <th className="text-left py-2 px-3">Rank</th>
                <th className="text-left py-2 px-3">Player</th>
                <th className="text-center py-2 px-3">Points</th>
                <th className="text-center py-2 px-3">Games</th>
                <th className="text-center py-2 px-3">Wins</th>
                <th className="text-center py-2 px-3">Kills</th>
                <th className="text-center py-2 px-3">Profit</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => {
                const stats = playerStats[entry.name]
                const profit = stats ? stats.totalWon - stats.totalPaid : 0
                return (
                  <tr key={entry.name} className={`border-b border-stone-50 ${i === 0 ? 'bg-yellow-50' : ''}`}>
                    <td className="py-2.5 px-3 font-bold text-stone-500">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-stone-800">{entry.name}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-orange-600">{entry.points}</td>
                    <td className="py-2.5 px-3 text-center text-stone-500">{entry.gamesPlayed}</td>
                    <td className="py-2.5 px-3 text-center">
                      {entry.wins > 0 && <Badge variant="success" className="text-xs">{entry.wins}× 🏆</Badge>}
                    </td>
                    <td className="py-2.5 px-3 text-center text-stone-500">{entry.kills}</td>
                    <td className={`py-2.5 px-3 text-center font-mono text-xs font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Points explanation */}
      <Card>
        <CardHeader><CardTitle>Points System</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-stone-600">
            {[
              { label: 'Participation', pts: '+1 pt' },
              { label: '1st place', pts: '+10 pts' },
              { label: '2nd place', pts: '+7 pts' },
              { label: '3rd place', pts: '+4 pts' },
              { label: 'Killer bonus', pts: '+2 pts' },
              { label: 'Major × 2', pts: '×2 all' },
            ].map(({ label, pts }) => (
              <div key={label} className="bg-stone-50 rounded-lg p-3">
                <div className="font-bold text-orange-500">{pts}</div>
                <div className="text-xs text-stone-500">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
