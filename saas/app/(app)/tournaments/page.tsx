import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function TournamentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Tournaments</h1>
        <Link href="/tournaments/new"><Button>🃏 New Tournament</Button></Link>
      </div>

      <Card>
        <CardContent className="pt-0">
          {!tournaments || tournaments.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <div className="text-5xl mb-3">🃏</div>
              <p className="font-medium">No tournaments yet</p>
              <p className="text-sm mt-1">Create your first tournament to get started</p>
              <Link href="/tournaments/new" className="inline-block mt-4">
                <Button>Start a Tournament</Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-3">Tournament</th>
                  <th className="text-center py-3 px-3">Date</th>
                  <th className="text-center py-3 px-3">Status</th>
                  <th className="text-center py-3 px-3">Type</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map(t => (
                  <tr key={t.id} className="border-b border-stone-50 hover:bg-orange-50/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-stone-800">{t.name}</td>
                    <td className="py-3 px-3 text-center text-stone-500 text-xs">
                      {new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={t.status === 'completed' ? 'success' : t.status === 'active' ? 'default' : 'secondary'}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {t.is_major ? <Badge variant="pro">Major</Badge> : <span className="text-xs text-stone-400">Regular</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link href={t.status === 'completed' ? `/tournaments/${t.id}/results` : `/tournaments/${t.id}`}>
                        <Button size="sm" variant="ghost">
                          {t.status === 'completed' ? 'Results' : 'Open'} →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
