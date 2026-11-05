// sw.js - Service Worker for Background App Switching Support
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TRIGGER_ALARM') {
        const title = event.data.title || "⚠️ ALARM DUE!";
        const options = {
            body: event.data.body || "Your task is due now!",
            icon: "https://cdn-icons-png.flaticon.com/512/3236/3236940.png",
            vibrate: [300, 100, 300, 100, 300],
            tag: 'task-alarm-' + Date.now(),
            requireInteraction: true
        };
        self.registration.showNotification(title, options);
    }
});
