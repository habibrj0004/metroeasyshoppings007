# Firebase Realtime Database setup

1. Create a project at https://console.firebase.google.com and add a **Web app**.
2. Open **Build > Realtime Database > Create database** (choose your region, start in locked mode).
3. Copy the web config into `js/config.js`:
   ```js
   firebase: { apiKey: '...', authDomain: '...', databaseURL: 'https://YOUR-PROJECT-default-rtdb.firebaseio.com', projectId: '...', appId: '...' }
   ```
4. Publish the rules: paste `firebase/database.rules.json` into **Realtime Database > Rules**, or run `firebase deploy --only database`.
5. Reload the app. The first visitor seeds the tree at `/metro`; every browser then receives changes live (`ref.on('value')`). The footer shows **Firebase live**.
6. Authentication: the rules read `auth.uid`. Enable **Email/Password** sign-in and store each user's profile at `/metro/users/<uid>` with its `role`. The demo screen signs in against the local user list, so connect `signInWithEmailAndPassword` in `js/app.js` (`App.signIn`) before going live.
7. Production hardening: move stock reservation, order creation and stage changes to Cloud Functions or database transactions; send WhatsApp (WhatsApp Business Cloud API) and email (SendGrid, Mailgun or Firebase Trigger Email) from a function that listens to `/metro/msgs`.
8. Test the rules with the Firebase Emulator Suite (`firebase emulators:start --only database`).
