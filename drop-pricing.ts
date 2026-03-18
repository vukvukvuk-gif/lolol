import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

async function drop() {
    console.log("🔥 Dropping pricing table and constraints...");
    try {
        // Cascade to remove foreign keys from locations too
        await sql`DROP TABLE IF EXISTS pricing CASCADE`;
        console.log("✅ Dropped pricing table");

        // Also ensure the column is gone from locations if CASCADE didn't catch the column definition itself (it only drops constraint)
        // Drizzle push would do this, but let's help it.
        await sql`ALTER TABLE locations DROP COLUMN IF EXISTS pricing_id`;
        console.log("✅ Dropped pricing_id from locations");

    } catch (err) {
        console.error("❌ Drop failed:", err);
    }
}

drop();
