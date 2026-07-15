// ==========================================
// 1. CLICK LISTENER MUST GO FIRST!
// ==========================================
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click detected!');
  console.log('[Service Worker] Action:', event.action);
  console.log('[Service Worker] Notification data:', event.notification.data);

  // Close the notification
  event.notification.close();

  // Get data from notification
  const data = event.notification.data || {};
  const action = event.action;
  
  let targetUrl = 'https://www.wenximarket.com/';
  
  // Handle different actions
  if (action === 'reply') {
    // If it's a message notification, go to chat
    if (data.chatId) {
      targetUrl = `/p/chats.html?id=${data.chatId}`;
      console.log('[Service Worker] Reply action with chatId:', data.chatId);
    } 
    // If it's an order notification, go to the order page
    else if (data.orderId) {
      if (data.type === 'order') {
        targetUrl = `/p/myshoporders.html?order=${data.orderId}`;
      } else {
        targetUrl = `/p/myorders.html?order=${data.orderId}`;
      }
      console.log('[Service Worker] Reply action with orderId:', data.orderId);
    } else {
      console.log('[Service Worker] Reply action - no chatId or orderId found');
    }
  } 
  else if (action === 'view_order') {
    // View Order button
    if (data.orderId) {
      if (data.type === 'order') {
        targetUrl = `/p/myshoporders.html?order=${data.orderId}`;
      } else {
        targetUrl = `/p/myorders.html?order=${data.orderId}`;
      }
      console.log('[Service Worker] View Order action:', data.orderId);
    }
  }
  else if (action === 'view') {
    // Default view action
    if (data.chatId) {
      targetUrl = `/p/chats.html?id=${data.chatId}`;
    } else if (data.orderId) {
      if (data.type === 'order') {
        targetUrl = `/p/myshoporders.html?order=${data.orderId}`;
      } else {
        targetUrl = `/p/myorders.html?order=${data.orderId}`;
      }
    }
  }
  else if (action === 'dismiss') {
    // Just close the notification
    return;
  }
  else {
    // No specific action - use click_action from data or default
    targetUrl = data.click_action || 'https://www.wenximarket.com/';
    console.log('[Service Worker] Default action - using click_action:', targetUrl);
  }

  console.log('[Service Worker] Final target URL:', targetUrl);

  // Open the tab or focus on an existing one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Try to find an existing tab with the same URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          const clientUrl = new URL(client.url, self.location.origin).href;
          const targetUrlFull = new URL(targetUrl, self.location.origin).href;
          
          if (clientUrl === targetUrlFull && 'focus' in client) {
            console.log('[Service Worker] Focusing existing tab:', clientUrl);
            return client.focus();
          }
        }
        // If no existing tab, open a new one
        if (clients.openWindow) {
          console.log('[Service Worker] Opening new window:', targetUrl);
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

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message payload: ', payload);
  
  const notification = payload.notification || {};
  const data = payload.data || {};
  
  const notificationTitle = notification.title || data.title || 'New Update!';
  const notificationOptions = {
    body: notification.body || data.body || 'Check out the latest on Wenxi Market.',
    icon: notification.icon || FAVICON_URL,
    badge: notification.badge || FAVICON_URL,
    data: {
      click_action: data.click_action || 'https://www.wenximarket.com/',
      chatId: data.chatId || '',
      orderId: data.orderId || '',
      type: data.type || ''
    },
    actions: [
      { action: 'reply', title: '💬 Reply' },
      { action: 'dismiss', title: '✕ Dismiss' }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  // If it's an order notification, add View Order button
  if (data.type === 'order' || data.type === 'order_update') {
    notificationOptions.actions = [
      { action: 'view_order', title: '📦 View Order' },
      { action: 'reply', title: '💬 Reply' }
    ];
  }

  self.registration.showNotification(notificationTitle, notificationOptions);
});
