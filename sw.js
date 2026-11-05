// sw.js - Service Worker for Background App Switching & Alarm Support
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    // Accept both 'action' or 'type' to prevent property mismatch
    if (event.data && (event.data.action === 'TRIGGER_ALARM' || event.data.type === 'TRIGGER_ALARM')) {
        const title = event.data.title || "⚠️ ALARM DUE!";
        const options = {
            body: event.data.body || "Your task is due now!",
            icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%23FFD166'/%3E%3C/svg%3E",
            badge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%23FFD166'/%3E%3C/svg%3E",
            vibrate: [500, 200, 500, 200, 500],
            tag: 'task-alarm-' + Date.now(),
            requireInteraction: true,
            renotify: true
        };
        
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

// Re-open or focus the app when the notification is tapped in the status bar
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('./');
        })
    );
});
