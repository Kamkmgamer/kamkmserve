CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'IN_TECHNICAL_REVIEW', 'APPROVED', 'FAILED', 'REFUNDED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'UNPAID');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN', 'SUPERADMIN');--> statement-breakpoint
CREATE TABLE "kamkmserve_blog_post" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"thumbnail_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_cart_item" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"cart_id" text NOT NULL,
	"service_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_cart" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_commission" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"order_id" text NOT NULL,
	"referral_id" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "payout_status" DEFAULT 'UNPAID' NOT NULL,
	"payout_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_coupon" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"value" integer NOT NULL,
	"min_order_amount" integer,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_order_line_item" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"order_id" text NOT NULL,
	"service_id" text NOT NULL,
	"unit_price" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_order" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"user_id" text NOT NULL,
	"coupon_id" text,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"total_amount" integer NOT NULL,
	"requirements" text NOT NULL,
	"suggestions" text,
	"preferences" text,
	"questions" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"referral_id" text
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_payout" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"referral_id" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "payout_status" DEFAULT 'PENDING' NOT NULL,
	"payout_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_portfolio_item" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"thumbnail_url" text,
	"image_urls" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_referral" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"user_id" text NOT NULL,
	"code" text NOT NULL,
	"commission_rate" double precision DEFAULT 0.1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_service" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" double precision NOT NULL,
	"features" text NOT NULL,
	"category" text NOT NULL,
	"thumbnail_url" text,
	"image_urls" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kamkmserve_user" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"referred_by_id" text
);
--> statement-breakpoint
ALTER TABLE "kamkmserve_blog_post" ADD CONSTRAINT "kamkmserve_blog_post_user_id_kamkmserve_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."kamkmserve_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_cart_item" ADD CONSTRAINT "kamkmserve_cart_item_cart_id_kamkmserve_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."kamkmserve_cart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_cart_item" ADD CONSTRAINT "kamkmserve_cart_item_service_id_kamkmserve_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."kamkmserve_service"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_cart" ADD CONSTRAINT "kamkmserve_cart_user_id_kamkmserve_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."kamkmserve_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_commission" ADD CONSTRAINT "kamkmserve_commission_order_id_kamkmserve_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."kamkmserve_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_commission" ADD CONSTRAINT "kamkmserve_commission_referral_id_kamkmserve_referral_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."kamkmserve_referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_commission" ADD CONSTRAINT "kamkmserve_commission_payout_id_kamkmserve_payout_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."kamkmserve_payout"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_order_line_item" ADD CONSTRAINT "kamkmserve_order_line_item_order_id_kamkmserve_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."kamkmserve_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_order_line_item" ADD CONSTRAINT "kamkmserve_order_line_item_service_id_kamkmserve_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."kamkmserve_service"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_order" ADD CONSTRAINT "kamkmserve_order_user_id_kamkmserve_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."kamkmserve_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_order" ADD CONSTRAINT "kamkmserve_order_coupon_id_kamkmserve_coupon_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."kamkmserve_coupon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_order" ADD CONSTRAINT "kamkmserve_order_referral_id_kamkmserve_referral_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."kamkmserve_referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_payout" ADD CONSTRAINT "kamkmserve_payout_referral_id_kamkmserve_referral_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."kamkmserve_referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kamkmserve_referral" ADD CONSTRAINT "kamkmserve_referral_user_id_kamkmserve_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."kamkmserve_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blog_post_title_unique" ON "kamkmserve_blog_post" USING btree ("title");--> statement-breakpoint
CREATE INDEX "blog_post_user_id_idx" ON "kamkmserve_blog_post" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "blog_post_created_at_idx" ON "kamkmserve_blog_post" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_item_cart_service_unique" ON "kamkmserve_cart_item" USING btree ("cart_id","service_id");--> statement-breakpoint
CREATE INDEX "cart_item_cart_id_idx" ON "kamkmserve_cart_item" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_item_service_id_idx" ON "kamkmserve_cart_item" USING btree ("service_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_user_id_unique" ON "kamkmserve_cart" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "commission_order_id_unique" ON "kamkmserve_commission" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "commission_referral_id_idx" ON "kamkmserve_commission" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX "commission_created_at_idx" ON "kamkmserve_commission" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "coupon_code_unique" ON "kamkmserve_coupon" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupon_active_idx" ON "kamkmserve_coupon" USING btree ("active");--> statement-breakpoint
CREATE INDEX "coupon_expires_at_idx" ON "kamkmserve_coupon" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "oli_order_id_idx" ON "kamkmserve_order_line_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "oli_service_id_idx" ON "kamkmserve_order_line_item" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "order_user_id_idx" ON "kamkmserve_order" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "kamkmserve_order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_created_at_idx" ON "kamkmserve_order" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_referral_id_idx" ON "kamkmserve_order" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX "payout_referral_id_idx" ON "kamkmserve_payout" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX "payout_status_idx" ON "kamkmserve_payout" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payout_payout_date_idx" ON "kamkmserve_payout" USING btree ("payout_date");--> statement-breakpoint
CREATE INDEX "portfolio_item_created_at_idx" ON "kamkmserve_portfolio_item" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "referral_user_id_unique" ON "kamkmserve_referral" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "referral_code_unique" ON "kamkmserve_referral" USING btree ("code");--> statement-breakpoint
CREATE INDEX "referral_created_at_idx" ON "kamkmserve_referral" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "service_name_unique" ON "kamkmserve_service" USING btree ("name");--> statement-breakpoint
CREATE INDEX "service_category_idx" ON "kamkmserve_service" USING btree ("category");--> statement-breakpoint
CREATE INDEX "service_created_at_idx" ON "kamkmserve_service" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_clerk_user_id_unique" ON "kamkmserve_user" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_unique" ON "kamkmserve_user" USING btree ("email");