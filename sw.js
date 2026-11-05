// sw.js - Service Worker with Fixed Low Priority Vibration & Center Popups
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && (event.data.action === 'TRIGGER_ALARM' || event.data.type === 'TRIGGER_ALARM')) {
        const priority = event.data.priority || 'Medium';
        const title = event.data.title || "⚠️ ALARM DUE!";
        const body = event.data.body || "Your task is due now!";
        
        let vibratePattern = [200, 100, 200];
        let requireInteractionSetting = false;

        if (priority === 'High') {
            vibratePattern = [500, 200, 500, 200, 500];
            requireInteractionSetting = true;
        } else if (priority === 'Medium') {
            vibratePattern = [300, 100, 300];
            requireInteractionSetting = true;
        } else if (priority === 'Low') {
            // Distinct multi-pulse vibration pattern for Low priority so it triggers reliably on mobile
            vibratePattern = [100, 50, 100]; 
            requireInteractionSetting = false;
        }

        const options = {
            body: body,
            icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%23FFD166'/%3E%3C/svg%3E",
            badge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%23FFD166'/%3E%3C/svg%3E",
            vibrate: vibratePattern,
            tag: 'task-alarm-' + Date.now(),
            requireInteraction: requireInteractionSetting,
            renotify: true,
            priority: 'high',
            visibility: 'public',
            actions: [
                { action: 'open', title: '📂 Open App' },
                { action: 'dismiss', title: '❌ Dismiss' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('./');
        })
    );
});
