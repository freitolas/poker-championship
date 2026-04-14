'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/tournaments', label: 'Tournaments', icon: '🃏' },
  { href: '/templates', label: 'Templates', icon: '📋' },
  { href: '/players', label: 'Players', icon: '👥' },
  { href: '/stats', label: 'Stats', icon: '🏆' },
]

const SETTINGS_ITEMS = [
  { href: '/settings', label: 'Profile', icon: '⚙️' },
  { href: '/settings/smart-home', label: 'Smart Home', icon: '🏠' },
  { href: '/settings/billing', label: 'Billing', icon: '💳' },
]

interface AppNavProps {
  user: User
  profile: Profile | null
}

export function AppNav({ user, profile }: AppNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const isPro = profile?.subscription_tier === 'pro'

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="w-56 shrink-0 bg-stone-900 text-white flex flex-col h-full border-r border-stone-800">
      {/* Logo */}
      <div className="p-4 border-b border-stone-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🃏</span>
          <span className="font-black text-lg text-white">PokerHost</span>
        </Link>
        {isPro && (
          <div className="mt-1 text-xs text-orange-400 font-semibold">⭐ Pro</div>
        )}
      </div>

      {/* Main nav */}
      <div className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-orange-500 text-white'
                : 'text-stone-400 hover:bg-stone-800 hover:text-white'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Upgrade banner */}
      {!isPro && (
        <div className="mx-3 mb-3 p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 rounded-xl">
          <p className="text-xs text-orange-300 font-semibold mb-1">Unlock Pro</p>
          <p className="text-xs text-stone-400 mb-2">Custom templates, smart home & more</p>
          <Link
            href="/pricing"
            className="block text-center text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-1.5 transition-colors"
          >
            Upgrade →
          </Link>
        </div>
      )}

      {/* Settings nav */}
      <div className="p-3 border-t border-stone-800 space-y-0.5">
        {SETTINGS_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
              pathname === item.href
                ? 'bg-stone-700 text-white'
                : 'text-stone-500 hover:bg-stone-800 hover:text-stone-300'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-800 hover:text-stone-300 transition-colors"
        >
          <span>🚪</span>
          Sign out
        </button>
      </div>

      {/* User info */}
      <div className="p-3 border-t border-stone-800">
        <div className="text-xs text-stone-500 truncate">{user.email}</div>
        {profile?.display_name && (
          <div className="text-xs text-stone-400 font-medium truncate">{profile.display_name}</div>
        )}
      </div>
    </nav>
  )
}
