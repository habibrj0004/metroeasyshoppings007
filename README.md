# Metro Shoes (simple version)

Everything is in this one folder: no sub-folders, no build, no packages.

## Run on your computer
Open the folder in VS Code, right-click `index.html` and choose **Open with Live Server** (or just double-click `index.html`).

## Put it on Vercel
1. Make sure `index.html` and `vercel.json` are at the top level of your project (not inside another folder).
2. Drag the folder into https://vercel.com/new (or push it to GitHub and import it). Leave every setting empty: no build command, no output directory.
3. Press **Deploy**.

## Demo accounts
| Role | Email | Password |
|---|---|---|
| Customer (Pakistan) | ayesha@example.com | Demo1234 |
| Customer (UK) | sarah@example.com | Demo1234 |
| Order Handler | handler@metroshoes.test | Staff1234 |
| Warehouse | warehouse@metroshoes.test | Staff1234 |
| Owner / Admin | admin@metroshoes.test | Staff1234 |

Test cards: `4242 4242 4242 4242` accepted, `4000 0000 0000 0002` declined. Promo codes: `WELCOME10`, `FLAT500`.

## Files
- `index.html`, `404.html`, `styles.css`, `manifest.webmanifest`, `sw.js`, `robots.txt`: the site and its app settings
- `config.js`, `logic.js`, `data.js`, `db.js`, `app.js`, `dash.js`: application code (`config.js` holds the optional Firebase settings)
- `logo.svg`, `icon-*.png`, `apple-touch-icon.png`, `og-image.png`: images
- `database.rules.json`, `schema.sql`, `results.sql`, `FIREBASE_SETUP.md`: Firebase rules and the SQL model
- `vercel.json`: Vercel headers (no build)

The app runs on browser storage until you add Firebase settings to `config.js`. Payments and messages are sandbox/simulated; WhatsApp and email buttons open `wa.me` and mail links.
