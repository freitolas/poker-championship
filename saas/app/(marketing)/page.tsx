import Link from 'next/link'
import { Button } from '@/components/ui/button'

const FEATURES = [
  { icon: '⏱', title: 'Live Timer & Blinds', description: 'Wall-clock timer that survives browser throttling. Auto-advances rounds. Audio alert on level change.' },
  { icon: '🎯', title: 'Full Player Management', description: 'Eliminations with killer tracking, rebuys, add-ons, and stack management. Undo any action.' },
  { icon: '🔥', title: 'Rounds of Fire', description: 'The iconic pre-break mechanic — sequential rebuy rounds that gate access to the break.' },
  { icon: '📋', title: 'Custom Templates', description: 'Build your own blind structures. Configure rounds, breaks, fire rounds, buy-ins, and prize splits.' },
  { icon: '🏠', title: 'Smart Home', description: 'Trigger Philips Hue, IFTTT, Home Assistant, or any webhook on eliminations, rounds, breaks, and wins.' },
  { icon: '📰', title: 'AI Narration', description: 'After the game, generate a hilarious dramatic recap of the night using Claude — rivalries, comebacks, bad beats.' },
  { icon: '🏆', title: 'Leaderboard & Stats', description: 'Lifetime championship points, win rates, killer stats, ROI tracking, and achievement titles.' },
  { icon: '⚡', title: 'God Mode', description: 'Override anything — adjust stacks, kill/revive players without tracking, rewind rounds.' },
]

const TEMPLATES = [
  { name: 'Regular Home Game', rounds: '18 rounds', duration: '~6h', icon: '🃏' },
  { name: 'Turbo', rounds: '12 rounds', duration: '~2h', icon: '⚡' },
  { name: 'Deep Stack', rounds: '14 rounds', duration: '~8h', icon: '🎰' },
  { name: 'WPT Style', rounds: '10 levels', duration: 'All day', icon: '🏆' },
  { name: 'Quick Fire', rounds: '8 rounds', duration: '<1h', icon: '🔥' },
  { name: 'Freezeout', rounds: '12 rounds', duration: '~4h', icon: '❄️' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-black text-white">🃏 PokerHost</div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-stone-400 hover:text-white text-sm transition-colors">Sign in</Link>
          <Link href="/register">
            <Button size="sm">Get started free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-6">
          🃏 The poker night app, now as a SaaS
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
          Run better<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
            poker nights
          </span>
        </h1>
        <p className="text-xl text-stone-300 mb-10 max-w-2xl mx-auto">
          Professional tournament management for your home game. Timers, blinds, player tracking, smart home automation, and AI-generated chronicles of the night.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="xl" className="w-full sm:w-auto">
              Start for free →
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="xl" variant="outline" className="w-full sm:w-auto border-stone-600 text-stone-300 hover:bg-stone-800">
              See pricing
            </Button>
          </Link>
        </div>
        <p className="text-stone-500 text-sm mt-4">Free forever · No credit card required</p>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-white text-center mb-12">Everything you need for a great game</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-stone-800/50 border border-stone-700/50 rounded-2xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-white text-center mb-4">6 pre-made templates included</h2>
        <p className="text-stone-400 text-center mb-10">Start a game in seconds, or build your own blind structure from scratch (Pro)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {TEMPLATES.map(t => (
            <div key={t.name} className="bg-stone-800 border border-stone-700 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="font-bold text-white text-sm mb-1">{t.name}</div>
              <div className="text-xs text-stone-400">{t.rounds}</div>
              <div className="text-xs text-stone-500">{t.duration}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Narration highlight */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-orange-500/30 rounded-3xl p-8 md:p-12 text-center">
          <div className="text-5xl mb-4">📰</div>
          <h2 className="text-3xl font-black text-white mb-4">The Night&apos;s Chronicle</h2>
          <p className="text-stone-300 text-lg mb-6 max-w-2xl mx-auto">
            After every game, generate a hilarious, dramatic AI-written narrative of the night. Rivalries, bad beats, improbable comebacks — the Chronicle captures it all, with names, timestamps, and commentary that&apos;ll have everyone sharing it on the group chat.
          </p>
          <div className="bg-stone-900/60 rounded-2xl p-6 text-left font-serif text-stone-300 text-sm leading-relaxed mb-6 border border-stone-700">
            <p className="text-orange-400 font-bold not-serif text-xs uppercase tracking-wide mb-3">Sample Chronicle excerpt</p>
            <p>
              &quot;What followed could only be described as a masterclass in calculated aggression. Lachy — who had been quietly hovering near the bottom of the chip counts — chose the moment between rounds 7 and 8 to execute what historians will call the Great Equaliser. Having already rebought once after a catastrophic encounter with Roberto&apos;s pocket aces, he stalked his prey with the patience of a man who had absolutely nothing to lose...&quot;
            </p>
          </div>
          <p className="text-stone-500 text-sm">One free chronicle per account · Unlimited with Pro</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl font-black text-white mb-4">Ready to host like a pro?</h2>
        <p className="text-stone-400 mb-8">Free to start. Upgrade when you need more.</p>
        <Link href="/register">
          <Button size="xl">Get started free →</Button>
        </Link>
        <div className="mt-6">
          <Link href="/pricing" className="text-stone-500 text-sm hover:text-stone-400">See full pricing →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800 px-6 py-8 text-center text-stone-600 text-sm">
        <p>🃏 PokerHost · Run great poker nights</p>
        <div className="flex gap-4 justify-center mt-2">
          <Link href="/pricing" className="hover:text-stone-400">Pricing</Link>
          <Link href="/login" className="hover:text-stone-400">Sign in</Link>
          <Link href="/register" className="hover:text-stone-400">Sign up</Link>
        </div>
      </footer>
    </div>
  )
}
