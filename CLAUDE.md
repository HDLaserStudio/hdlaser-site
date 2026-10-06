# HD Laser Studio: handoff for the next Claude session

Read this first. It is the state of everything built for HD Laser Studio (Hugh Demiral, 759 Turquoise St, Pacific Beach, San Diego) with Jake Hess, as of October 2, 2026. The code is the source of truth; this file tells you where things are, how they are deployed, what Hugh has decided, and what is open. It contains no secrets.

## Who you are working with

- **Jake Hess** (jakehessplans@gmail.com) runs the project and is not technical. He follows one instruction at a time, clicks what he is told, and sends screenshots. Give him one step per message when he is doing something in a dashboard. Put links in code blocks so they copy cleanly. Every instruction that touches Cloudflare, Square, Twilio, Google or GoDaddy is a click-by-click list.
- **Hugh Demiral** owns the shop and every outside account (Cloudflare, Square, Twilio, GoDaddy, Google, Apple). He does the paste-and-deploy of the worker. His phone is on file in the worker as ALERT_SMS_TO.
- Jake's rule from Oct 2: he will give pricing in plain words; you encode it in the price book, test it, push it, log it in `worker/PRICING-RULES.md`, and explain what a customer now sees. Flag conflicts with existing rules before changing them.

## The two repositories

Both were transferred from Jake's GitHub (jake-hess) to Hugh's (**hdlaserstudio**) on October 2, 2026, because Hugh owns the business. Old links redirect, but use the new ones. The `www` CNAME at GoDaddy must point to `hdlaserstudio.github.io`.

| Repo | Branch | What it holds |
|---|---|---|
| `hdlaserstudio/hdlaser-site` | `main` | The whole website (GitHub Pages at hdlaser.net) and the Cloudflare Worker in `worker/`. Push to main deploys the site in about two minutes. |
| `hdlaserstudio/hdlaser2` | `claude/great-dirac-7s9id5` | Reference PDFs and the price workbook in `print/`, nothing live. |

Commit as `git -c user.name="Hugh Demiral" -c user.email="contact@hdlaser.net"` (Hugh, owner and CEO, Oct 6; commits before that were made as jake-hess). Never put a model name in repo content. Never put a secret in chat or in the repo.

## Architecture in one paragraph

Static HTML pages on GitHub Pages. A single Cloudflare Worker (`worker/src/index.js`, about 2,900 lines, D1 database) does everything dynamic: price book, order checkout, Square payment links and Terminal checkouts, staff portal, dashboards, Twilio texts, Plaid bank feed, weekly pricing review. The site reads `WORKER_BASE` from `assets/site-config.js`. The worker's address is `https://hdlaser-checkout.yellow-smoke-9c0e.workers.dev`. `GET /health` returns `{version}`; the constant `WORKER_VERSION` at the top of the worker is bumped on every change so you can tell what is deployed. Latest pushed: **v40** (Oct 7: optional customer email on the walk-in form, `jobs.email`). Before that **v39** (Oct 7: walk-ins with several items and optional $50 logo setup). Before that **v38** (Oct 7: walk-ins charge on the Terminal; anyone on the team can set a price). Before that **v37** (Oct 6: $50 logo digitizing and setup in the code defaults and receipt wording). Before that **v36** (Oct 6: fast PIN lookup; v35 counter charges failed with "cannot reach server" because v32 ran the 100k-iteration PBKDF2 PIN check once per staff member and hit Cloudflare's CPU limit). Deployed in Cloudflare: **v40** (confirmed Oct 7). Hugh set the $50 engraving and UV setup on `/admin/prices` on Oct 6, so it is live in his saved book. After a Terminal sale, check `/health` for `terminal_tip_error`. GitHub Pages publishes were stuck from 19:38 UTC Oct 5 ("job was not acquired by Runner of type hosted", a GitHub-side runner problem on the new account) and recovered on Oct 6; since then every push publishes in about a minute, so the Served by picker, optional email/phone at the counter and the hub Time clock tile are live. If it sticks again, Cloudflare Pages was the agreed fallback (Hugh chose it Oct 5, not started).

