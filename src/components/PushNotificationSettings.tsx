'use client';

import { useState, useEffect } from 'react';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';
import { usePushNotifications } from '@/lib/pushNotifications';

export default function PushNotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);

  const pushManager = usePushNotifications();

  useEffect(() => {
    const initializePushNotifications = async () => {
      setIsSupported(pushManager.isSupported());
      setPermission(pushManager.getPermissionStatus());

      if (pushManager.isSupported()) {
        await pushManager.initialize();
        const subscription = await pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    };

    initializePushNotifications();
  }, []);

  const handleToggleNotifications = async () => {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      if (isSubscribed) {
        // Desinscrever
        const success = await pushManager.unsubscribe();
        if (success) {
          setIsSubscribed(false);
          // Aqui você removeria a subscription do servidor
          console.log('Push notifications desabilitadas');
        }
      } else {
        // Inscrever
        if (permission !== 'granted') {
          const newPermission = await pushManager.requestPermission();
          setPermission(newPermission);

          if (newPermission !== 'granted') {
            setIsLoading(false);
            return;
          }
        }

        // VAPID key (em produção, buscar do servidor)
        const vapidKey = 'BCqGKq_XkGlSFKYoKqzElLo1q8zKvfakKN_G8H_Wj9YT8aMYGjqZcHrKK7_wGxmGPJN5z7FGMgOTU8ZqF7qWKg';

        const subscription = await pushManager.subscribe(vapidKey);
        if (subscription) {
          setIsSubscribed(true);
          // Aqui você enviaria a subscription para o servidor
          console.log('Push notifications habilitadas:', subscription);

          // Mostrar notificação de teste
          await pushManager.showLocalNotification('Pulse', {
            body: 'Notificações ativadas com sucesso! Você receberá avisos sobre novos episódios.',
            tag: 'welcome'
          });
        }
      }
    } catch (error) {
      console.error('Erro ao alterar configuração de notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    if (permission === 'granted') {
      await pushManager.showLocalNotification('Teste - Pulse', {
        body: 'Esta é uma notificação de teste do Pulse!',
        tag: 'test'
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <BellSlashIcon className="w-6 h-6 text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Notificações não suportadas
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Seu navegador não suporta push notifications
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isSubscribed ? (
            <BellIcon className="w-6 h-6 text-blue-600" />
          ) : (
            <BellSlashIcon className="w-6 h-6 text-gray-400" />
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Receba avisos sobre novos episódios e conteúdos
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleNotifications}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isSubscribed ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isSubscribed ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {permission === 'denied' && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            As notificações foram bloqueadas. Para receber notificações, permita nas configurações do navegador.
          </p>
        </div>
      )}

      {isSubscribed && (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Notificações ativadas! Você receberá avisos sobre:
            </p>
            <ul className="mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Novos episódios dos seus animes favoritos</li>
              <li>• Novas temporadas disponíveis</li>
              <li>• Recomendações personalizadas</li>
            </ul>
          </div>

          <button
            onClick={testNotification}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Testar Notificação
          </button>
        </div>
      )}
    </div>
  );
}