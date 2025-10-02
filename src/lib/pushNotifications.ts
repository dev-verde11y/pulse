// Utilitários para Push Notifications na PWA

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications não são suportadas neste navegador');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error('Erro ao inicializar push notifications:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notificações não são suportadas neste navegador');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('Permissão de notificação:', permission);
    return permission;
  }

  async subscribe(vapidPublicKey: string): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      console.error('Service Worker não está registrado');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      console.log('Inscrito para push notifications:', subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error('Erro ao se inscrever para push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Desinscrito de push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao se desinscrever de push notifications:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Erro ao obter subscription:', error);
      return null;
    }
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Enviar notificação local (sem servidor)
  async showLocalNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (this.getPermissionStatus() !== 'granted') {
      console.warn('Permissão de notificação não concedida');
      return;
    }

    try {
      if (this.registration) {
        await this.registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          ...options
        });
      } else {
        new Notification(title, {
          icon: '/icons/icon-192x192.png',
          ...options
        });
      }
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
    }
  }
}

// Hook para usar push notifications
export function usePushNotifications() {
  const manager = PushNotificationManager.getInstance();

  return {
    initialize: () => manager.initialize(),
    requestPermission: () => manager.requestPermission(),
    subscribe: (vapidKey: string) => manager.subscribe(vapidKey),
    unsubscribe: () => manager.unsubscribe(),
    getSubscription: () => manager.getSubscription(),
    isSupported: () => manager.isSupported(),
    getPermissionStatus: () => manager.getPermissionStatus(),
    showLocalNotification: (title: string, options?: NotificationOptions) =>
      manager.showLocalNotification(title, options)
  };
}