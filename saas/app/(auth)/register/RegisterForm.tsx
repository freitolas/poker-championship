'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">📧</div>
        <h2 className="text-white font-bold mb-2">Check your email</h2>
        <p className="text-stone-400 text-sm">
          We sent a confirmation link to <strong className="text-orange-400">{email}</strong>.<br />
          Click it to activate your account.
        </p>
        <Link href="/login" className="block mt-4 text-orange-400 text-sm hover:text-orange-300">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-950/50 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-stone-400 font-medium">Name</label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          required
          className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-stone-400 font-medium">Email</label>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-stone-400 font-medium">Password</label>
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create free account'}
      </Button>

      <p className="text-center text-xs text-stone-500">
        Already have an account?{' '}
        <Link href="/login" className="text-orange-400 hover:text-orange-300">
          Sign in
        </Link>
      </p>
    </form>
  )
}
