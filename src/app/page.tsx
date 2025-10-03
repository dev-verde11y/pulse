'use client'

import Link from 'next/link'
import { useState } from 'react'
import { StripeCheckoutButton } from '@/components/payments/stripe-checkout-button'

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                PULSE
              </span>
              <span className="text-xs text-gray-400">ANIME</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/browse" className="text-gray-300 hover:text-white transition-colors">
                Catálogo
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Planos
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                LOGIN
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all"
              >
                COMEÇAR GRÁTIS
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90 z-10"></div>
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5"></div>

          {/* Animated orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              O Maior Acervo de
              <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
                Anime do Mundo
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Assista a novos episódios uma hora após a exibição no Japão.
              Desfrute de acesso ilimitado a animes, sem propaganda.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-2xl"
              >
                INICIE TESTE GRATUITO DE 7 DIAS
              </Link>
            </div>

            <p className="text-sm text-gray-400">
              Todos os planos incluem 7 dias grátis. Sem compromisso, cancele quando quiser.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-orange-500/50 transition-all">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-2">Assista em Primeira Mão</h3>
              <p className="text-gray-400">
                Novos episódios logo após a exibição no Japão
              </p>
            </div>

            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all">
              <div className="text-4xl mb-4">🚫</div>
              <h3 className="text-xl font-bold mb-2">Sem Propagandas</h3>
              <p className="text-gray-400">
                Experiência premium sem interrupções
              </p>
            </div>

            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold mb-2">Loja Exclusiva</h3>
              <p className="text-gray-400">
                Descontos exclusivos na Loja Pulse
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-24 bg-gradient-to-b from-black via-gray-900/50 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Escolha Sua <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Fase da Lua</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Todos os planos incluem 7 dias grátis. Sem compromisso, cancele quando quiser.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-white/5 p-2 rounded-full border border-white/10">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Anual
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  -16%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* The Arcane - New Moon */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-blue-400/30 transition-all">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center">
                  <span className="text-3xl">🌑</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">The Arcane</h3>
                <p className="text-gray-400 mb-4">New Moon • Básico</p>
                <div className="text-4xl font-bold mb-2">
                  R$ 14,99
                  <span className="text-lg text-gray-400">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Sem anúncios
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Qualidade HD
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  1 tela simultânea
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Acesso ilimitado
                </li>
              </ul>

              <StripeCheckoutButton
                priceId="price_1S5nLD91l9itSVBOCQpvSL1R"
                planName="The Arcane"
                mode="subscription"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full transition-all"
              />
            </div>

            {/* The Sorcerer - Full Moon - Popular */}
            <div className="relative bg-white/[0.02] backdrop-blur-xl border border-purple-400/40 rounded-2xl p-8 transform scale-105 shadow-2xl shadow-purple-400/10">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg">
                  🌕 POPULAR
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-center">
                  <span className="text-3xl">🌕</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">The Sorcerer</h3>
                <p className="text-gray-400 mb-4">Full Moon • Completo</p>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  R$ 19,99
                  <span className="text-lg text-gray-400">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Tudo do The Arcane
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  4K Ultra HD
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  4 telas simultâneas
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Download offline
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Game Vault
                </li>
              </ul>

              <StripeCheckoutButton
                priceId="price_1S5rQZ91l9itSVBOIF3iJBPH"
                planName="The Sorcerer"
                mode="subscription"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-full transition-all"
              />
            </div>

            {/* The Sage - Waning Moon */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-green-400/30 transition-all">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 flex items-center justify-center">
                  <span className="text-3xl">🌘</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">The Sage</h3>
                <p className="text-gray-400 mb-4">Waning Moon • Anual</p>
                <div className="text-4xl font-bold mb-2">
                  R$ 199,99
                  <span className="text-lg text-gray-400">/ano</span>
                </div>
                <div className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                  💰 Economize 16%
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Tudo do The Sorcerer
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Pagamento anual
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  R$ 16,66/mês
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Suporte prioritário
                </li>
              </ul>

              <StripeCheckoutButton
                priceId="price_1S5nOM91l9itSVBOqsJ2vJQU"
                planName="The Sage"
                mode="subscription"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-full transition-all"
              />
            </div>
          </div>

          <p className="text-center text-gray-400 mt-12 text-sm">
            *A disponibilidade da Pulse Store pode variar entre países. <br />
            Todos os planos incluem 7 dias de teste gratuito. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-lg bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                PULSE ANIME
              </h4>
              <p className="text-gray-400 text-sm">
                O maior acervo de anime do mundo. Assista onde e quando quiser.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Navegação</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse" className="text-gray-400 hover:text-white transition-colors">Catálogo</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Planos</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Sobre</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Suporte</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contato</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Pulse Anime. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
