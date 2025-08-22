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

- [ ] Page: `/admin/blogs`
  - [ ] List posts (title, summary, author, createdAt).
  - [ ] Create/Edit form with rich text editor (e.g., TipTap or Lexical).
  - [ ] Delete posts.
- [ ] API:
  - [ ] CRUD endpoints for blog posts.

---

## 4. Coupon Management

- [ ] Page: `/admin/coupons`
  - [ ] Table with coupon code, type, value, usage, status.
  - [ ] Create form (code, type [percent/fixed], value, minOrderAmount, maxUses, expiresAt).
  - [ ] Toggle coupon `active` on/off.
- [ ] API:
  - [ ] CRUD endpoints for coupons.
  - [ ] Auto-calc `currentUses`.

---

## 5. Order Management

- [ ] Page: `/admin/orders`
  - [ ] Table view (user email, totalAmount, status, createdAt).
  - [ ] Order detail page: list line items, applied coupon, referral info, requirements/suggestions.
  - [ ] Actions:
    - [ ] Update order `status` (PENDING → PAID → APPROVED).
    - [ ] Refund / Cancel.
- [ ] API:
  - [ ] `GET /api/admin/orders`
  - [ ] `PATCH /api/admin/orders/:id` → update status, refund, etc.

---

## 6. Referral & Affiliate Program

- [ ] Page: `/admin/referrals`
  - [ ] List referrals (user, code, commissionRate, createdAt).
  - [ ] Generate referral code for a user.
  - [ ] Edit commission rate.
- [ ] API:
  - [ ] CRUD endpoints for referrals.

---

## 7. Commission Tracking

- [ ] Auto-create `commission` entry when an order with referral is marked `PAID`.
- [ ] Page: `/admin/commissions`
  - [ ] Table with referral code, order, amount, status (UNPAID, PENDING, PAID).
- [ ] API:
  - [ ] CRUD endpoints for commissions.

---

## 8. Payout Management

- [ ] Page: `/admin/payouts`
  - [ ] List payouts (referral, amount, status, payoutDate).
  - [ ] Button: "Mark as Paid" → update status of payout + linked commissions.
- [ ] API:
  - [ ] CRUD endpoints for payouts.
  - [ ] Action endpoint: mark payout & commissions as PAID.

---

## 9. Auth & Security

- [ ] Ensure all `/admin/api/*` routes check Clerk auth and `role`.
- [ ] Add role upgrade utility to promote users to `ADMIN` (manual or via DB migration).
- [ ] Audit sensitive fields (commissions, payouts).

---

## 10. Polish & Extras

- [ ] Add dashboard stats cards on `/admin` (Total Orders, Revenue, Active Referrals, Pending Payouts).
- [ ] Add search & filters for all tables.
- [ ] Add CSV export for orders, payouts.
- [ ] Add toast notifications for CRUD actions.
- [ ] Write Drizzle seed script for dummy data.

---

## Tech Stack Notes

- **UI**: shadcn/ui + Tailwind.
- **Forms**: React Hook Form + Zod validation.
- **API Layer**: Next.js App Router `app/api/admin/*`.
- **ORM**: Drizzle with PostgreSQL.
- **Auth**: Clerk (role-based).
- **Rich Text**: TipTap or Lexical for blogs.
