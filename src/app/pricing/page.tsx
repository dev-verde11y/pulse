'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Image from "next/image"

export default function PricingPage() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSelectClass = () => {
    router.push('/plans')
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <Header forceSolid={isScrolled} />

      {/* Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
        {/* Animated Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] z-10"></div>

          {/* Subtle Particles/Grid */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-fade-in-up">
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">O Chamado da Glória</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-10">
            ESCOLHA SUA <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent animate-gradient-x underline decoration-blue-500/20 decoration-8 underline-offset-8">CLASSE</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed mb-16">
            Sua jornada épica merece o melhor equipamento. Desbloqueie o potencial máximo <br className="hidden md:block" />
            da sua experiência anime com as classes de prestígio da Pulse.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-2 flex-shrink-0">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> 7 Dias Grátis
            </span>
            <span className="hidden sm:block text-slate-800">•</span>
            <span className="flex items-center gap-2 flex-shrink-0">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Cancele a Qualquer Momento
            </span>
            <span className="hidden sm:block text-slate-800">•</span>
            <span className="flex items-center gap-2 flex-shrink-0">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Sem Compromisso
            </span>
          </div>
        </div>
      </section>

      {/* RPG Classes Showcase */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 -mt-20 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Class: Aventureiro (Tier 1) */}
          <div className="group relative">
            <div className="absolute inset-0 bg-slate-400/5 rounded-[3rem] blur-2xl group-hover:bg-slate-400/10 transition-all duration-500"></div>
            <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 flex flex-col h-full transition-all duration-500 group-hover:border-slate-400/30 group-hover:-translate-y-2">
              <div className="flex justify-between items-start mb-12">
                <div className="w-20 h-20 rounded-3xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                  🛡️
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rank I</span>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Aventureiro</h3>
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">Grátis</span>
                </div>
                <p className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-widest">Inicie sua jornada</p>
              </div>

              <ul className="space-y-5 mb-12 flex-grow">
                {[
                  'Acesso a títulos selecionados',
                  'Qualidade HD Standard',
                  'Com anúncios entre episódios',
                  '1 Dispositivo por vez'
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSelectClass}
                className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-white/10 active:scale-95"
              >
                Começar Jornada
              </button>
            </div>
          </div>

          {/* Class: Cavaleiro (Tier 2 - Popular) */}
          <div className="group relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-blue-600/10 rounded-[3rem] blur-3xl group-hover:bg-blue-600/20 transition-all duration-500"></div>

            <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-blue-500/20 rounded-[3rem] p-10 flex flex-col h-full transition-all duration-500 group-hover:border-blue-500/40 group-hover:-translate-y-2 ring-1 ring-blue-500/10">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-xl shadow-blue-900/40 z-30">
                Classe Recomendada
              </div>

              <div className="flex justify-between items-start mb-12">
                <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500 shadow-blue-500/10">
                  ⚔️
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Rank II</span>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Cavaleiro</h3>
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-black text-slate-500 mr-2">R$</span>
                  <span className="text-5xl font-black">14,90</span>
                  <span className="text-slate-500 text-sm font-bold">/mês</span>
                </div>
                <p className="text-blue-400 text-sm font-bold mt-2 uppercase tracking-widest">Evolução constante</p>
              </div>

              <ul className="space-y-5 mb-12 flex-grow">
                {[
                  'Acesso ILIMITADO ao catálogo',
                  'Qualidade Full HD 1080p',
                  'ZERO Anúncios',
                  '2 Telas simultâneas'
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-4 text-slate-200 text-sm font-bold">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSelectClass}
                className="w-full py-5 rounded-2xl bg-blue-600 font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-blue-500 hover:shadow-2xl hover:shadow-blue-600/30 active:scale-95 text-white"
              >
                Iniciando Quest
              </button>
            </div>
          </div>

          {/* Class: Titã (Tier 3 - Legendary) */}
          <div className="group relative">
            <div className="absolute inset-0 bg-yellow-500/5 rounded-[3rem] blur-2xl group-hover:bg-yellow-500/10 transition-all duration-500"></div>
            <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 flex flex-col h-full transition-all duration-500 group-hover:border-yellow-500/30 group-hover:-translate-y-2">
              <div className="flex justify-between items-start mb-12">
                <div className="w-20 h-20 rounded-3xl bg-yellow-500/5 border border-yellow-500/10 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                  👑
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Rank III</span>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Titã</h3>
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-black text-slate-500 mr-2">R$</span>
                  <span className="text-5xl font-black">19,90</span>
                  <span className="text-slate-500 text-sm font-bold">/mês</span>
                </div>
                <p className="text-yellow-500 text-sm font-bold mt-2 uppercase tracking-widest">Poder absoluto</p>
              </div>

              <ul className="space-y-5 mb-12 flex-grow">
                {[
                  'Qualidade ULTRA HD 4K',
                  'Modo Offline (Downloads)',
                  '4 Telas simultâneas',
                  'Acesso antecipado a simulcasts'
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-4 text-slate-300 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSelectClass}
                className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-white/10 active:scale-95"
              >
                Elevar Poder
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Benefits Grid - Adventurer's Perks */}
      <section className="py-40 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Vantagens de Guilda</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">O PODER DA FORJA <span className="text-slate-500">PULSE</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: '🚀', title: 'Velocidade Divina', desc: 'Episódios disponíveis apenas 1 hora após a exibição original japonesa.' },
              { icon: '💎', title: 'Cristal 4K', desc: 'Imersão visual máxima com resolução nativa e suporte HDR para cores vibrantes.' },
              { icon: '🗡️', title: 'Zero Distração', desc: 'Sua batalha sem interrupções. Sem publicidade em todos os planos de elite.' },
              { icon: '🌍', title: 'Toda Parte', desc: 'Sincronize seu progresso e assista em qualquer dispositivo, em qualquer lugar.' }
            ].map((perk, i) => (
              <div key={i} className="group">
                <div className="text-5xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 inline-block">
                  {perk.icon}
                </div>
                <h4 className="text-xl font-black uppercase tracking-tighter mb-4 group-hover:text-blue-400 transition-colors">
                  {perk.title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  {perk.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Achievement CTA */}
      <section className="py-40 relative overflow-hidden bg-blue-600/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-10 leading-[0.9]">
            PRONTO PARA <br /> <span className="text-blue-400">EVOLUIR?</span>
          </h3>
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Junte-se a milhares de aventureiros e comece sua jornada com 7 dias de glória total por nossa conta.
          </p>
          <button
            onClick={handleSelectClass}
            className="px-16 py-6 bg-white text-black rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-blue-400 hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95"
          >
            Criar seu Personagem
          </button>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradientX 5s ease infinite;
        }
        @keyframes gradientX {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}