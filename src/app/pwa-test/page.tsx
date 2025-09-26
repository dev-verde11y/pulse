'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { usePushNotifications } from '@/lib/pushNotifications';
import PushNotificationSettings from '@/components/PushNotificationSettings';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function PWATestPage() {
  const { isInstalled, isInstallable, installPWA } = usePWA();
  const pushManager = usePushNotifications();

  const [cacheInfo, setCacheInfo] = useState<Array<Record<string, unknown>>>([]);
  const [swInfo, setSwInfo] = useState<Record<string, unknown> | null>(null);
  const [networkStatus, setNetworkStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // Definir status inicial apenas no cliente
    setNetworkStatus(navigator.onLine);

    // Monitorar status da rede
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        const cachePromises = cacheNames.map(async name => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return { name, itemCount: keys.length };
        });

        Promise.all(cachePromises).then(setCacheInfo);
      });
    }

    // Verificar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        setSwInfo({
          active: !!registration?.active,
          scope: registration?.scope,
          state: registration?.active?.state
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const testNotification = async () => {
    const permission = await pushManager.requestPermission();
    if (permission === 'granted') {
      await pushManager.showLocalNotification('Teste PWA', {
        body: 'Esta é uma notificação de teste da PWA do Pulse!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: 'test-pwa'
      });
    }
  };

  const testOfflineCache = async () => {
    try {
      const response = await fetch('/api/animes?limit=5');
      const data = await response.json();
      alert(`Cache funcionando! Carregados ${data.animes?.length || 0} animes`);
    } catch (error) {
      alert('Erro ao testar cache: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            🚀 Teste da PWA - Pulse
          </h1>

          {/* Status da PWA */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                📱 Status da PWA
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Instalada:</span>
                  <span className={isInstalled ? 'text-green-600' : 'text-red-600'}>
                    {isInstalled ? '✅ Sim' : '❌ Não'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Instalável:</span>
                  <span className={isInstallable ? 'text-green-600' : 'text-gray-600'}>
                    {isInstallable ? '✅ Sim' : '⏳ Aguardando'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Online:</span>
                  <span className={
                    networkStatus === null ? 'text-gray-600' :
                    networkStatus ? 'text-green-600' : 'text-red-600'
                  }>
                    {networkStatus === null ? '⏳ Verificando...' :
                     networkStatus ? '🟢 Conectado' : '🔴 Offline'}
                  </span>
                </div>
              </div>

              {isInstallable && !isInstalled && (
                <button
                  onClick={installPWA}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  📲 Instalar PWA
                </button>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                ⚙️ Service Worker
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={swInfo?.active ? 'text-green-600' : 'text-red-600'}>
                    {swInfo?.active ? '✅ Ativo' : '❌ Inativo'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {swInfo?.state || 'N/A'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Scope: {swInfo?.scope || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Cache Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              💾 Informações do Cache
            </h2>
            <div className="grid gap-2">
              {cacheInfo.map((cache, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {cache.name}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {cache.itemCount} itens
                  </span>
                </div>
              ))}
              {cacheInfo.length === 0 && (
                <p className="text-gray-500 text-sm">Nenhum cache encontrado</p>
              )}
            </div>
          </div>

          {/* Testes */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testNotification}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔔 Testar Notificação
            </button>

            <button
              onClick={testOfflineCache}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              📦 Testar Cache
            </button>

            <button
              onClick={() => {
                // Limpar localStorage e forçar prompt
                localStorage.removeItem('pwa-prompt-dismissed');
                alert('Cache limpo! Recarregue a página e aguarde 5 segundos.');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📲 Forçar Prompt PWA
            </button>
          </div>

          {/* Push Notifications Settings */}
          <div className="mb-6">
            <PushNotificationSettings />
          </div>

          {/* Instruções de teste */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              📋 Como Testar
            </h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p><strong>1. Instalação:</strong> Se aparecer o prompt, clique &quot;Instalar&quot;</p>
              <p><strong>2. Offline:</strong> DevTools → Network → &quot;Offline&quot; → Recarregue</p>
              <p><strong>3. Notificações:</strong> Clique &quot;Testar Notificação&quot; acima</p>
              <p><strong>4. Cache:</strong> Clique &quot;Testar Cache&quot; para verificar se funciona</p>
              <p><strong>5. Manifest:</strong> DevTools → Application → Manifest</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt de instalação flutuante */}
      <PWAInstallPrompt />
    </div>
  );
}