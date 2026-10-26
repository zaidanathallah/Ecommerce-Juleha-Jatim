// Juleha Marketplace Service Worker - Background Prayer Notifications & Offline Resilience
const CACHE_NAME = 'juleha-cache-v1';

self.addEventListener('install', (event) => {
    // Force active state immediately without waiting
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Listen for message from frontend clients (e.g., when prayer time triggers in background tab)
self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'SHOW_PRAYER_NOTIFICATION') {
        const title = event.data.title || 'Waktu Sholat Telah Tiba';
        const options = {
            body: event.data.body || 'Mari tunaikan sholat tepat waktu untuk wilayah Anda.',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: event.data.tag || 'prayer-notification',
            renotify: true,
            requireInteraction: true,
            data: {
                url: event.data.url || '/'
            }
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

// Handle push notification events
self.addEventListener('push', (event) => {
    let payload = { title: 'Waktu Sholat Telah Tiba', body: 'Waktunya menunaikan ibadah sholat.' };
    try {
        if (event.data) {
            payload = event.data.json();
        }
    } catch (e) {
        payload = { title: 'Notifikasi Sholat Juleha Jatim', body: event.data.text() };
    }

    const options = {
        body: payload.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'prayer-reminder',
        renotify: true,
        data: {
            url: payload.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

// Click notification behavior: Focus or open window
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
