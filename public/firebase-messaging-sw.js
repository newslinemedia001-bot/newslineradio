// Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCOEwqU1FXbCM_6Z16J-0eIk-zqP8KRcHk",
  authDomain: "newslinemedia-9ff5f.firebaseapp.com",
  projectId: "newslinemedia-9ff5f",
  storageBucket: "newslinemedia-9ff5f.firebasestorage.app",
  messagingSenderId: "105396564197777951159",
  appId: "1:105396564197777951159:web:c95c2ec6ae5d09fabc9b76",
  measurementId: "G-KQ6JQQMGQL"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Newsline Radio';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'New notification from Newsline Radio',
    icon: '/newsline-logo.png',
    badge: '/newsline-logo.png',
    vibrate: [200, 100, 200],
    tag: 'newsline-notification',
    requireInteraction: true,
    data: {
      url: payload.data?.url || 'https://radio.kenlive.co.ke'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  // Open the URL from the notification data or default to homepage
  const urlToOpen = event.notification.data?.url || 'https://radio.kenlive.co.ke';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open with this URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
