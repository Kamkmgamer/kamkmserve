# TODO – Build Admin CMS for KamkmServe

This document outlines the steps to build an admin dashboard (CMS) in Next.js for managing
services, prices, blogs, coupons, orders, referrals, affiliates, and payouts.

---

## 1. Setup Admin Area

- [x] Create `/admin` route in Next.js (protected layout).
- [x] Add `AdminLayout.tsx` with sidebar navigation (Services, Blogs, Coupons, Orders, Referrals, Payouts).
- [x] Style using `shadcn/ui` components (Sidebar, Table, Button, Dialog).
- [x] Configure `middleware.ts` to restrict `/admin/*` routes to users with `role = ADMIN` or `SUPERADMIN` (via Clerk + Drizzle).

---

## 2. Services Management

- [x] Page: `/admin/services`
  - [x] List all services in a table (name, category, price, createdAt).
  - [x] Add button → opens modal with form (name, description, price, features, category, image).
  - [x] Edit & Delete actions per row.
- [x] API:
  - [x] `GET /api/admin/services` → list services.
  - [x] `POST /api/admin/services` → create service.
  - [x] `PATCH /api/admin/services/:id` → update service.
  - [x] `DELETE /api/admin/services/:id` → delete service.

---

## 3. Blog Management

- [x] Page: `/admin/blogs`
  - [x] List posts (title, summary, author, createdAt).
  - [x] Create/Edit form with rich text editor (basic rich-text textarea for now).
  - [x] Delete posts.
- [x] API:
  - [x] CRUD endpoints for blog posts.

---

## 4. Coupon Management

- [x] Page: `/admin/coupons`
  - [x] Table with coupon code, type, value, usage, status.
  - [x] Create form (code, type [percent/fixed], value, minOrderAmount, maxUses, expiresAt).
  - [x] Toggle coupon `active` on/off.
- [x] API:
  - [x] CRUD endpoints for coupons.
  - [x] Auto-calc `currentUses`.

---

## 5. Order Management

- [x] Page: `/admin/orders`
  - [x] Table view (user email, totalAmount, status, createdAt).
  - [x] Order detail page: list line items, applied coupon, referral info, requirements/suggestions.
  - [x] Actions:
    - [x] Update order `status` (PENDING → PAID → APPROVED).
    - [x] Refund / Cancel.
- [x] API:
  - [x] `GET /api/admin/orders`
  - [x] `PATCH /api/admin/orders/:id` → update status, refund, etc.

---

## 6. Referral & Affiliate Program

- [x] Page: `/admin/referrals`
  - [x] List referrals (user, code, commissionRate, createdAt).
  - [x] Generate referral code for a user.
  - [x] Edit commission rate.
- [x] API:
  - [x] CRUD endpoints for referrals.

---

## 7. Commission Tracking

- [x] Auto-create `commission` entry when an order with referral is marked `PAID`.
- [x] Page: `/admin/commissions`
  - [x] Table with referral code, order, amount, status (UNPAID, PENDING, PAID).
- [x] API:
  - [x] CRUD endpoints for commissions.

---

## 8. Payout Management

- [x] Page: `/admin/payouts`
  - [x] List payouts (referral, amount, status, payoutDate).
  - [x] Button: "Mark as Paid" → update status of payout + linked commissions.
- [x] API:
  - [x] CRUD endpoints for payouts.
  - [x] Action endpoint: mark payout & commissions as PAID.

---

## 9. Auth & Security

- [x] Ensure all `/admin/api/*` routes check Clerk auth and `role`.
- [x] Add role upgrade utility to promote users to `ADMIN` (manual or via DB migration).
- [x] Audit sensitive fields (commissions, payouts).

---

## 10. Polish & Extras

- [x] Add dashboard stats cards on `/admin` (Total Orders, Revenue, Active Referrals, Pending Payouts).
- [ ] Add search & filters for all tables.
- [x] Add CSV export for orders, payouts.
- [x] Add toast notifications for CRUD actions.
- [ ] Write Drizzle seed script for dummy data.

---

## Tech Stack Notes

- **UI**: shadcn/ui + Tailwind.
- **Forms**: React Hook Form + Zod validation.
- **API Layer**: Next.js App Router `app/api/admin/*`.
- **ORM**: Drizzle with PostgreSQL.
- **Auth**: Clerk (role-based).
- **Rich Text**: TipTap or Lexical for blogs.
