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

## What's new in 2.6.0
- Buttons follow the shadcn/ui Button variants (default, outline, secondary, destructive, ghost, link; sizes sm, lg, icon) and every button, link and field shares one focus ring. See the top of `styles.css`.
- Emoji icons are replaced by Lucide icons (`icons.js`). The WhatsApp logo is on the home screen (hero button and floating button) and on every WhatsApp button.
- Empty spaces have placeholders: hints inside input boxes, and "nothing here yet" panels for empty lists, tables and charts in the customer, staff and admin screens.
- Products use real photos (set in `data.js`, `MetroData.photos`). If a photo cannot load, the drawn artwork is shown instead.

## Files
- `index.html`, `404.html`, `styles.css`, `manifest.webmanifest`, `sw.js`, `robots.txt`: the site and its app settings
- `config.js`, `icons.js`, `logic.js`, `data.js`, `db.js`, `app.js`, `dash.js`: application code (`config.js` holds the optional Firebase settings)
- `logo.svg`, `icon-*.png`, `apple-touch-icon.png`, `og-image.png`: images
- `database.rules.json`, `schema.sql`, `results.sql`, `FIREBASE_SETUP.md`: Firebase rules and the SQL model
- `vercel.json`: Vercel headers (no build)

The app runs on browser storage until you add Firebase settings to `config.js`. Payments and messages are sandbox/simulated; WhatsApp and email buttons open `wa.me` and mail links.
