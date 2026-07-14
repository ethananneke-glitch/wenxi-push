// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDTMzML8lwOLKKEcyZWCJipia_cAednd94",
  authDomain: "wenxi-market.firebaseapp.com",
  projectId: "wenxi-market",
  storageBucket: "wenxi-market.firebasestorage.app",
  messagingSenderId: "558336205782",
  appId: "1:558336205782:web:21e25c13abde8ba4507a77"
});

const messaging = firebase.messaging();

// Your verified secure favicon link
const FAVICON_URL = "https://www.wenximarket.com/favicon.ico";

// 1. Handle background notifications (NO DUPLICATES)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  if (!payload.notification && payload.data) {
    const notificationTitle = payload.data.title || 'New Update!';
    
    const notificationOptions = {
      body: payload.data.body || 'Check out the latest on Wenxi Market.',
      icon: FAVICON_URL,
      badge: FAVICON_URL,
      data: {
        click_action: payload.data.click_action || 'https://www.wenximarket.com/'
      }
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

// 2. Handle Notification Clicks (OPENS WEBSITE)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  let targetUrl = 'https://www.wenximarket.com/';
  if (event.notification.data && event.notification.data.click_action) {
    targetUrl = event.notification.data.click_action;
  } else if (event.notification.clickAction) { 
    targetUrl = event.notification.clickAction;
  }

  // Safely normalize URLs to avoid matching issues (e.g. trailing slashes)
  const normalizedTarget = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          const clientUrl = new URL(client.url, self.location.origin).href;
          
          if (clientUrl === normalizedTarget && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
