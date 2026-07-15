// ==========================================

// 1. NOTIFICATION CLICK HANDLER

// ==========================================

self.addEventListener('notificationclick', function(event) {

  console.log('[SW] Click detected');

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

  

  event.waitUntil(

    clients.matchAll({ type: 'window', includeUncontrolled: true })

      .then(function(clientList) {

        for (var i = 0; i < clientList.length; i++) {

          var client = clientList[i];

          var clientUrl = new URL(client.url, self.location.origin).href;

          var targetFull = new URL(targetUrl, self.location.origin).href;

          if (clientUrl === targetFull && 'focus' in client) {

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

// 2. IMPORT FIREBASE (ONLY ONCE)

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

// 3. BACKGROUND MESSAGE HANDLER (ONLY ONCE)

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

      { action: 'reply', title: '💬 Reply' },    // ✅ CORRECT - has emoji

      { action: 'dismiss', title: '✕ Dismiss' } // ✅ CORRECT - has emoji

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

  

  // ✅ ONLY ONE notification - the good one

  self.registration.showNotification(title, options);

}); how many windows they will fire when a single message is arrived? 

