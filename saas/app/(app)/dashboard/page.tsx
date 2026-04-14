import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: tournaments }, { data: profile }, { data: players }] = await Promise.all([
    supabase.from('tournaments').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('players').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
  ])

  const { data: completedTournaments } = await supabase
    .from('tournaments')
    .select('id')
    .eq('user_id', user!.id)
    .eq('status', 'completed')

  const stats = [
    { label: 'Tournaments run', value: completedTournaments?.length ?? 0, icon: '🃏' },
    { label: 'Players in pool', value: (players as unknown as { count: number })?.count ?? 0, icon: '👥' },
    { label: 'Account tier', value: profile?.subscription_tier === 'pro' ? 'Pro ⭐' : 'Free', icon: '💳' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}!
          </h1>
          <p className="text-stone-500 text-sm">Ready for tonight&apos;s game?</p>
        </div>
        <Link href="/tournaments/new">
          <Button size="lg">🃏 New Tournament</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <div className="text-2xl font-bold text-stone-800">{stat.value}</div>
                  <div className="text-xs text-stone-500">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent tournaments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Tournaments</CardTitle>
            <Link href="/tournaments" className="text-xs text-orange-500 hover:text-orange-600">View all →</Link>
          </div>
        </CardHeader>
        <CardContent>
          {!tournaments || tournaments.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <div className="text-4xl mb-2">🃏</div>
              <p className="text-sm">No tournaments yet.</p>
              <Link href="/tournaments/new" className="text-orange-500 text-sm hover:underline">Start your first one →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {tournaments.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-50 hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-stone-800 text-sm">{t.name}</p>
                      <p className="text-xs text-stone-400">
                        {new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {t.is_major && <Badge variant="pro">Major</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === 'completed' ? 'success' : t.status === 'active' ? 'default' : 'secondary'}>
                      {t.status}
                    </Badge>
                    <Link href={t.status === 'completed' ? `/tournaments/${t.id}/results` : `/tournaments/${t.id}`}>
                      <Button size="sm" variant="ghost">Open →</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
