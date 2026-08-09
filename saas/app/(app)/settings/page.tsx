import { createClient } from '@/lib/supabase/server'
import { ProfileSettingsForm } from './ProfileSettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Profile Settings</h1>
      <ProfileSettingsForm profile={profile} email={user!.email ?? ''} />
    </div>
  )
}
