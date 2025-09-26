'use client'

import { Button } from "@/components/ui/Button"
import { useEffect, useState } from "react"
import { Plan, PlanType } from "@prisma/client"


function formatPrice(price: string | number, billingCycle: string) {
  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
  const formatted = `R$ ${numPrice.toFixed(2).replace('.', ',')}`
  
  if (billingCycle === 'MONTHLY') return { price: formatted, period: '/mês' }
  if (billingCycle === 'ANNUALLY') return { price: formatted, period: '/ano' }
  return { price: formatted, period: '' }
}

function getMoonPhaseName(planType: string) {
  const moonPhases = {
    'FREE': 'Grátis',
    'FAN': 'The Arcane',
    'MEGA_FAN': 'The Sorcerer', 
    'MEGA_FAN_ANNUAL': 'The Sage'
  }
  return moonPhases[planType as keyof typeof moonPhases] || planType
}

function getMoonPhaseDescription(planType: string) {
  const descriptions = {
    'FREE': 'Acesso básico',
    'FAN': 'New Moon • Básico mensal',
    'MEGA_FAN': 'Full Moon • Experiência completa',
    'MEGA_FAN_ANNUAL': 'Waning Moon • Melhor valor'
  }
  return descriptions[planType as keyof typeof descriptions] || 'Plano premium'
}

