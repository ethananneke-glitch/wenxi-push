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

  // Handle action buttons (View Order, Reply, etc.)
  if (event.action) {
    const data = event.notification.data || {};
    const orderId = data.orderId || '';
    const chatId = data.chatId || '';
    const type = data.type || '';

    switch (event.action) {
      case 'view_order':
        if (type === 'order') {
          targetUrl = `/p/myshoporders.html?order=${orderId}`;
        } else {
          targetUrl = `/p/myorders.html?order=${orderId}`;
        }
        break;
      case 'reply':
        if (chatId) {
          targetUrl = `/p/chats.html?id=${chatId}`;
        } else if (orderId) {
          targetUrl = `/p/myorders.html?order=${orderId}`;
        }
        break;
      case 'dismiss':
        return;
    }
  }

  // Normalize URLs to prevent mismatches
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
  
  // Get notification data from payload
  const notification = payload.notification || {};
  const data = payload.data || {};
  
  const notificationTitle = notification.title || data.title || 'New Update!';
  const notificationOptions = {
    body: notification.body || data.body || 'Check out the latest on Wenxi Market.',
    icon: notification.icon || FAVICON_URL,
    badge: notification.badge || FAVICON_URL,
    data: {
      click_action: data.click_action || data.orderId ? `/p/myorders.html?order=${data.orderId}` : 'https://www.wenximarket.com/',
      orderId: data.orderId || '',
      chatId: data.chatId || '',
      type: data.type || ''
    },
    actions: [
      { action: 'view_order', title: '📦 View Order' },
      { action: 'reply', title: '💬 Reply' }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
