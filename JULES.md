# Rural & Reckless — Jules Context File

This file gives Jules (Google's AI coding agent) everything it needs to work effectively on this project without asking the user unnecessary questions.

---

## What This App Is

**Rural & Reckless** (`ruralandreckless.com`) is a social community platform for makers, artists, crafters, homesteaders, and rural creatives. Think of it as Facebook + Etsy + Craigslist — but for people who make things with their hands and want to connect with others who share that spirit.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React + TypeScript (Vite) |
| Styling | Vanilla CSS (`App.css` + `index.css`) |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage) |
| Hosting | Cloudflare Pages (auto-deploys from GitHub pushes to `master`) |
| Repo | `justin11691/rural-reckless-app` on GitHub |

---

## Project Location

```
C:\Users\justi\.gemini\antigravity\scratch\rural-reckless\
```

---

## Supabase Project

- **URL:** `https://crjfaoxwlmqubmpsyodo.supabase.co`
- **Anon Key:** `sb_publishable_xmEpKVwFMNn44OVuba7NmQ_QJUpC8xo`
- **Dashboard:** https://supabase.com/dashboard/project/crjfaoxwlmqubmpsyodo

### Database Tables (all exist and have RLS enabled)

| Table | Purpose |
|---|---|
| `profiles` | User profiles — full_name, username, tagline, about_me, avatar_url, music_url, store_name, location_city, location_state, etsy_url, pinterest_url, theme_* |
| `posts` | Social feed posts — content, user_id, group_id (nullable), image_url |
| `post_likes` | Likes on posts — user_id, post_id |
| `post_comments` | Comments on posts — user_id, post_id, content |
| `communities` | Community groups — name, description, category, is_public, owner_id, icon |
| `group_members` | Group membership — group_id, user_id, role, status (active/pending/invited) |
| `market_listings` | Physical/farm goods for sale — title, description, price, category, listing_type (farm|rummage), location_city, location_state, payment_url, seller_id |
| `digital_products` | Digital goods — title, description, price, category, payment_url, seller_id |
| `messages` | Direct messages — sender_id, recipient_id, content, listing_id (nullable) |

### Storage Buckets
- `avatars` — public bucket for profile photos

---

## File Structure

```
src/
  components/
    Auth.tsx          — Login / Signup / Forgot Password
    Feed.tsx          — Main social feed with likes, comments, delete
    Profile.tsx       — User profile page (edit, avatar upload, storefront)
    Sidebar.tsx       — Left navigation sidebar
    Communities.tsx   — Community Hub (list groups, create group)
    GroupPage.tsx     — Individual group page (group feed, members, manage)
    Marketplace.tsx   — Farmers Market + Community Rummage Sale tabs (location filter)
    Apps.tsx          — Digital Goods storefront
    Messages.tsx      — Direct messaging (DMs)
  lib/
    supabase.ts       — Supabase client (reads from .env)
  App.tsx             — Main router + navbar + layout
  App.css             — All CSS styles
  index.css           — Global CSS reset + CSS variables
```

---

## Design System (CSS Variables)

```css
--color-pine-dark:    #1B3B2B   /* dark green — headers, navbars */
--color-pine-primary: #2D5A27   /* medium green — buttons, active states */
--color-pine-light:   #4A7C43   /* light green */
--color-wood-brown:   #8B5A2B   /* warm brown accent */
--color-accent:       #C0392B   /* red — danger, highlights */
--color-bg-base:      #F8FAF6   /* off-white page background */
--color-bg-card:      #FFFFFF   /* card background */
--color-text-main:    #1E2923   /* dark text */
--color-text-muted:   #5B7262   /* muted text */
--color-border:       #D8E4D4   /* subtle borders */
```

---

## Routing

| Path | Component |
|---|---|
| `/` | Feed (home) |
| `/profile` | Profile page |
| `/communities` | Communities hub |
| `/communities/:id` | Individual group page |
| `/market` | Marketplace (Farmers Market + Rummage Sale) |
| `/apps` | Digital Goods storefront |
| `/messages` | Direct Messages |
| `/login` | Auth (unauthenticated only) |

---

## Deploy Process

Everything auto-deploys via **Cloudflare Pages** when code is pushed to the `master` branch on GitHub.

To deploy manually:
```bash
npm run build
# Then push to GitHub — Cloudflare picks it up automatically
```

Or use wrangler:
```bash
npx wrangler pages deploy dist --project-name rural-reckless-app --branch main
```

---

## Key Design Rules

1. **Woodsy pine color palette** — never deviate from the CSS variable system above
2. **No hardcoded placeholder data** — everything should read from Supabase
3. **Mobile first** — all new components must be responsive (test at 375px)
4. **Free services only** — the owner is on free tiers of all services
5. **No external payment processing** — all payments go through the seller's own links (Etsy, PayPal, Stripe, crypto) — Rural & Reckless never handles money directly
6. **Decentralized commerce** — sellers post their own payment links; buyers go off-site to purchase

---

## Known Open Items (Things Still To Build)

- [ ] Notifications system (bell icon in navbar has no functionality yet)
- [ ] Search functionality (search bar in navbar does nothing)
- [ ] Right sidebar "Trending Storefronts" is still hardcoded — should pull real data
- [ ] Profile pages for *other* users (viewing someone else's profile, not just your own)
- [ ] Image upload for marketplace listings and posts
- [ ] Group posts should appear in the main Feed with a group tag
- [ ] AdSense ad placements (code is injected but no ad units placed in layout)
- [ ] Recipe/sewing pattern post type with structured fields
