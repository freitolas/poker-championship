import { createClient } from '@/lib/supabase/server'
import { PlayerPoolManager } from './PlayerPoolManager'

export default async function PlayersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: players }, { data: profile }] = await Promise.all([
    supabase.from('players').select('*').eq('user_id', user!.id).order('name'),
    supabase.from('profiles').select('subscription_tier').eq('id', user!.id).single(),
  ])

  const isPro = profile?.subscription_tier === 'pro'
  const maxPlayers = isPro ? Infinity : 10

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Player Pool</h1>
        <p className="text-stone-500 text-sm">
          Your registered players — quickly select them when creating tournaments.
          {!isPro && ` Free tier: ${players?.length ?? 0}/10 players.`}
        </p>
      </div>
      <PlayerPoolManager
        initialPlayers={players ?? []}
        maxPlayers={maxPlayers}
        isPro={isPro}
      />
    </div>
  )
}
