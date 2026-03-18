import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";
import { services } from "./src/db/schema";
import { SERVICES } from "./src/db/constants";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
    console.log("🔥 Clearing services...");
    await db.delete(services);

    console.log("🌱 Seeding services with explicit IDs from constants...");

    const insertedServicesMap: Record<string, string> = {};

    for (const service of SERVICES) {
        const result = await db.insert(services).values({
            id: service.id,
            name: service.name,
            description: service.description,
            isActive: true,
        }).returning({ id: services.id, name: services.name });

        if (result[0]) {
            insertedServicesMap[result[0].name] = result[0].id;
        }
    }

    console.log("   ✅ Services seeded with explicit UUIDs:");
    console.table(insertedServicesMap);

    console.log("🎉 Services reset complete!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
