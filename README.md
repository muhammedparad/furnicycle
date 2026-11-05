# FurniCycle

**Move out. Pass it on.** A Kerala marketplace for second-hand furniture. People list furniture for a price or for free, others browse and filter, and the two talk directly on WhatsApp or phone. FurniCycle never handles money, delivery or negotiation.

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · Supabase (Auth, Postgres, Storage) · OpenStreetMap · Claude for photo recognition.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables set, the site runs in **demo mode**: sign-up, listings, photos and saved items are stored in the browser (IndexedDB) and 20 sample listings are seeded so there is something to browse. Everything works except that data is per-browser.

## Connect Supabase

1. Create a project at supabase.com.
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql). It creates `profiles`, `listings` and `favorites` with row-level security, a trigger that creates a profile on sign-up, and the public `listing-images` storage bucket.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project settings → API).
4. In **Authentication → URL configuration**, add your site URL (and `http://localhost:3000`) to the redirect URLs. Email confirmation can stay on; the sign-up screen tells users to check their inbox.
5. Restart `npm run dev`. The footer changes from "Demo mode" to "Live".

The app switches backend automatically: [`src/lib/backend/index.ts`](src/lib/backend/index.ts) uses [`supabase.ts`](src/lib/backend/supabase.ts) when both keys are present, otherwise [`local.ts`](src/lib/backend/local.ts). Both implement the same `Backend` interface in [`src/lib/types.ts`](src/lib/types.ts).

`featured` listings sort first. Sellers cannot set it themselves (a trigger blocks it); set it from the Supabase table editor or with the service role, which is where paid promotion would plug in later.

## AI assistance

The sell form's **Price it with AI** panel posts the cover photo to [`/api/ai/analyze`](src/app/api/ai/analyze/route.ts).

- With `ANTHROPIC_API_KEY` set, Claude (`claude-opus-5-5` by default, override with `ANTHROPIC_MODEL`) identifies the piece, its category and condition, writes a title and description, and suggests a price range in rupees, informed by the prices of similar listings.
- Without a key, it returns a rule-based estimate ([`src/lib/pricing.ts`](src/lib/pricing.ts)): typical new price × condition × age, pulled toward the median of similar live listings. The home page price check uses the same estimate.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Newest listings strip, how it works, price check, just listed, browse by category and district, questions |
| `/explore` | Search and filter by text, category, district, condition, price range, free only; sort. Filters live in the URL, so results can be shared |
| `/listings/[id]` | Photos, price, details, WhatsApp and call buttons, save, share, pickup area on OpenStreetMap, similar listings |
| `/sell` | New listing: up to 6 photos (compressed in the browser), AI suggestions, free toggle, location from device |
| `/listings/[id]/edit` | Edit your own listing |
| `/dashboard` | My listings (edit, mark sold / relist, delete), saved listings, profile |
| `/login`, `/register` | One account for buying and selling |

## Before launch

- Sample listings in [`src/lib/backend/seed.ts`](src/lib/backend/seed.ts) appear only in demo mode, with a placeholder phone number.
- `hello@furnicycle.in` in the footer is a placeholder address.
- Listings without photos show a drawing of their category; real photos replace it automatically.
- Look: modelled on beabillionaire.in. Apricot radial-gradient page (`#ffe6c9` to `#fbcf98`), cream paper cards (`#fffdf8`), brown ink (`#3b1f12`), purple primary pills (`#5a3ea6`), marigold secondary pills (`#ee7b11`), rust wordmark and links (`#b23f0c`), Bricolage Grotesque. All tokens are in [`src/app/globals.css`](src/app/globals.css).
