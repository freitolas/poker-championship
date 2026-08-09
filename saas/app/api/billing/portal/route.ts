import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, createOrRetrieveCustomer } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    customerId = await createOrRetrieveCustomer(user.id, user.email!)
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/settings/billing`,
  })

  return NextResponse.redirect(session.url)
}
