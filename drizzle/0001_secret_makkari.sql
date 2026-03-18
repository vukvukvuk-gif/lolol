ALTER TYPE "public"."booking_status" ADD VALUE 'rescheduled';--> statement-breakpoint
ALTER TYPE "public"."booking_status" ADD VALUE 'no_show';--> statement-breakpoint
CREATE TABLE "booking_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"old_status" "booking_status",
	"new_status" "booking_status" NOT NULL,
	"changed_by" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_payment_id" text,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "payment_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "payment_status" SET DEFAULT 'pending'::text;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."payment_status";--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'authorized', 'paid', 'failed', 'refunded');--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "payment_status" SET DEFAULT 'pending'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "payment_status" SET DATA TYPE "public"."payment_status" USING (CASE WHEN "payment_status" IN ('authorized', 'paid', 'failed', 'refunded') THEN "payment_status"::"public"."payment_status" ELSE 'pending'::"public"."payment_status" END);--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_status_history_idx" ON "booking_status_history" USING btree ("booking_id","created_at");--> statement-breakpoint
CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id") WHERE "payments"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status") WHERE "payments"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "bookings_active_status_idx" ON "bookings" USING btree ("status") WHERE "bookings"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "bookings_active_date_idx" ON "bookings" USING btree ("appointment_date") WHERE "bookings"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "bookings_active_email_idx" ON "bookings" USING btree ("email") WHERE "bookings"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "bookings_active_location_idx" ON "bookings" USING btree ("place_id") WHERE "bookings"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_unique_slot_idx" ON "bookings" USING btree ("place_id","appointment_date","appointment_time") WHERE ("bookings"."deleted_at" is null and ("bookings"."status" = $1 or "bookings"."status" = $2));