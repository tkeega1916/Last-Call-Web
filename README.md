# Last Call (web prototype)

Search a city and date range for happy hours, bar entertainment, where to watch sports, and (soon) games and concerts.

- **Framework:** Next.js (App Router, TypeScript), Tailwind CSS v4, hosted on Vercel.
- **Data:** Supabase project `ijgupuqvykqpscgqtcvk`, read with the public key. Row Level Security allows read-only access.

## How dates work

Recurring venue data (`specials`, `entertainment`) is stored by `day_of_week` (0 = Sunday … 6 = Saturday). The search maps each date in the range to its weekday and shows matching rows. Dated `events` are filtered by `starts_at` in Toronto local time. Ranges are capped at 31 days.

## Environment variables

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ijgupuqvykqpscgqtcvk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (`sb_publishable_…`) |

Both are public values. Never put the Supabase service key in a `NEXT_PUBLIC_` variable.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Structure

- `app/page.tsx`: search and results by date
- `app/venues/[id]/page.tsx`: venue detail with the weekly schedule
- `components/`: search form, day board, where-to-watch list
- `lib/data.ts`: Supabase queries and the date-to-weekday logic
- `lib/dates.ts`: Toronto-local date helpers
