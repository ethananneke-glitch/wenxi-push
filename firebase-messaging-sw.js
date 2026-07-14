// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

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
  
  // Firebase automatically shows the payload.notification if it exists.
  // We ONLY show a manual notification here if the payload contains raw 'data' instead of 'notification'.
  if (!payload.notification && payload.data) {
    const notificationTitle = payload.data.title || 'New Update!';
    
    const notificationOptions = {
      body: payload.data.body || 'Check out the latest on Wenxi Market.',
      icon: FAVICON_URL, // Hardcoded absolute secure URL
      badge: FAVICON_URL, // Small monochrome notification bar icon on Android
      data: {
        click_action: payload.data.click_action || 'https://www.wenximarket.com/'
      }
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

// 2. Handle Notification Clicks (OPENS WEBSITE)
self.addEventListener('notificationclick', function(event) {
  // Close the notification bubble
  event.notification.close();

  // Determine the landing page URL (fallback to homepage if not sent in payload)
  let targetUrl = 'https://www.wenximarket.com/';
  if (event.notification.data && event.notification.data.click_action) {
    targetUrl = event.notification.data.click_action;
  } else if (event.notification.clickAction) { // Legacy structure fallback
    targetUrl = event.notification.clickAction;
  }

  // Force the browser to open your website/app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If your website is already open in a tab, focus on it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a brand new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
