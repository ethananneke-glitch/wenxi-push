// ==========================================
// 1. SKIP WAITING - Prevents "Updated in background" popup
// ==========================================
self.addEventListener('install', function(event) {
  event.waitUntil(
    self.skipWaiting()
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    self.clients.claim()
  );
});

// ==========================================
// 2. NOTIFICATION CLICK HANDLER (MOBILE FRIENDLY)
// ==========================================
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Click detected');
  
  // Close the notification
  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action || '';
  
  let targetUrl = 'https://www.wenximarket.com/';
  
  if (action === 'reply') {
    if (data.chatId) {
      targetUrl = `/p/chats.html?id=${data.chatId}`;
    } else if (data.orderId) {
      targetUrl = data.type === 'order' 
        ? `/p/myshoporders.html?order=${data.orderId}`
        : `/p/myorders.html?order=${data.orderId}`;
    }
  } else if (action === 'view_order' && data.orderId) {
    targetUrl = data.type === 'order'
      ? `/p/myshoporders.html?order=${data.orderId}`
      : `/p/myorders.html?order=${data.orderId}`;
  } else {
    targetUrl = data.click_action || 'https://www.wenximarket.com/';
  }

  // ✅ FULL URL for mobile
  const fullUrl = new URL(targetUrl, self.location.origin).href;
  console.log('[SW] Opening:', fullUrl);

  event.waitUntil(
    // First try to find and focus an existing window
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(clientList) {
      // Try to find an existing tab with the same URL
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        var clientUrl = new URL(client.url, self.location.origin).href;
        if (clientUrl === fullUrl && 'focus' in client) {
          console.log('[SW] Focusing existing tab');
          return client.focus();
        }
      }
      // If no existing tab, open a new one
      if (clients.openWindow) {
        console.log('[SW] Opening new window');
        return clients.openWindow(fullUrl);
      }
    })
    // ✅ FALLBACK: If clients.openWindow fails (mobile WebView)
    .catch(function(err) {
      console.log('[SW] openWindow failed, trying navigation:', err);
      // Try to navigate the current client
      return clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then(function(clientList) {
        if (clientList.length > 0) {
          // Navigate the first client to the target URL
          return clientList[0].navigate(fullUrl);
        }
        // Last resort: open a new window with a slight delay
        return new Promise(function(resolve) {
          setTimeout(function() {
            resolve(clients.openWindow(fullUrl));
          }, 1000);
        });
      });
    })
  );
});

// ==========================================
// 3. IMPORT FIREBASE
// ==========================================
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

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

// ==========================================
// 4. BACKGROUND MESSAGE HANDLER
// ==========================================
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message:', JSON.stringify(payload));
  
  const notification = payload.notification || {};
  const data = payload.data || {};
  
  const title = notification.title || data.title || 'New Update!';
  const options = {
    body: notification.body || data.body || 'Check out the latest on Wenxi Market.',
    icon: notification.icon || FAVICON_URL,
    badge: notification.badge || FAVICON_URL,
    data: {
      chatId: data.chatId || '',
      orderId: data.orderId || '',
      type: data.type || '',
      click_action: data.click_action || 'https://www.wenximarket.com/'
    },
    actions: [
      { action: 'reply', title: '💬 Reply' },
      { action: 'dismiss', title: '✕ Dismiss' }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };
  
  if (data.type === 'order' || data.type === 'order_update') {
    options.actions = [
      { action: 'view_order', title: '📦 View Order' },
      { action: 'reply', title: '💬 Reply' }
    ];
  }
  
  self.registration.showNotification(title, options);
});

console.log('[SW] Ready - handling notifications and clicks');
