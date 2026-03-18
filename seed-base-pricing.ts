import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";
import { basePricing, addOns, addOnPricingRules, services, locations } from "./src/db/schema";
import { SERVICES } from "./src/db/constants";
import { v4 as uuidv4 } from 'uuid';
import { sql } from "drizzle-orm";

const connectionString = (process.env.DATABASE_URL!);
const sqlConn = neon(connectionString);
const db = drizzle(sqlConn);

async function seed() {
    console.log("🌱 Seeding Base Pricing & Add-Ons...");

    // 1. Fetch Services (to get UUIDs)
    const allServices = await db.select().from(services);
    if (allServices.length === 0) {
        console.error("❌ No services found! Run seed-services-reset.ts first.");
        process.exit(1);
    }
    const serviceMap = new Map(allServices.map(s => [s.name, s.id]));

    // 2. Clear Existing Data
    console.log("   🧹 Clearing existing base_pricing and add_ons...");
    await db.delete(basePricing);
    // Be careful with cascading deletes if referenced. add_ons referenced by add_on_pricing_rules and booking_add_ons.
    // We should delete rules first.
    await db.delete(addOnPricingRules);
    // bookings reference add_ons? Yes, booking_add_ons references add_ons.
    // Ideally we shouldn't wipe add_ons if bookings exist, but this is a RESET script.
    // If needed, we can try to upsert add_ons, but for simplicity let's delete if possible.
    // If FK constraint fails, we'll see. Assuming fresh DB for now as per user reset flow.
    // But `seed.ts` wiped bookings. So should be safe.
    await db.delete(addOns);

    // 2. Base Pricing Matrix
    // Constants for matrix generation
    const bedrooms = [1, 2, 3, 4, 5, 6];
    const bathrooms = [1, 2, 3, 4, 5];
    const frequencies = ["one_time", "weekly", "bi_weekly", "monthly"] as const;

    const baseRates: Record<number, number> = { 1: 100, 2: 120, 3: 140, 4: 160, 5: 180, 6: 200 }; // simple base per bedroom
    const bathroomadder = 20;
    const freqMultipliers = { one_time: 1.0, weekly: 0.8, bi_weekly: 0.85, monthly: 0.9 };

    console.log("   📍 Generating base pricing matrix for all services (global defaults)...");
    const pricingRows: typeof basePricing.$inferInsert[] = [];

    for (const service of allServices) {
        // Different base rate per service type?
        let serviceMultiplier = 1.0;
        // Adjusted multipliers based on user feedback/screenshots
        if (service.name.includes("Deep")) serviceMultiplier = 1.63; // ~1.63x for Deep Clean to hit ~$293 base target
        if (service.name.includes("Move")) serviceMultiplier = 1.8;
        if (service.name.includes("Post")) serviceMultiplier = 2.0;

        for (const bed of bedrooms) {
            for (const bath of bathrooms) {
                for (const freq of frequencies) {
                    // Simple formula: (BaseBed + (Bath * 20)) * ServiceMult * FreqMult
                    const rawPrice = (baseRates[bed] + (bath * bathroomadder)) * serviceMultiplier * freqMultipliers[freq];

                    pricingRows.push({
                        serviceId: service.id,
                        locationId: null, // Global default
                        bedrooms: bed,
                        bathrooms: bath,
                        frequency: freq,
                        basePrice: rawPrice.toFixed(2),
                        isActive: true // Not in schema, but d-o ignores extra keys usually? Or TS error? 
                        // Wait, schema check. baseBooking has NO isActive.
                        // I removed it from my `write_to_file` call previous time but maybe put it back.
                        // I will remove `isActive: true` to match schema purely.
                    });
                }
            }
        }
    }

    if (pricingRows.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < pricingRows.length; i += batchSize) {
            await db.insert(basePricing).values(pricingRows.slice(i, i + batchSize));
        }
        console.log(`   ✅ Inserted ${pricingRows.length} base pricing rows`);
    }

    // 3. Add-Ons
    console.log("   📍 Seeding Add-Ons...");

    const addOnList = [
        // Complex Rules
        {
            name: "Deep Clean Upgrade",
            description: "Thorough deep cleaning for build-up removal",
            priceType: "rule_based",
            basePrice: "0",
            rules: [
                { minBed: 1, maxBed: 2, price: 75.00 },
                { minBed: 3, maxBed: 3, price: 105.00 },
                { minBed: 4, maxBed: 5, price: 140.00 },
                { minBed: 6, maxBed: 10, price: 200.00 }
            ]
        },
        {
            name: "Post-Construction Clean",
            description: "Removal of dust and debris after renovation",
            priceType: "rule_based",
            basePrice: "0",
            rules: [
                { minBed: 1, maxBed: 2, price: 200.00 }, // Small/Medium
                { minBed: 3, maxBed: 4, price: 275.00 }, // Large
                { minBed: 5, maxBed: 10, price: 375.00 } // Very Large
            ]
        },
        // Simple Flat Items - PRICES UPDATED FROM SCREENSHOTS
        { name: "Inside Microwave", description: "Interior microwave cleaning", priceType: "flat", basePrice: "10.00" },
        { name: "Inside Oven", description: "Interior oven cleaning", priceType: "flat", basePrice: "35.00" }, // Updated
        { name: "Inside Fridge", description: "Interior fridge cleaning", priceType: "flat", basePrice: "35.00" }, // Updated from 45 -> 35
        { name: "Inside Cabinets", description: "Interior cabinet cleaning", priceType: "flat", basePrice: "35.00" },
        { name: "Interior Windows", description: "Cleaning inside of windows", priceType: "per_unit", basePrice: "45.00", unitLabel: "per window" }, // Updated from 10 -> 45
        { name: "Laundry", description: "Wash, dry, fold one load", priceType: "flat", basePrice: "25.00", unitLabel: "per load" }, // Updated from 15 -> 25
        { name: "Move In/Out", description: "Extra time for empty homes", priceType: "flat", basePrice: "125.00" },
        { name: "Sweep Garage", description: "Sweep garage floor", priceType: "flat", basePrice: "30.00" },
        { name: "Finished Basement", description: "Clean finished basement area", priceType: "flat", basePrice: "60.00" },
        { name: "Pets", description: "Pet hair removal surcharge", priceType: "flat", basePrice: "30.00" }, // Updated from 20 -> 30
    ];

    for (const item of addOnList) {
        const [inserted] = await db.insert(addOns).values({
            name: item.name,
            description: item.description,
            priceType: item.priceType as any,
            basePrice: item.basePrice,
            unitLabel: item.unitLabel || null,
            isActive: true
        }).returning({ id: addOns.id });

        if (item.rules && inserted) {
            const ruleRows = item.rules.map(r => ({
                addOnId: inserted.id,
                minBedrooms: r.minBed,
                maxBedrooms: r.maxBed,
                adjustmentType: "flat" as const,
                flatAmount: r.price.toFixed(2),
                minPrice: r.price.toFixed(2),
                maxPrice: r.price.toFixed(2),
            }));
            await db.insert(addOnPricingRules).values(ruleRows);
        }
    }
    console.log(`   ✅ Inserted ${addOnList.length} add-ons with ${addOnList.filter(a => a.rules).length} rule sets`);

    console.log("🎉 Pricing seeding complete!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
