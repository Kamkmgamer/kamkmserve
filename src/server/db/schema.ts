// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `kamkmserve_${name}`);

// ==========================
// Enums
// ==========================
export const roleEnum = pgEnum("role", ["USER", "ADMIN", "SUPERADMIN"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "IN_TECHNICAL_REVIEW",
  "APPROVED",
  "FAILED",
  "REFUNDED",
  "CANCELED",
]);
export const payoutStatusEnum = pgEnum("payout_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "UNPAID",
]);

// ==========================
// Users
// ==========================
export const users = createTable(
  "user",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    // Link to Clerk user id
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email").notNull(),
    name: text("name"),
    role: roleEnum("role").notNull().default("USER"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull(),
    referredById: text("referred_by_id"),
  },
  (t) => [
    uniqueIndex("user_clerk_user_id_unique").on(t.clerkUserId),
    uniqueIndex("user_email_unique").on(t.email),
  ],
);

// ==========================
// Portfolio Items
// ==========================
export const portfolioItems = createTable(
  "portfolio_item",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    title: text("title").notNull(),
    description: text("description").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    imageUrls: text("image_urls").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull(),
  },
  (t) => [index("portfolio_item_created_at_idx").on(t.createdAt)],
);

// ==========================
// Blog Posts
// ==========================
export const blogPosts = createTable(
  "blog_post",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("blog_post_title_unique").on(t.title),
    index("blog_post_user_id_idx").on(t.userId),
    index("blog_post_created_at_idx").on(t.createdAt),
  ],
);

// ==========================
// Services
// ==========================
export const services = createTable(
  "service",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: doublePrecision("price").notNull(),
    features: text("features").notNull(),
    category: text("category").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    imageUrls: text("image_urls").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull(),
  },
  (t) => [
    uniqueIndex("service_name_unique").on(t.name),
    index("service_category_idx").on(t.category),
    index("service_created_at_idx").on(t.createdAt),
  ],
);

// ==========================
// Carts
// ==========================
export const carts = createTable(
  "cart",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull(),
  },
  (t) => [uniqueIndex("cart_user_id_unique").on(t.userId)],
);

// ==========================
// Cart Items
// ==========================
export const cartItems = createTable(
  "cart_item",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    quantity: integer("quantity").notNull().default(1),
    cartId: text("cart_id").notNull().references(() => carts.id),
    serviceId: text("service_id").notNull().references(() => services.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("cart_item_cart_service_unique").on(t.cartId, t.serviceId),
    index("cart_item_cart_id_idx").on(t.cartId),
    index("cart_item_service_id_idx").on(t.serviceId),
  ],
);

// ==========================
// Coupons
// ==========================
export const coupons = createTable(
  "coupon",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    code: text("code").notNull(),
    type: text("type").notNull(),
    value: integer("value").notNull(),
    minOrderAmount: integer("min_order_amount"),
    maxUses: integer("max_uses"),
    currentUses: integer("current_uses").notNull().default(0),
    active: boolean("active").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull(),
  },
  (t) => [
    uniqueIndex("coupon_code_unique").on(t.code),
    index("coupon_active_idx").on(t.active),
    index("coupon_expires_at_idx").on(t.expiresAt),
  ],
);

// ==========================
// Referrals
// ==========================
export const referrals = createTable(
  "referral",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    commissionRate: doublePrecision("commission_rate").notNull().default(0.1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull(),
  },
  (t) => [
    uniqueIndex("referral_user_id_unique").on(t.userId),
    uniqueIndex("referral_code_unique").on(t.code),
    index("referral_created_at_idx").on(t.createdAt),
  ],
);

// ==========================
// Orders
// ==========================
export const orders = createTable(
  "order",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    couponId: text("coupon_id").references(() => coupons.id),
    status: orderStatusEnum("status").notNull().default("PENDING"),
    currency: text("currency").notNull().default("USD"),
    totalAmount: integer("total_amount").notNull(),
    requirements: text("requirements").notNull(),
    suggestions: text("suggestions"),
    preferences: text("preferences"),
    questions: text("questions"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull(),
    referralId: text("referral_id").references(() => referrals.id),
  },
  (t) => [
    index("order_user_id_idx").on(t.userId),
    index("order_status_idx").on(t.status),
    index("order_created_at_idx").on(t.createdAt),
    index("order_referral_id_idx").on(t.referralId),
  ],
);

// ==========================
// Order Line Items
// ==========================
export const orderLineItems = createTable(
  "order_line_item",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    orderId: text("order_id").notNull().references(() => orders.id),
    serviceId: text("service_id").notNull().references(() => services.id),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull().default(1),
    totalPrice: integer("total_price").notNull(),
  },
  (t) => [
    index("oli_order_id_idx").on(t.orderId),
    index("oli_service_id_idx").on(t.serviceId),
  ],
);

// ==========================
// Commissions
// ==========================
export const commissions = createTable(
  "commission",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    orderId: text("order_id").notNull().references(() => orders.id),
    referralId: text("referral_id").notNull().references(() => referrals.id),
    amount: integer("amount").notNull(),
    status: payoutStatusEnum("status").notNull().default("UNPAID"),
    payoutId: text("payout_id").references(() => payouts.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull(),
  },
  (t) => [
    uniqueIndex("commission_order_id_unique").on(t.orderId),
    index("commission_referral_id_idx").on(t.referralId),
    index("commission_created_at_idx").on(t.createdAt),
  ],
);

// ==========================
// Payouts
// ==========================
export const payouts = createTable(
  "payout",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    referralId: text("referral_id").notNull().references(() => referrals.id),
    amount: integer("amount").notNull(),
    status: payoutStatusEnum("status").notNull().default("PENDING"),
    payoutDate: timestamp("payout_date", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).notNull(),
  },
  (t) => [
    index("payout_referral_id_idx").on(t.referralId),
    index("payout_status_idx").on(t.status),
    index("payout_payout_date_idx").on(t.payoutDate),
  ],
);

// ==========================
// Refresh Tokens
// ==========================
// Note: users.referredById intentionally has no FK to avoid circular dependency with referrals.

// ==========================
// Audit Logs
// ==========================
export const auditLogs = createTable(
  "audit_log",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
    event: text("event").notNull(),
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    allowed: boolean("allowed").notNull().default(false),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    ip: text("ip"),
    userAgent: text("user_agent"),
    metadata: text("metadata"), // JSON string
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("audit_log_created_at_idx").on(t.createdAt),
    index("audit_log_actor_idx").on(t.actorUserId),
    index("audit_log_action_idx").on(t.action),
  ],
);
