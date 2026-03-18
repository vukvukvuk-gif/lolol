import { calculatePrice } from "./src/lib/pricing-engine";
import { db } from "./src/db";
import { services, addOns } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function verify() {
    console.log("🧪 Verifying Pricing Engine...");

    // 1. Get a Service ID (Regular Maintenance)
    const service = await db.query.services.findFirst({
        where: eq(services.name, "Regular Maintenance")
    });

    if (!service) {
        console.error("❌ Service 'Regular Maintenance' not found. Seed DB first.");
        process.exit(1);
    }
    console.log(`✅ Using Service: ${service.name} (${service.id})`);

    // 2. Get Add-On IDs (Deep Clean Upgrade + Inside Fridge)
    const deepClean = await db.query.addOns.findFirst({
        where: eq(addOns.name, "Deep Clean Upgrade")
    });
    const fridge = await db.query.addOns.findFirst({
        where: eq(addOns.name, "Inside Fridge")
    });

    if (!deepClean || !fridge) {
        console.error("❌ Add-ons not found.");
        process.exit(1);
    }
    console.log(`✅ Using Add-Ons: ${deepClean.name}, ${fridge.name}`);

    // 3. Test Case 1: Simple 1 Bed / 1 Bath / One-Time
    console.log("\n--- Test Case 1: 1 Bed / 1 Bath / One-Time (Base Only) ---");
    const result1 = await calculatePrice({
        serviceId: service.id,
        locationId: "", // Global default (empty string or null, function handles null)
        bedrooms: 1,
        bathrooms: 1,
        sqft: 800,
        frequency: "one_time",
        addOnIds: []
    });
    console.log("Result 1:", JSON.stringify(result1, null, 2));

    // 4. Test Case 2: 3 Bed / 2 Bath / Weekly + Deep Clean Rule + Fridge
    console.log("\n--- Test Case 2: 3 Bed / 2 Bath / Weekly + Add-Ons ---");
    // Expect:
    // Base: 3bed/2bath base * weekly discount
    // Deep Clean Rule: 3 bedrooms -> Price X
    // Fridge: Flat price Y

    // Note: locationId passed as null effectively
    const result2 = await calculatePrice({
        serviceId: service.id,
        locationId: "",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1500,
        frequency: "weekly",
        addOnIds: [deepClean.id, fridge.id]
    });
    console.log("Result 2:", JSON.stringify(result2, null, 2));

    process.exit(0);
}

verify().catch(console.error);
