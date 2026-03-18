import type { APIRoute } from 'astro';
import { db } from '../../db';
import { services, addOns } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
    try {
        const allServices = await db.select().from(services).where(eq(services.isActive, true));
        const allAddOns = await db.select().from(addOns).where(eq(addOns.isActive, true));

        // Add hardcoded multipliers/icons or map them if needed for UI
        // For now, we return raw DB data.
        // Frontend will map these to icons/multipliers based on name or ID if needed, 
        // or we can enhance this API later.

        return new Response(JSON.stringify({
            services: allServices,
            addOns: allAddOns
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch services" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
