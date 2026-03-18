import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";
import { basePricing, addOns } from "./src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// =====================================================
// ONE-TIME BASE PRICES (bedroom, bathroom, price)
// =====================================================
const oneTimePrices: [number, number, number][] = [
    [1, 1, 168], [1, 2, 198],
    [2, 1, 198], [2, 2, 218], [2, 3, 240],
    [3, 1, 220], [3, 2, 240], [3, 3, 265], [3, 4, 275], [3, 5, 305],
    [4, 1, 255], [4, 2, 275], [4, 3, 295], [4, 4, 325], [4, 5, 350],
    [5, 2, 295], [5, 3, 320], [5, 4, 335], [5, 5, 355],
    [6, 2, 470], [6, 3, 490], [6, 4, 515], [6, 5, 540],
];

// Discount multipliers
const discounts: Record<string, number> = {
    one_time: 1.0,
    weekly: 0.80,
    bi_weekly: 0.85,
    monthly: 0.90,
};

// Weekly promo overrides (bed, bath) -> promo price
const weeklyPromos: Record<string, number> = {
    "2-2": 169,
    "2-3": 180,
    "3-3": 208,
};

// Bi-weekly promo overrides
const biWeeklyPromos: Record<string, number> = {
    "2-2": 178,
    "2-3": 194,
};

type Frequency = "one_time" | "weekly" | "bi_weekly" | "monthly";

function buildBasePricingRows() {
    const rows: {
        bedrooms: number;
        bathrooms: number;
        frequency: Frequency;
        price: string;
        promoPrice: string | null;
    }[] = [];

    for (const [bed, bath, basePrice] of oneTimePrices) {
        for (const [freq, mult] of Object.entries(discounts)) {
            const price = (basePrice * mult).toFixed(2);
            const key = `${bed}-${bath}`;

            let promoPrice: string | null = null;
            if (freq === "weekly" && weeklyPromos[key]) {
                promoPrice = weeklyPromos[key].toFixed(2);
            } else if (freq === "bi_weekly" && biWeeklyPromos[key]) {
                promoPrice = biWeeklyPromos[key].toFixed(2);
            }

            rows.push({
                bedrooms: bed,
                bathrooms: bath,
                frequency: freq as Frequency,
                price,
                promoPrice,
            });
        }
    }

    return rows;
}

// =====================================================
// ADD-ON SERVICES
// =====================================================
type AddOnCategory = "deep_clean" | "post_construction" | "kitchen" | "windows" | "laundry" | "move_in_out" | "additional_areas" | "home_conditions" | "scheduling";
type PriceType = "flat" | "per_unit" | "range";

const addOnData: {
    name: string;
    description: string;
    category: AddOnCategory;
    priceType: PriceType;
    price: string | null;
    minPrice: string | null;
    maxPrice: string | null;
    unitLabel: string | null;
}[] = [
        // Deep Clean
        { name: "Deep Clean — 1-2 Bedrooms", description: "Initial deep clean add-on for 1-2 bedroom homes", category: "deep_clean", priceType: "range", price: null, minPrice: "60.00", maxPrice: "85.00", unitLabel: null },
        { name: "Deep Clean — 3 Bedrooms", description: "Initial deep clean add-on for 3 bedroom homes", category: "deep_clean", priceType: "range", price: null, minPrice: "95.00", maxPrice: "115.00", unitLabel: null },
        { name: "Deep Clean — 4-5 Bedrooms", description: "Initial deep clean add-on for 4-5 bedroom homes", category: "deep_clean", priceType: "range", price: null, minPrice: "120.00", maxPrice: "160.00", unitLabel: null },
        { name: "Deep Clean — 6+ Bedrooms", description: "Initial deep clean add-on for 6+ bedroom homes", category: "deep_clean", priceType: "range", price: null, minPrice: "175.00", maxPrice: "225.00", unitLabel: null },

        // Post-Construction
        { name: "Post-Construction — Small/Medium", description: "Post-construction cleaning for small-medium homes", category: "post_construction", priceType: "flat", price: "200.00", minPrice: null, maxPrice: null, unitLabel: null },
        { name: "Post-Construction — Large", description: "Post-construction cleaning for large homes", category: "post_construction", priceType: "range", price: null, minPrice: "250.00", maxPrice: "300.00", unitLabel: null },
        { name: "Post-Construction — Very Large", description: "Post-construction cleaning for very large homes", category: "post_construction", priceType: "range", price: null, minPrice: "350.00", maxPrice: "400.00", unitLabel: null },

        // Kitchen
        { name: "Clean Inside Microwave", description: "Detailed microwave interior cleaning", category: "kitchen", priceType: "flat", price: "10.00", minPrice: null, maxPrice: null, unitLabel: null },
        { name: "Clean Inside Oven", description: "Detailed oven interior cleaning", category: "kitchen", priceType: "flat", price: "35.00", minPrice: null, maxPrice: null, unitLabel: null },
        { name: "Clean Inside Fridge (Full)", description: "Full fridge interior cleaning with items", category: "kitchen", priceType: "flat", price: "45.00", minPrice: null, maxPrice: null, unitLabel: null },
        { name: "Clean Inside Fridge (Empty)", description: "Empty fridge interior cleaning", category: "kitchen", priceType: "flat", price: "25.00", minPrice: null, maxPrice: null, unitLabel: null },
        { name: "Clean Inside Cabinets", description: "Interior cabinet cleaning", category: "kitchen", priceType: "flat", price: "35.00", minPrice: null, maxPrice: null, unitLabel: null },

        // Windows
        { name: "Interior Window Cleaning", description: "Interior window cleaning per window", category: "windows", priceType: "per_unit", price: "10.00", minPrice: null, maxPrice: null, unitLabel: "per window" },

        // Laundry
        { name: "Laundry (Wash, Dry, Fold)", description: "One standard load of laundry", category: "laundry", priceType: "flat", price: "15.00", minPrice: null, maxPrice: null, unitLabel: "per load" },

        // Move In/Out
        { name: "Move In / Move Out Cleaning", description: "Additional cleaning for move in/move out", category: "move_in_out", priceType: "flat", price: "125.00", minPrice: null, maxPrice: null, unitLabel: null },

        // Additional Areas
        { name: "Sweep Garage", description: "Garage sweeping service", category: "additional_areas", priceType: "flat", price: "30.00", minPrice: null, maxPrice: null, unitLabel: null },
        { name: "Clean Finished Basement", description: "Finished basement cleaning", category: "additional_areas", priceType: "flat", price: "60.00", minPrice: null, maxPrice: null, unitLabel: null },

        // Home Conditions
        { name: "Homes with Pets", description: "Extra cleaning for pet hair and dander", category: "home_conditions", priceType: "flat", price: "20.00", minPrice: null, maxPrice: null, unitLabel: null },

        // Scheduling
        { name: "Same-Day Booking", description: "Surcharge for same-day booking", category: "scheduling", priceType: "flat", price: "50.00", minPrice: null, maxPrice: null, unitLabel: null },
    ];

async function seed() {
    console.log("🌱 Seeding base pricing...");
    const pricingRows = buildBasePricingRows();
    await db.insert(basePricing).values(pricingRows).onConflictDoNothing();
    console.log(`   ✅ Inserted/Skipped ${pricingRows.length} base pricing rows`);

    console.log("🌱 Seeding add-ons...");
    await db.insert(addOns).values(addOnData).onConflictDoNothing();
    console.log(`   ✅ Inserted/Skipped ${addOnData.length} add-on rows`);

    console.log("🎉 Seeding complete!");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