function updateFeatureText(feature: string, planType: string) {
  // Atualiza referências aos planos antigos nas features
  let updatedFeature = feature
  
  // Substitui referências ao "Fan" para "The Arcane"
  if (updatedFeature.includes('Tudo do Fan') || updatedFeature.includes('do Fan')) {
    updatedFeature = updatedFeature.replace(/Tudo do Fan|do Fan/g, 'Tudo do The Arcane')
  }
  
  // Substitui referências ao "Mega Fan" para "The Sorcerer"  
  if (updatedFeature.includes('Tudo do Mega Fan') || updatedFeature.includes('do Mega Fan')) {
    updatedFeature = updatedFeature.replace(/Tudo do Mega Fan|do Mega Fan/g, 'Tudo do The Sorcerer')
  }
  
  return updatedFeature
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await fetch('/api/plans')
        if (!response.ok) {
          throw new Error('Falha ao buscar planos')
        }
        const plansData = await response.json()
        setPlans(plansData)
      } catch (error) {
        console.error('Erro ao carregar planos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPlans()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-medium">Carregando planos incríveis...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Anime-inspired Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-indigo-950/40 to-blue-950/30"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-yellow-500/5 animate-pulse"></div>
        
        {/* Large animated orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/8 to-cyan-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-yellow-500/6 to-amber-500/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-1/4 right-1/3 w-32 h-32 border border-blue-500/10 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 border border-yellow-500/10 rotate-12 animate-spin-slow-reverse"></div>
        
        {/* Premium floating elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-bounce delay-700"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-yellow-400 rounded-full opacity-80 animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-cyan-400 rounded-full opacity-40 animate-bounce delay-500"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-amber-400 rounded-full opacity-50 animate-bounce delay-300"></div>
      </div>

      {/* Hero Section Impactante */}
      <div className="relative min-h-screen">
        {/* Background Dinâmico */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
          
          {/* Anime-style background effects */}
          <div className="absolute inset-0 opacity-30">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop')"
              }}
            ></div>
          </div>
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/95"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50"></div>
          
          {/* Dynamic elements */}
          <div className="absolute top-1/4 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-700 opacity-60"></div>
          
          {/* Large orbs */}
          <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center min-h-screen">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              
              {/* Conteúdo Principal Centralizado */}
              <div className="space-y-8">
                {/* Brand Title - Pulse Representation */}
                <div className="text-center mb-16">
                  <div className="space-y-6">
                    {/* Pulse Visual Effect */}
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-8 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-12 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-16 bg-gradient-to-t from-purple-400 to-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        <div className="w-2 h-20 bg-gradient-to-t from-pink-400 to-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                        <div className="w-2 h-16 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                        <div className="w-2 h-12 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        <div className="w-2 h-8 bg-gradient-to-t from-purple-400 to-pink-500 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
                      </div>
                    </div>
                    
                    <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-400 animate-gradient-x leading-none tracking-tight">
                      PULSE
                    </h1>
                    
                    {/* Heartbeat Line */}
                    <div className="flex justify-center items-center gap-6">
                      <div className="flex items-center">
                        <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-purple-400"></div>
                        <div className="h-1 w-4 bg-purple-400"></div>
                        <div className="h-4 w-1 bg-pink-400"></div>
                        <div className="h-8 w-1 bg-purple-500"></div>
                        <div className="h-4 w-1 bg-pink-400"></div>
                        <div className="h-1 w-4 bg-purple-400"></div>
                        <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-purple-400"></div>
                      </div>
                    </div>
                    
                    <p className="text-purple-300 font-black tracking-[0.3em] text-xl">
                      STREAMING ANIME
                    </p>
                  </div>
                </div>

                {/* Main Headline */}
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-6xl font-bold text-gray-100 leading-tight">
                    Viva Sua
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-gradient-x">
                      Paixão Anime
                    </span>
                  </h2>
                  
                  <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto font-medium">
                    Mergulhe no maior catálogo de animes do Brasil com qualidade 4K, 
                    sem anúncios e recursos que vão transformar sua experiência.
                  </p>
                </div>

                {/* Stats Simplificados */}
                <div className="grid grid-cols-3 gap-8 py-8">
                  <div className="text-center group cursor-pointer">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                      15K+
                    </div>
                    <div className="text-xs text-gray-500 font-normal mt-1">Episódios</div>
                  </div>
                  <div className="text-center group cursor-pointer">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                      4K
                    </div>
                    <div className="text-xs text-gray-500 font-normal mt-1">Ultra HD</div>
                  </div>
                  <div className="text-center group cursor-pointer">
                    <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                      0
                    </div>
                    <div className="text-xs text-gray-500 font-normal mt-1">Anúncios</div>
                  </div>
                </div>

    
                
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/50 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium">Veja as Fases da Lua</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>


      {/* Pricing Section */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Escolha Sua <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-gradient-x">Fase da Lua</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Todos os planos incluem 7 dias grátis. Sem compromisso, cancele quando quiser.
            </p>
          </div>

          {/* Pricing Cards - Clean & Modern */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const pricing = formatPrice(plan.price, plan.billingCycle)
              const isPopular = plan.popular
              
              return (
                <div key={plan.id} className="relative group">
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                        🌕 POPULAR
                      </div>
                    </div>
                  )}
                  
                  {/* Card */}
                  <div className={`
                    relative bg-white/[0.02] backdrop-blur-xl border rounded-2xl p-6
                    transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                    ${isPopular 
                      ? 'border-purple-400/40 shadow-purple-400/10' 
                      : 'border-white/10 hover:border-purple-400/30'
                    }
                  `}>
                    
                    {/* Plan Icon & Name */}
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                        isPopular 
                          ? 'bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-purple-400/30' 
                          : 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-400/30'
                      }`}>
                        <span className="text-2xl">
                          {plan.type === 'FREE' && '🆓'}
                          {plan.type === 'FAN' && '🌑'}
                          {plan.type === 'MEGA_FAN' && '🌕'}
                          {plan.type === 'MEGA_FAN_ANNUAL' && '🌘'}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">
                        {getMoonPhaseName(plan.type)}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4">
                        {getMoonPhaseDescription(plan.type)}
                      </p>
                      
                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-4xl font-black ${
                            isPopular ? 'text-purple-400' : 'text-white'
                          }`}>
                            {pricing.price}
                          </span>
                          <span className="text-gray-400">
                            {pricing.period}
                          </span>
                        </div>
                        
                        {plan.billingCycle === 'ANNUALLY' && (
                          <div className="mt-2">
                            <span className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                              💰 Economize 16%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isPopular 
                              ? 'bg-purple-400/20 text-purple-400' 
                              : 'bg-purple-400/20 text-purple-400'
                          }`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-300 text-sm">
                            {updateFeatureText(feature, plan.type)}
                          </span>
                        </div>
                      ))}
                      
                      {/* Technical Features */}
                      {plan.maxScreens > 1 && (
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isPopular 
                              ? 'bg-purple-400/20 text-purple-400' 
                              : 'bg-purple-400/20 text-purple-400'
                          }`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-300 text-sm">
                            {plan.maxScreens} telas simultâneas
                          </span>
                        </div>
                      )}
                      
                      {plan.offlineViewing && (
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isPopular 
                              ? 'bg-purple-400/20 text-purple-400' 
                              : 'bg-purple-400/20 text-purple-400'
                          }`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-300 text-sm">
                            Download offline
                          </span>
                        </div>
                      )}
                      
                      {plan.gameVaultAccess && (
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isPopular 
                              ? 'bg-purple-400/20 text-purple-400' 
                              : 'bg-purple-400/20 text-purple-400'
                          }`}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-300 text-sm">
                            Game Vault
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* CTA Button */}
                    <Button className={`
                      w-full py-3 rounded-xl font-semibold transition-all duration-300
                      ${isPopular 
                        ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:from-purple-300 hover:to-pink-400' 
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500'
                      }
                      hover:scale-105 shadow-lg hover:shadow-xl
                    `}>
                      Começar Teste Grátis
                    </Button>
                    
                    <p className="text-center text-gray-500 text-xs mt-3">
                      7 dias grátis • Sem compromisso
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Additional Info */}
          <div className="text-center mt-16 space-y-4">
            <p className="text-white/60 text-sm">
              Todos os planos incluem acesso completo à plataforma durante o período gratuito
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/40 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancele a qualquer momento
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Sem taxas ocultas
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Suporte 24/7
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Simple */}
      <div className="py-16 bg-black/40 border-t border-white/10">
        <div className="container mx-auto px-6 text-center">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="text-4xl font-black text-purple-500">P</div>
              <div className="text-2xl font-black text-white tracking-wider">PULSE</div>
            </div>
            
            <p className="text-gray-400 max-w-2xl mx-auto">
              A melhor plataforma de streaming anime do Brasil. Assista seus animes favoritos em 4K, sem anúncios e quando quiser.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                7 dias grátis
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancele quando quiser
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Sem compromisso
              </span>
            </div>

            <div className="pt-8 border-t border-white/10">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Pulse Streaming. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}