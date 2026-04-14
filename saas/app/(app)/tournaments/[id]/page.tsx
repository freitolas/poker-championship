import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TournamentRunner } from '@/components/tournament/TournamentRunner'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: tournament }, { data: smartHomeConfig }] = await Promise.all([
    supabase
      .from('tournaments')
      .select('*, templates(*, template_rounds(*))')
      .eq('id', id)
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('smart_home_configs')
      .select('*')
      .eq('user_id', user!.id)
      .single(),
  ])

  if (!tournament) notFound()

  const template = (tournament as any).templates
  const rounds = template?.template_rounds?.sort((a: any, b: any) => a.position - b.position) ?? []
  const gameState = tournament.game_state

  if (!gameState || !template) {
    return (
      <div className="p-8 text-center text-stone-500">
        Tournament data is missing. Please try creating a new tournament.
      </div>
    )
  }

  return (
    <TournamentRunner
      initialState={gameState}
      template={template}
      rounds={rounds}
      tournamentId={tournament.id}
      smartHomeConfig={smartHomeConfig}
    />
  )
}
