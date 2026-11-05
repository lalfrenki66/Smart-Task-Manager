// sw.js - Service Worker for Background Notification Bar & Priority Handling
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
        
        let vibratePattern = [300, 100, 300];
        let requireInteractionSetting = false;

        // Priority-based vibration and lock-screen requirements
        if (priority === 'High') {
            vibratePattern = [500, 200, 500, 200, 500, 200, 500]; // Aggressive long vibration
            requireInteractionSetting = true; // Stays on status bar until clicked
        } else if (priority === 'Medium') {
            vibratePattern = [200, 100, 200]; // Medium vibration
            requireInteractionSetting = false;
        } else if (priority === 'Low') {
            vibratePattern = [150]; // Subtle single vibration only (silent)
            requireInteractionSetting = false;
        }

        const options = {
            body: body,
            icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%23FFD166'/%3E%3C/svg%3E",
            badge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%23FFD166'/%3E%3C/svg%3E",
            vibrate: vibratePattern,
            tag: 'task-alarm-' + Date.now(),
            requireInteraction: requireInteractionSetting,
            renotify: true
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

// Re-open or focus the app when notification is tapped in the status bar
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
