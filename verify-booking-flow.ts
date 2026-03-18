import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";
import * as schema from "./src/db/schema";
import { bookings, services, locations, addOns } from "./src/db/schema";
import { calculatePrice } from "./src/lib/pricing-engine";
import { v4 as uuidv4 } from 'uuid';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function verifyBookingFlow() {
    console.log("🧪 Verifying Booking Flow (Backend Simulation)...");

    // 1. Get Prerequisites
    const service = await db.query.services.findFirst({
        where: (t, { eq }) => eq(t.name, "Deep Cleaning")
    });
    // In case logic isn't exact match, try fuzzy or just grab first
    const anyService = service || await db.query.services.findFirst();

    const location = await db.query.locations.findFirst();
    const addOn = await db.query.addOns.findFirst({
        where: (t, { eq }) => eq(t.name, "Inside Fridge")
    });

    if (!anyService || !location) {
        console.error("❌ Missing seed data (service or location). Run seeds first.");
        process.exit(1);
    }

    console.log(`   ✅ Using Service: ${anyService.name} (${anyService.id})`);
    console.log(`   ✅ Using Location: ${location.name} (${location.id})`);

    // 2. Simulate Payload
    const payload = {
        serviceId: anyService.id,
        locationId: location.id,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1500,
        frequency: "one_time" as const, // Should be typed
        addOnIds: addOn ? [addOn.id] : []
    };

    console.log("   📍 Calculating Price...");
    const pricing = await calculatePrice(payload);
    console.log("   💵 Price Result:", pricing.finalPrice);

    // 3. Simulate DB Insert (Create Booking)
    console.log("   📍 Inserting Booking...");
    const [booking] = await db.insert(bookings).values({
        serviceId: payload.serviceId,
        locationId: payload.locationId,
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "555-0123",
        frequency: payload.frequency,
        bedrooms: payload.bedrooms,
        bathrooms: payload.bathrooms,
        sqft: payload.sqft,
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: "10:00",

        basePrice: pricing.basePrice.toString(),
        addOnTotal: pricing.addOnTotal.toString(),
        finalPrice: pricing.finalPrice.toString(),

        status: "pending"
    }).returning();

    console.log(`   ✅ Booking Created! ID: ${booking.id}`);
    console.log(`   🎉 Verification Successful.`);
    process.exit(0);
}

verifyBookingFlow().catch(err => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
