
import type { APIRoute } from 'astro';
import { db } from '../../db';
import { locations } from '../../db/schema';
import { isNull } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        const placesData = await db.select().from(locations).where(isNull(locations.deletedAt));

        return new Response(JSON.stringify({ places: placesData, pricing: [] }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching places/pricing:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch configuration data' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
