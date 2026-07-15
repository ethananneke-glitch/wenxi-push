// ==========================================
// 1. CLICK LISTENER
// ==========================================
self.addEventListener('notificationclick', function(event) {
  // ... click handler code
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

// ✅ ONLY THE SERVICE WORKER HANDLES BACKGROUND MESSAGES
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] ===== BACKGROUND MESSAGE =====');
  console.log('[Service Worker] Payload:', JSON.stringify(payload));
  
  const notification = payload.notification || {};
  const data = payload.data || {};
  
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

  self.registration.showNotification(notificationTitle, notificationOptions);
});
