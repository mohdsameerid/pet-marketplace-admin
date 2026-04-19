# PetMarketplace — Admin Panel

Internal admin dashboard for the PetMarketplace platform. Built with **React 19 + Vite** and **TypeScript**. Restricted to users with the **Admin** role — no public registration.

**Live:** https://pet-marketplace-admin.netlify.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (SPA) |
| Build Tool | Vite 8 |
| Language | TypeScript |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| HTTP | Axios |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Auth | JWT (stored in localStorage as `adminToken`) |

---

## Project Structure

```
src/
├── pages/
│   ├── Login.tsx            # Admin-only login
│   ├── Dashboard.tsx        # Stats overview with charts
│   ├── Listings.tsx         # All listings — filter, approve, reject
│   ├── PendingListings.tsx  # Quick view of listings awaiting approval
│   ├── Users.tsx            # All users — filter by role, ban/unban
│   └── Sellers.tsx          # Sellers — verify seller status
├── components/
│   ├── layout/              # Sidebar, Navbar, Layout wrapper
│   └── ui/                  # Reusable UI components
├── api/
│   ├── client.ts            # Axios instance + auth interceptor
│   ├── auth.ts              # Login API call
│   └── admin.ts             # All admin API calls
├── context/                 # Auth context (admin token & user state)
├── hooks/                   # Custom data-fetching hooks
├── types/                   # Shared TypeScript types
├── utils/                   # Formatting helpers
├── App.tsx                  # Router & route definitions
└── main.tsx
```

---

## Features

### Dashboard
- Platform-wide stats: total users, buyers, sellers, verified sellers, banned users
- Listing counts by status (Draft, Pending, Active, Rejected, Sold)
- Total inquiries and favorites
- Visual charts powered by Recharts

### Listings Management
- View all listings with status filter
- **Pending Listings** quick-view for fast approval workflow
- Approve a listing → moves to Active
- Reject a listing → supply a rejection reason (shown to the seller)

### User Management
- View all registered users, filterable by role (Buyer / Seller / Admin)
- Ban / unban any user
- **Verify Seller** — mark a seller as verified after account review

### Auth
- Login with email + password; only accounts with role `Admin` are allowed in
- JWT stored under `adminToken` key in localStorage
- Token auto-injected on every API request via Axios interceptor
- `401` responses clear the token and redirect to `/login`

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create optimised production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Admin API Reference

All requests go to `/api/admin/*` and require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Platform stats |
| GET | `/api/admin/listings` | All listings (optional `?status=` filter) |
| GET | `/api/admin/listings/pending` | Pending approval listings only |
| POST | `/api/admin/listings/{id}/approve` | Approve a listing |
| POST | `/api/admin/listings/{id}/reject` | Reject with `{ "reason": "..." }` body |
| GET | `/api/admin/users` | All users (optional `?role=` filter) |
| POST | `/api/admin/users/{id}/verify-seller` | Mark seller as verified |
| POST | `/api/admin/users/{id}/ban` | Ban a user |
| POST | `/api/admin/users/{id}/unban` | Unban a user |

Standard API response envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "errors": []
}
```

---

## Listing Status Flow

```
Draft
  └─► PendingApproval  (seller submits)
        ├─► Active      (admin approves)
        └─► Rejected    (admin rejects with reason)
```

---

## Deployment

Deployed on **Netlify** with automatic builds from the main branch.

- Build command: `npm run build`
- Publish directory: `dist`