## How the worker gets deployed (nobody automates this yet)

Hugh or Jake pastes the file by hand. Give them these three links every time: (raw.githubusercontent.com can serve the previous version for about 5 minutes after a push: tell them to check the `WORKER_VERSION` line near the top before copying.)

1. Copy: `https://raw.githubusercontent.com/hdlaserstudio/hdlaser-site/main/worker/src/index.js` (Shift+Cmd+R first, then Cmd+A, Cmd+C).
2. Paste and Deploy: `https://dash.cloudflare.com/eb1619b6420b76958b65758160575437/workers/services/edit/hdlaser-checkout/production` (Edit code, click in editor, Cmd+A, Cmd+V, Deploy). "Error 1031" in the preview pane and "50 errors" in the editor are harmless.
3. Check: `https://hdlaser-checkout.yellow-smoke-9c0e.workers.dev/health`.

After a change to `DEFAULT_BOOK`, Hugh also presses **Load the price list from the code** on `/admin/money` (bottom of the page, under Price list, in the Pricing review box) (admin password = ADMIN_KEY), otherwise his saved prices keep winning. Jake's decision: the code's starting numbers are the master copy of pricing.

## Pages and what they do

Public: `/` home (engraving, UV, DTF, cutting sections), `/order/` the single order page every sale starts from, `/quote/` free-text quote form, `/thanks/`, `/terms/`, `/grounds-for-profit/` (coffee-shop cup pitch, old fixed pricing), `/holiday/` (holiday business gifts: four packages priced live from `/pricing`, buttons open the order page pre-filled with `&from=holiday`; built Oct 2, still noindex and unlinked until Hugh confirms the items and the December 1 order-by date). Private, unlinked, noindex: `/hub/` shop iPad home (name + PIN), `/staff/` portal, `/custom/` custom-price page (built then unlinked at Jake's request; still works), `/pricing-lab/` sandbox dials (does not touch live prices), `/marisa/` salon-room offer, `/partnership/` Jake and Hugh's deal. Worker pages (Basic auth, any username, password ADMIN_KEY): `/admin` sales dashboard, `/admin/money` money page with the red pricing-suggestion box, `/admin/prices` every price on one screen, `/api/terminals` Terminal ids.

## The order page, step by step (as a customer sees it)

1. Are you bringing your own item? Yes shows material tiles (wood, metal, glass, leather, acrylic, stone, fabric, your own garment). No shows the shop's items (tumbler, 12 oz cup, 16 oz cup, bottle, pint, cutting board, plaque, plaque with 7x9 plate, tag, patch, cut from our wood, cut from our acrylic).
2. How should we put it on? Laser engraving, UV printing, DTF printing, Laser cutting. Greyed out when the material or item doesn't allow it.
   - Garments: front, back, or both (both = two prints). Cutting: simple / detailed / intricate.
3. Size slider: longest side, to 12 in (28 in for cutting).
4. Quantity. Shows the math under the counter: qty x price per piece = total, with what each piece is made of (Oct 3).
5. Artwork: new logo (setup applies if any), text only (no setup), logo on file (no setup).
6. Needed by and rush.
7. Contact, terms box, text-message consent box. Online, email and phone are required. At the counter (Oct 5, v29) only the name is: email and phone are optional, the worker accepts no email when an employee PIN comes with the order, stores email as NULL, and skips the customer emails (`sendEmail` returns early with no address).
8. Red sizing confirmation the customer initials (must match their name). Stored with hash, IP, time.
   In counter mode (`?via=hub&by=NAME`): **Served by** picker (Oct 5, v30; names from `GET /staff/names`, which needs the hub's staff token from localStorage `hd_staff_token`; defaults to whoever signed in to the hub) and that person's PIN, so anyone on shift can take the sale while someone else is signed in. Since v32 the worker's `verifyStaff` tries the named person first, then accepts the PIN of any active employee and credits the sale to them, so the picker is a convenience, not a requirement; `upsertStaff` refuses a PIN another active person already uses. v36: `staff.pin_key` is an HMAC fingerprint of the PIN (key from `PIN_PEPPER` or `ADMIN_KEY`), stored whenever a PIN is set or checked successfully (login, time clock, checkout); `verifyStaff` looks it up first (no PBKDF2), then at most one named and one other slow check. Never loop PBKDF2 over all staff in one request: the free plan's CPU limit kills it and the browser sees a CORS failure. Then **Charge on the Terminal**, or **Pay by card online instead**. Under step 4 a counter-only **Set the price myself** box (Oct 3): price per spot x spots on each piece, e.g. $40 x 2 = $80. It goes to the worker as a custom job (`customQuote`), needs any active employee's PIN (since v38, Hugh Oct 7; was manager or owner), keeps the tax rule of the chosen item, and the customer's confirmation reads "what we agreed at the counter". The order notes record the breakdown.

## Pricing rules Hugh has given (also in worker/PRICING-RULES.md)

- Anything up to 2 in: $35 engraving, $40 UV. Material factors 1. New logo ("A new logo or design"): $50 logo digitizing and setup, once per order, engraving and UV (Hugh, Oct 6; was $0). Text only and logo on file: no setup.
- Text only on the customer's own item (engraving or UV): $25 each, any size, **only when they bring 2 or more items and the text is up to 2 in** (Hugh, Oct 3; `text_only_own_min_qty`, `text_only_own_max_inches`). One item, or text over 2 in, is priced by size on the ladder, so a second item never costs less than the first.
- Customer's own item: no sales tax. Shop-supplied item: 7.75% tax. `TAX_OWN_ITEMS=1` in Cloudflare turns tax on for own items if the accountant says so (open question, flagged to Jake).
- Engraving ladder above 2 in: $2 per half inch growing 10 cents (9 in = $72, 12 in = $94). UV: $3.50 per half inch growing 50 cents.
- Cutting: bed is 15 x 28 in. $35 to 2 in, straight line to $100 at 28 in for a simple outline; detailed x1.5, intricate x2.
- Wood plaque with 7 x 9 metal plate: $53 item + 9 in engraving $72 = $125 before tax.
- 12 oz cup $25, 16 oz cup $30; engraving adds $15, UV adds $20, any artwork size; $5 off each from 6 cups; capped at 50 on the page, more is quoted by hand.
- DTF (print and press on the customer's garment): from $3.50 at half an inch, $10 setup; no garment is sold.
- Quantity breaks on the work for everything else: 5% at 6, 10% at 12, 15% at 25, 20% at 50, 25% at 100. Rush +50% on the work. Shop minimum $25.
- Coffee-shop cups on /grounds-for-profit still use the old hard-coded tiers in the worker (`PRICING` constant). Known gap.

## Counter setup (Square Terminal + iPad)

- The Terminal is signed in with a device code as "Front counter" and is visible to the worker. `SQUARE_TERMINAL_DEVICE_ID` in Cloudflare is `051CS108A6000200` (the paired id, no `device:` prefix). `/api/terminals` lists it; `/api/terminals?create=1` makes a new device code if it ever has to be re-paired.
- Flow: order page in counter mode, employee PIN (verified against the staff table), worker creates a Square Order with the line items and tax, then a Terminal checkout against it; page polls `/order/terminal/status` until COMPLETED; order marked paid, payment stored with Square's team member id, `taken_by_id` set. Webhook `terminal.checkout.updated` is the backstop; Hugh has not yet added it in the Square Developer webhook subscription (open item).
- Tips (v34): Terminal checkouts show Square's tip screen (`tip_settings` allow, separate screen, custom amount, smart tipping); set `TERMINAL_TIPS=0` in Cloudflare to turn it off. v35: if Square refuses the checkout with tips, the worker retries once without tips so the sale goes through, stores Square's reason in `meta.terminal_tip_error`, and `/health` shows it as `terminal_tip_error`. The tip is stored in `orders.tip_cents` and left out of sales revenue, the channel table and work-log job value; `paid_cents` still holds the full amount charged.
- Receipts: the Terminal offers print/email/text after the tap; thank-you page has "Print receipt on the Terminal"; the hub's **Receipts** tile (v24+) lists the last 30 days of payments with a Print button, and a manager button pulls the past week of register sales from Square.
- Done Oct 2: live $25 test sale on the iPad (hub, New order, own wood, engraving, text only, Hugh's PIN, Charge on the Terminal, tap card). Page moved to thanks on payment, sale showed in hub Receipts, then refunded in Square. Hub Receipts and "Pull the past week from Square" both work on v25.

## Where customers come from (v26)

- `assets/site-config.js` (now loaded on every public page, `?v=5`) remembers how a visitor first arrived for 90 days in localStorage `hd_src`: a link tag (`?src=` or `utm_source`, `gclid` = Google ads) or the referring site, plus the landing page. A new arrival sends an `arrival` event.
- The order page and quote form ask "How did you find us?" (optional) and send that answer plus the stored source. The worker saves `channel`, `heard`, `src` on orders (counter orders are "At the counter") and `channel`, `heard` on quote requests. The order page also takes `inches`, `qty` and `art` in the link, and `from=` is saved as `src.via`.
- `/admin` has a "Where customers come from" section: new visitors, orders, paid, revenue and quotes by channel, by the customer's answer, and by starting page. Channel names come from `SOURCE_TAGS` and `channelOf()` in the worker.
- Links to hand out, tagged: Google Business Profile website and order links `https://hdlaser.net/?src=google-profile` and `https://hdlaser.net/order/?src=google-profile`; flyers `?src=flyer-<place>`; emails `?src=email-<campaign>`; texts `?src=text`; QR codes `?src=qr-<place>`.
- The privacy notice in `/terms/` says how this works.

## Other systems and their state

- **Twilio** toll-free verification for +1 866 502 8303 resubmitted Oct 1, status In Review. Decision email goes to contact@hdlaser.net. Cloudflare has TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, ALERT_SMS_TO. Compliance screenshots at `assets/compliance/`.
- **Apple Business Connect** domain verified by TXT record at GoDaddy (the registrar for hdlaser.net). Sent for review Oct 1.
- **Google Business Profile**: description and services added Oct 1; photos, order link and a first post were still to do. Search Console indexing not requested yet.
- **Plaid**: balances refreshed once a day to stay in the free tier.
- **Work log** (v31): marking an order Done (staff Work queue or the `/admin` dashboard) writes a finished job to `jobs` (`orderJob()`, note `auto: order done`, `ref` = order), credited `done_by` whoever marked it (dashboard: the person who took the order, else the owner), so it counts in jobs done, job value and commission. Undo removes it; marking done twice does not double it. Text-only and logo-on-file orders skip "waiting for logo" in the queue.
- **Walk-in charge** (v38): staff portal Log a job (hub tile Log a walk-in) has **Charge on the Terminal**, which opens `/order/?via=hub&walkin=1&desc&amount&name&phone&needed&by`. Walk-in mode hides steps 1-6 and shows What we're making, Amount for the whole job and We supply the item (tax); steps 7-8, Served by and PIN are the same as New order. It is sent as a custom job with `no_logo` (art `text`, so the queue skips waiting for logo) and lands in the Work queue once paid. Add to queue still logs a job without charging. v39: the form has item rows (product, qty, price each, + Add another item, remove), a Logo digitizing and setup checkbox (amount from the engraving setup in `/pricing`, $50) and a running total. Charge sends `lines` (JSON `[{n,q,u}]`) and `setup=1`; the worker's `customLinesQuote()` puts each item on the Square receipt as its own line plus one setup line. Add to queue makes one job per item, setup added to the first. The product dropdown is the staff portal's own list (`products(env)`, cup-era names), not the order page's items.
- **Time clock** (v33): `https://hdlaser-checkout.yellow-smoke-9c0e.workers.dev/clock` is served by the worker (so it does not wait on GitHub Pages). Every active employee on one screen with Clock in or Clock out; each punch needs that person's own PIN (`POST /clock/punch {id, pin, action}`, rate-limited, failures logged). Same `shifts` table and alerts as the staff portal (`clockPunch()` is shared). The hub has a Time clock tile pointing to it (live once Pages publishes). Checklists stay in the staff portal.
- **Staff**: Hugh must exist on the dashboard Team tab as owner with a PIN; the name must match the hub sign-in exactly. Employees need Square passcodes for register-sale attribution.
- **Marisa** (salon room) page terms are final; waiting on her walk-through and redlines, then draft the agreement. **Partnership** page waits on Hugh.
- **Docs**: Claude Doc "HD Laser: every link and login" (claude.ai/code/artifact/97808ec7-5355-4f58-a423-c2713b454087). PDFs in hdlaser2 `print/`: links and logins, Twilio resubmission guide, operating kit, two handoff briefs (one for Jason Coleman's three businesses, not started).

## How to test without reaching the live site

The container cannot reach hdlaser.net or workers.dev. Test the worker by importing `worker/src/index.js` as an ES module with a fake D1 built on `node:sqlite` (DatabaseSync) and a stubbed `globalThis.fetch` for Square; drive pages with Playwright at `/opt/pw-browsers/chromium` against `python3 -m http.server` on the site folder, routing `/pricing` to the in-memory worker. Syntax-check every admin page's inline script by fetching `/admin`, `/admin/money`, `/admin/prices` from the worker and running `node --check` on each `<script>`; one bad quote once blanked the money page.

## Open items, in priority order

1. ~~Deploy v25 and check hub Receipts~~ done Oct 2.
2. ~~The live $25 Terminal test, refunded~~ done Oct 2.
3. v30 deployed Oct 5. Check on the iPad: Served by list, name-only checkout, 2 text-only items at 12 in. **Do not press "Load the price list from the code"**: Hugh's saved price list has hand-set prices (12 in engraving $199 vs $94 in the code) and he says his are correct. Get a screenshot of `/admin/prices`, copy his numbers into `DEFAULT_BOOK`, and only then is Load safe. New book keys fill in from the code automatically without Load. Then put the tagged links on the Google Business Profile.
4. Open question from Hugh (Oct 5): showing prices may scare people. Options offered: price small jobs and quote big ones (recommended), show only "starting at $35" and quote everything, show the price only at the last step, or keep as is and decide on 3-4 weeks of dashboard data. He will answer later.
4b. Hugh confirms the holiday packages and the order-by date; then remove noindex from `/holiday/`, link it from the home page, add it to `sitemap.xml`, and email past business customers.
5. Add `terminal.checkout.updated` to the Square webhook subscription.
6. Press "Load the price list from the code" after any pricing change so Hugh's saved book matches the code.
7. Twilio and Apple decisions arrive by email; forward to the session.
8. Google Business Profile photos, order link, first post; Search Console indexing.
9. Compare Square charges to the price matrix once Jake sends the Items Detail CSV export (Transactions, Export).
10. Pricing gaps: coffee-shop cup tiers still hard-coded; artwork-help charge not priced; per-employee sales-per-hour on the Team tab not built; clock-in tile on the hub not built.
11. Accountant question: is work on customer-owned items taxable in California? If yes, set TAX_OWN_ITEMS=1.

## Conventions that avoided pain

- Edit files with exact-string replacements and assert the count before writing; curly apostrophes and template-literal escaping have bitten before.
- Bump WORKER_VERSION on every worker change and say the expected version in the deploy instructions.
- The order page, hub and prices page fetch `/pricing` with `cache: no-store`; the worker serves it `no-store`.
- Keep the customer-facing text in the voice of the site: plain, short, no jargon.
