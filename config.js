/* Firebase Realtime Database settings.
   Leave firebase: null to run in local mode (browser storage, synced between tabs).
   To go live, paste your web app config from the Firebase console (see FIREBASE_SETUP.md). */
window.METRO_CONFIG = {
  firebase: null
  /* firebase: { apiKey: '...', authDomain: '...', databaseURL: 'https://YOUR-PROJECT-default-rtdb.firebaseio.com', projectId: '...', appId: '...' } */,
  shopWhatsApp: '923001234567',          // international format, no plus sign
  shopEmail: 'orders@metroshoes.example',
  notifyEndpoint: null,                   // optional serverless sender; not used in this simple version
  version: '2.5.0'
};
