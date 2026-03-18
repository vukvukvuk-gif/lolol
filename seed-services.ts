import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";
import { services, servicePricing, locations } from "./src/db/schema";
import { SERVICES, SERVICE_IDS } from "./src/db/constants";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
    console.log("🌱 Seeding services...");

    // Insert services with upsert to ensure names/descriptions are updated
    for (const service of SERVICES) {
        await db.insert(services).values({
            id: service.id,
            name: service.name,
            description: service.description,
            basePrice: service.basePrice,
        }).onConflictDoUpdate({
            target: services.id,
            set: {
                name: service.name,
                description: service.description,
                basePrice: service.basePrice,
            }
        });
    }
    console.log(`   ✅ Seeded/Updated ${SERVICES.length} services`);

    console.log("🌱 Seeding service pricing (initial overrides if any)...");

    // Fetch locations first
    const allLocations = await db.select().from(locations);
    if (allLocations.length > 0) {
        console.log(`   📍 Found ${allLocations.length} locations. Updating base service pricing if missing...`);

        const pricingRows = [];
        for (const loc of allLocations) {
            // Using REGULAR_MAINTENANCE (was STANDARD_CLEANING)
            pricingRows.push({
                serviceId: SERVICE_IDS.REGULAR_MAINTENANCE,
                locationId: loc.id,
                price: "168.00",
                duration: 120, // 2 hours
            });
            // Using POST_CONSTRUCTION
            pricingRows.push({
                serviceId: SERVICE_IDS.POST_CONSTRUCTION,
                locationId: loc.id,
                price: "200.00",
                duration: 240, // 4 hours
            });
        }

        // onConflictDoNothing preserves existing customizations
        if (pricingRows.length > 0) {
            await db.insert(servicePricing).values(pricingRows).onConflictDoNothing();
            console.log(`   ✅ Seeded ${pricingRows.length} service pricing entries`);
        }
    }

    console.log("🎉 Services seeding complete!");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
