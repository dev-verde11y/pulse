'use client'

import { useState } from 'react'

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('general')

    const tabs = [
        { id: 'general', label: 'Decretos Reais', icon: '📜' },
        { id: 'experience', label: 'Vida de Aventureiro', icon: '⚔️' },
        { id: 'security', label: 'Torre de Guarda', icon: '🛡️' },
        { id: 'advanced', label: 'Alquimia Arcana', icon: '⚗️' },
    ]

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">LEIS DO REINO</h2>
                        <p className="text-gray-500 font-mono text-xs tracking-widest text-indigo-400/60">DEFININDO OS RUMOS DO UNIVERSO PULSE</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Sidebar */}
                <div className="w-full lg:w-64 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border ${activeTab === tab.id
                                    ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-950/40 border border-white/5 rounded-3xl backdrop-blur-xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 space-y-8">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-indigo-400">📜</span> Decretos Reais
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome do Reino (Site)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Pulse"
                                            className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Estandarte Principal (Slogan)</label>
                                        <input
                                            type="text"
                                            placeholder="O seu portal para o mundo anime"
                                            className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-200">Portões do Reino (Cadastros)</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-mono">Permitir que novos aventureiros entrem</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'experience' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-indigo-400">⚔️</span> Vida de Aventureiro
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-2xl border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-200">Visão em Massa (Sincronia de Telas)</p>
                                            <p className="text-xs text-gray-500">Máximo de aventureiros assistindo na mesma conta</p>
                                        </div>
                                        <select className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
                                            <option>1 Dispositivo</option>
                                            <option>2 Dispositivos</option>
                                            <option>4 Dispositivos</option>
                                            <option>Ilimitado</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-2xl border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-200">Auto-Reprodução (Fluxo Contínuo)</p>
                                            <p className="text-xs text-gray-500">Próxima saga inicia automaticamente</p>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-indigo-400">🛡️</span> Torre de Guarda
                                </h3>
                                <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-2xl">🚧</div>
                                    <p className="text-sm text-gray-500 font-mono tracking-widest italic uppercase">Configurações de Contra-espionagem sendo forjadas...</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'advanced' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-indigo-400">⚗️</span> Alquimia Arcana
                                </h3>
                                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                    <h4 className="text-red-400 font-black text-xs uppercase tracking-widest mb-4">Zona de Autodestruição</h4>
                                    <button className="px-6 py-3 bg-red-600/20 text-red-500 border border-red-500/30 rounded-xl text-xs font-black uppercase hover:bg-red-600/40 transition-all">
                                        Limpar Todos os Caches de Mana
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="pt-6 border-t border-white/5 flex justify-end">
                            <button className="group relative px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20">
                                Sincronizar Leis no Reino
                                <div className="absolute inset-x-0 -bottom-1 h-1 bg-white/20 translate-y-full blur-sm group-hover:blur-md transition-all"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
