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
// 2. NOTIFICATION CLICK HANDLER
// ==========================================
self.addEventListener('notificationclick', function(event) {
  // ... your existing code
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
