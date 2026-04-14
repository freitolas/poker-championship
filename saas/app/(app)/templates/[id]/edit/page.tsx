import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { TemplateBuilderForm } from '@/components/templates/TemplateBuilderForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTemplatePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user!.id).single()
  if (profile?.subscription_tier !== 'pro') redirect('/pricing')

  const { data: template } = await supabase
    .from('templates')
    .select('*, template_rounds(*)')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!template) notFound()

  const rounds = (template as any).template_rounds?.sort((a: any, b: any) => a.position - b.position) ?? []

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Edit Template</h1>
      <TemplateBuilderForm existingTemplate={{ ...template, template_rounds: rounds }} />
    </div>
  )
}
