// ==========================================
// 1. CLICK LISTENER MUST GO FIRST!
// ==========================================
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click detected!');
  
  // Close the notification pop-up
  event.notification.close();

  // Retrieve the target link from payload data
  let targetUrl = 'https://www.wenximarket.com/';
  if (event.notification.data && event.notification.data.click_action) {
    targetUrl = event.notification.data.click_action;
  } else if (event.notification.clickAction) { 
    targetUrl = event.notification.clickAction;
  }

  // Normalize URLs to prevent mismatches (e.g., matching "/" with "/index.html")
  const normalizedTarget = new URL(targetUrl, self.location.origin).href;

  // Open the tab or focus on an existing one
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

// ==========================================
// 2. NOW SAFELY IMPORT FIREBASE
// ==========================================
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

// Initialize the Firebase app
firebase.initializeApp({
  apiKey: "AIzaSyDTMzML8lwOLKKEcyZWCJipia_cAednd94",
  authDomain: "wenxi-market.firebaseapp.com",
  projectId: "wenxi-market",
  storageBucket: "wenxi-market.firebasestorage.app",
  messagingSenderId: "558336205782",
  appId: "1:558336205782:web:21e25c13abde8ba4507a77"
});

const messaging = firebase.messaging();
const FAVICON_URL = "https://www.wenximarket.com/favicon.ico";

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message payload: ', payload);
  
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
