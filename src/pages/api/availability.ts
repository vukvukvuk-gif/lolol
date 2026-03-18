
import type { APIRoute } from 'astro';
import { db } from '../../db';
import { sql } from 'drizzle-orm';

export const prerender = false;


export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date'); // YYYY-MM-DD
    const locationId = url.searchParams.get('locationId');

    if (!dateParam || !locationId) {
        return new Response(JSON.stringify({ error: 'Date and Location parameters are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Query bookings for the specific date and location
        // Note: 'date' column in bookings is text YYYY-MM-DD
        const result = await db.execute(sql`
            SELECT appointment_time FROM bookings 
            WHERE appointment_date = ${dateParam} 
            AND location_id = ${locationId}
            AND status NOT IN ('cancelled', 'no_show')
            AND deleted_at IS NULL
        `);

        // Extract and normalize booked times (HH:mm:ss -> HH:mm)
        const bookedTimes = result.rows.map((row: any) => {
            const time = row.appointment_time;
            return time && time.length >= 5 ? time.substring(0, 5) : time;
        });

        return new Response(JSON.stringify({ bookedTimes }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[Availability] Error fetching availability:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch availability' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
