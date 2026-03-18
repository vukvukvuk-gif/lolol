CREATE TABLE "service_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"location_id" uuid,
	"price" numeric(10, 2) NOT NULL,
	"duration" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"base_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "service_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "service_id" uuid;--> statement-breakpoint
ALTER TABLE "service_pricing" ADD CONSTRAINT "service_pricing_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_pricing" ADD CONSTRAINT "service_pricing_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "service_pricing_service_idx" ON "service_pricing" USING btree ("service_id") WHERE "service_pricing"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "service_pricing_location_idx" ON "service_pricing" USING btree ("location_id") WHERE "service_pricing"."deleted_at" is null;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_active_service_idx" ON "bookings" USING btree ("service_id") WHERE "bookings"."deleted_at" is null;