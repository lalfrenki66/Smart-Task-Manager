// sw.js - Upgraded for Advanced Priorities & Ringtones
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.action === 'TRIGGER_ALARM') {
        showSystemAlarm(event.data.title, event.data.body, event.data.priority);
    }

    if (event.data.action === 'SCHEDULE_ALARM' && event.data.timestamp) {
        scheduleBackgroundAlarm(event.data);
    }
});

function showSystemAlarm(title, body, priority = 'Medium') {
    // Priority-based vibration patterns
    let vibratePattern = [300, 100, 300];
    if (priority === 'High' || priority === 'Urgent') {
        vibratePattern = [500, 200, 500, 200, 500, 200, 500];
    } else if (priority === 'Low') {
        vibratePattern = [100, 50, 100];
    }

    const options = {
        body: body || "Your task is due now!",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%23FFD166'/%3E%3C/svg%3E",
        badge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='100' fill='%23FFD166'/%3E%3C/svg%3E",
        vibrate: vibratePattern,
        tag: 'task-alarm-' + Date.now(),
        requireInteraction: true,
        renotify: true,
        silent: false,
        actions: [
            { action: 'open', title: '📂 Open & Stop Alarm' },
            { action: 'dismiss', title: '❌ Dismiss' }
        ]
    };

    return self.registration.showNotification(`[${priority}] ${title || "⚠️ ALARM DUE!"}`, options);
}

function scheduleBackgroundAlarm(data) {
    if ('showTrigger' in Notification.prototype && data.timestamp > Date.now()) {
        self.registration.showNotification(`[${data.priority || 'Medium'}] ${data.title || "⚠️ ALARM DUE!"}`, {
            body: data.body || "Scheduled reminder",
            tag: 'scheduled-' + data.id,
            showTrigger: new TimestampTrigger(data.timestamp),
            vibrate: [500, 200, 500, 200, 500],
            requireInteraction: true,
            silent: false,
            actions: [
                { action: 'open', title: '📂 Open & Stop Alarm' },
                { action: 'dismiss', title: '❌ Dismiss' }
            ]
        });
    }
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                clientList[0].postMessage({ 
                    action: 'OPEN_MODAL_FROM_NOTI', 
                    title: event.notification.title, 
                    body: event.notification.body 
                });
                return clientList[0].focus();
            }
            return clients.openWindow('./');
        })
    );
});
