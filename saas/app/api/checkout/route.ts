import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, createOrRetrieveCustomer, STRIPE_PRICES } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId } = await request.json()
  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!

  const customerId = await createOrRetrieveCustomer(user.id, user.email!)

  // Store customer ID
  await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${origin}/settings/billing?success=1`,
    cancel_url: `${origin}/pricing`,
    metadata: { supabase_uid: user.id },
  })

  return NextResponse.json({ url: session.url })
}
