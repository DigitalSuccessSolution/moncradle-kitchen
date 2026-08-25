importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Replace these with your actual Firebase config keys
const firebaseConfig = {
  apiKey: "AIzaSyBPaKPF5Gp4Zpoe1a1LRwmY_Qgb8rI5oRw",
  authDomain: "moncradle-23737.firebaseapp.com",
  projectId: "moncradle-23737",
  storageBucket: "moncradle-23737.firebasestorage.app",
  messagingSenderId: "82912473859",
  appId: "1:82912473859:web:9c79430d0ccd99f9e4ef36"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icon-192x192.png',
    data: {
      url: payload.data?.url || '/orders' // Set default URL to open
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks like a standard PWA
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  // Close the notification
  event.notification.close();

  // Get the URL to open and make it absolute
  const targetPath = event.notification.data?.url || '/orders';
  const urlToOpen = new URL(targetPath, self.location.origin).href;

  // Focus existing window or open a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      
      let matchingClient = null;
      
      // Check if there is already a window/tab open for our app
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        
        // If it's already exactly on the URL, just focus it
        if (client.url === urlToOpen) {
          matchingClient = client;
          break;
        }
        
        // If it's open to our origin, we can use it and navigate it
        if (client.url.startsWith(self.location.origin)) {
          matchingClient = client;
        }
      }
      
      if (matchingClient) {
        // If a window is found, navigate it to the target URL and focus it
        if (matchingClient.url !== urlToOpen) {
          return matchingClient.navigate(urlToOpen).then(client => client ? client.focus() : null);
        }
        return matchingClient.focus();
      } else {
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }
    })
  );
});
