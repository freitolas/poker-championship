import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TemplateBuilderForm } from '@/components/templates/TemplateBuilderForm'

export default async function NewTemplatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user!.id)
    .single()

  if (profile?.subscription_tier !== 'pro') {
    redirect('/pricing?reason=templates')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">New Template</h1>
      <TemplateBuilderForm />
    </div>
  )
}
