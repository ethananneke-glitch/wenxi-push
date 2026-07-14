// Give the service worker access to Firebase Messaging.
// Note: We use the "compat" version so it matches the scripts on your Blogger site.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in your credentials
firebase.initializeApp({
  apiKey: "AIzaSyDTMzML8lwOLKKEcyZWCJipia_cAednd94",
  authDomain: "wenxi-market.firebaseapp.com",
  projectId: "wenxi-market",
  storageBucket: "wenxi-market.firebasestorage.app",
  messagingSenderId: "558336205782",
  appId: "1:558336205782:web:21e25c13abde8ba4507a77"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Optional: Handle background notifications when the web app is closed
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'New Update!';
  const notificationOptions = {
    body: payload.notification.body || 'Check out the latest on Wenxi Market.',
    icon: '/favicon.ico' // You can change this to a custom icon URL later
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
