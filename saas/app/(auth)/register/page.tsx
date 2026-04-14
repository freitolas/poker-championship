import { RegisterForm } from './RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🃏</div>
          <h1 className="text-2xl font-black text-white">PokerHost</h1>
          <p className="text-stone-400 text-sm mt-1">Create your free account</p>
        </div>
        <div className="bg-stone-900/80 border border-orange-500/20 rounded-2xl p-6 shadow-2xl">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
