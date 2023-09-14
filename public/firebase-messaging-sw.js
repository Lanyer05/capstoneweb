importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB-Iv08ra8cU21__MfzLV40NYgsgi0qQTA",
  authDomain: "ecotaskreward-f1a4f.firebaseapp.com",
  projectId: "ecotaskreward-f1a4f",
  storageBucket: "ecotaskreward-f1a4f.appspot.com",
  messagingSenderId: "238602413554",
  appId: "1:238602413554:web:f47a1315ae7670ac09776b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './ecotaskreward_logo.png' // Update with your app's logo
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});