import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

async function dropAll() {
    console.log("🔥 Dropping ALL TABLES & TYPES due to schema reset...");
    try {
        // Drop tables in reverse order of dependency
        await sql`DROP TABLE IF EXISTS payments CASCADE`;
        await sql`DROP TABLE IF EXISTS booking_add_ons CASCADE`;
        await sql`DROP TABLE IF EXISTS add_on_pricing_rules CASCADE`; // New table to drop for future
        await sql`DROP TABLE IF EXISTS bookings CASCADE`;
        await sql`DROP TABLE IF EXISTS booking_status_history CASCADE`; // Old
        await sql`DROP TABLE IF EXISTS add_ons CASCADE`;
        await sql`DROP TABLE IF EXISTS base_pricing CASCADE`;
        await sql`DROP TABLE IF EXISTS service_pricing CASCADE`; // Old
        await sql`DROP TABLE IF EXISTS services CASCADE`;
        await sql`DROP TABLE IF EXISTS locations CASCADE`;
        await sql`DROP TABLE IF EXISTS pricing CASCADE`; // Old

        console.log("✅ Tables dropped");

        // Drop Types/Enums
        await sql`DROP TYPE IF EXISTS booking_status CASCADE`;
        await sql`DROP TYPE IF EXISTS payment_status CASCADE`;
        await sql`DROP TYPE IF EXISTS cleaning_frequency CASCADE`;
        await sql`DROP TYPE IF EXISTS price_type CASCADE`;
        await sql`DROP TYPE IF EXISTS add_on_category CASCADE`; // Old
        await sql`DROP TYPE IF EXISTS promo_type CASCADE`; // New
        await sql`DROP TYPE IF EXISTS adjustment_type CASCADE`; // New

        console.log("✅ Enums dropped");
        console.log("🎉 Database Cleaned!");
    } catch (err) {
        console.error("❌ Drop failed:", err);
        process.exit(1);
    }
}

dropAll();
