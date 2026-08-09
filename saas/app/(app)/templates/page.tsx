import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: templates }, { data: profile }] = await Promise.all([
    supabase.from('templates').select('*, template_rounds(*)').or(`user_id.eq.${user!.id},is_system.eq.true`).order('is_system', { ascending: false }),
    supabase.from('profiles').select('subscription_tier').eq('id', user!.id).single(),
  ])

  const isPro = profile?.subscription_tier === 'pro'
  const systemTemplates = templates?.filter(t => t.is_system) ?? []
  const userTemplates = templates?.filter(t => !t.is_system) ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Templates</h1>
          <p className="text-stone-500 text-sm">Pre-made and custom tournament structures</p>
        </div>
        {isPro ? (
          <Link href="/templates/new"><Button>+ New Template</Button></Link>
        ) : (
          <Link href="/pricing">
            <Button variant="pro">⭐ Upgrade for Custom Templates</Button>
          </Link>
        )}
      </div>

      {/* System templates */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Pre-made Templates</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {systemTemplates.map(t => {
            const rounds = (t as any).template_rounds?.filter((r: any) => !r.is_test) ?? []
            const hasBreak = rounds.some((r: any) => r.is_break)
            return (
              <Card key={t.id} className="hover:border-orange-300 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <Badge variant="secondary">System</Badge>
                  </div>
                  {t.description && <p className="text-xs text-stone-500">{t.description}</p>}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600 mb-3">
                    <span>Buy-in: <strong>{formatCurrency(t.buy_in_amount)}</strong></span>
                    <span>Levels: <strong>{rounds.filter((r: any) => !r.is_break).length}</strong></span>
                    <span>Rebuys: <strong>{t.allow_rebuys ? 'Yes' : 'No'}</strong></span>
                    <span>Add-ons: <strong>{t.allow_addons ? 'Yes' : 'No'}</strong></span>
                    {hasBreak && <span>Break: <strong>Yes</strong></span>}
                    {t.fire_rounds_count > 0 && <span>🔥 Fire rounds: <strong>{t.fire_rounds_count}</strong></span>}
                  </div>
                  <Link href={`/tournaments/new?template=${t.id}`}>
                    <Button size="sm" variant="outline" className="w-full">Use Template</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* User templates */}
      {(userTemplates.length > 0 || isPro) && (
        <section>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Your Templates</h2>
          {userTemplates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-stone-400">
                <p className="text-sm">No custom templates yet.</p>
                <Link href="/templates/new" className="inline-block mt-3">
                  <Button size="sm">Create your first template →</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {userTemplates.map(t => (
                <Card key={t.id} className="hover:border-orange-300 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{t.name}</CardTitle>
                      <Link href={`/templates/${t.id}/edit`}>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </Link>
                    </div>
                    {t.description && <p className="text-xs text-stone-500">{t.description}</p>}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600 mb-3">
                      <span>Buy-in: <strong>{formatCurrency(t.buy_in_amount)}</strong></span>
                      <span>Rebuys: <strong>{t.allow_rebuys ? 'Yes' : 'No'}</strong></span>
                    </div>
                    <Link href={`/tournaments/new?template=${t.id}`}>
                      <Button size="sm" variant="outline" className="w-full">Use Template</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
