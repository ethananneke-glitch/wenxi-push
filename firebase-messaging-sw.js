// ==========================================
// 1. CLICK LISTENER
// ==========================================
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] ===== NOTIFICATION CLICK =====');
  console.log('[Service Worker] Action:', event.action);
  console.log('[Service Worker] Notification data:', JSON.stringify(event.notification.data));
  
  // Close the notification
  event.notification.close();

  // Get data from notification
  const data = event.notification.data || {};
  const action = event.action;
  
  console.log('[Service Worker] Parsed data:', JSON.stringify(data));
  console.log('[Service Worker] chatId:', data.chatId);
  console.log('[Service Worker] orderId:', data.orderId);
  console.log('[Service Worker] type:', data.type);
  console.log('[Service Worker] click_action:', data.click_action);
  
  let targetUrl = 'https://www.wenximarket.com/';
  
  if (action === 'reply') {
    if (data.chatId) {
      targetUrl = `/p/chats.html?id=${data.chatId}`;
      console.log('[Service Worker] ✅ REPLY → CHAT:', targetUrl);
    } else if (data.orderId) {
      if (data.type === 'order') {
        targetUrl = `/p/myshoporders.html?order=${data.orderId}`;
      } else {
        targetUrl = `/p/myorders.html?order=${data.orderId}`;
      }
      console.log('[Service Worker] ✅ REPLY → ORDER:', targetUrl);
    } else {
      console.log('[Service Worker] ❌ No chatId or orderId found!');
      targetUrl = data.click_action || 'https://www.wenximarket.com/';
    }
  } else if (action === 'view_order') {
    if (data.orderId) {
      if (data.type === 'order') {
        targetUrl = `/p/myshoporders.html?order=${data.orderId}`;
      } else {
        targetUrl = `/p/myorders.html?order=${data.orderId}`;
      }
      console.log('[Service Worker] ✅ VIEW ORDER:', targetUrl);
    }
  } else if (action === 'dismiss') {
    console.log('[Service Worker] Dismissed');
    return;
  } else {
    // No action - use click_action
    targetUrl = data.click_action || 'https://www.wenximarket.com/';
    console.log('[Service Worker] Default action:', targetUrl);
  }

  console.log('[Service Worker] Final URL:', targetUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          const clientUrl = new URL(client.url, self.location.origin).href;
          const targetUrlFull = new URL(targetUrl, self.location.origin).href;
          
          if (clientUrl === targetUrlFull && 'focus' in client) {
            console.log('[Service Worker] Focusing existing tab');
            return client.focus();
          }
        }
        if (clients.openWindow) {
          console.log('[Service Worker] Opening new window');
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ==========================================
// 2. IMPORT FIREBASE
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

messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] ===== BACKGROUND MESSAGE =====');
  console.log('[Service Worker] Payload:', JSON.stringify(payload));
  
  const notification = payload.notification || {};
  const data = payload.data || {};
  
  console.log('[Service Worker] Received data:', JSON.stringify(data));
  console.log('[Service Worker] chatId:', data.chatId);
  console.log('[Service Worker] orderId:', data.orderId);
  
  const notificationTitle = notification.title || data.title || 'New Update!';
  const notificationOptions = {
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
    notificationOptions.actions = [
      { action: 'view_order', title: '📦 View Order' },
      { action: 'reply', title: '💬 Reply' }
    ];
  }

  console.log('[Service Worker] Notification options:', JSON.stringify(notificationOptions));
  self.registration.showNotification(notificationTitle, notificationOptions);
});
