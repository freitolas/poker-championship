import { createClient } from '@/lib/supabase/server'
import { NewTournamentForm } from './NewTournamentForm'

export default async function NewTournamentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: templates }, { data: players }, { data: profile }] = await Promise.all([
    supabase.from('templates').select('*, template_rounds(*)').or(`user_id.eq.${user!.id},is_system.eq.true`).order('is_system', { ascending: false }),
    supabase.from('players').select('*').eq('user_id', user!.id).order('name'),
    supabase.from('profiles').select('subscription_tier').eq('id', user!.id).single(),
  ])

  const tier = profile?.subscription_tier ?? 'free'

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">New Tournament</h1>
      <NewTournamentForm
        templates={templates ?? []}
        players={players ?? []}
        tier={tier as 'free' | 'pro'}
      />
    </div>
  )
}
