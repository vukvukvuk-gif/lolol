import type { APIRoute } from 'astro';
import { db } from '../../db';
import { bookings, bookingAddOns } from '../../db/schema';
import { calculatePrice } from '../../lib/pricing-engine';
import { v4 as uuidv4 } from 'uuid';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.serviceId || !body.placeId || !body.email || !body.date) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Calculate confirmed price on server side
        const pricingResult = await calculatePrice({
            serviceId: body.serviceId,
            locationId: body.placeId, // Mapping frontend placeId -> locationId
            bedrooms: body.bedrooms || 0,
            bathrooms: body.bathrooms || 0,
            sqft: body.sqft || 0,
            frequency: body.frequency || 'one_time',
            addOnIds: body.addons || []
        });

        // 2. Create Booking
        const [newBooking] = await db.insert(bookings).values({
            serviceId: body.serviceId,
            locationId: body.placeId,
            firstName: body.firstName,
            lastName: body.lastName || '',
            email: body.email,
            phone: body.phone || '',
            frequency: body.frequency || 'one_time',
            bedrooms: body.bedrooms || 0,
            bathrooms: body.bathrooms || 0,
            sqft: body.sqft || 0,
            appointmentDate: body.date,
            appointmentTime: body.time,

            // Pricing from engine
            basePrice: pricingResult.basePrice.toString(),
            addOnTotal: pricingResult.addOnTotal.toString(),
            finalPrice: pricingResult.finalPrice.toString(),

            status: 'pending',
            paymentStatus: 'pending',
            notes: body.notes || ''
        }).returning({ id: bookings.id });

        // 3. Create Booking Add-ons
        if (pricingResult.breakdown.addOns.length > 0) {
            const addOnInserts = pricingResult.breakdown.addOns.map(addon => ({
                bookingId: newBooking.id,
                addOnId: addon.id,
                quantity: 1, // Assuming 1 for now, or derived if logic supports it
                calculatedPrice: addon.price.toString()
            }));

            await db.insert(bookingAddOns).values(addOnInserts);
        }

        return new Response(JSON.stringify({
            message: 'Booking created successfully',
            id: newBooking.id,
            price: pricingResult.finalPrice
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error creating booking:', error);

        // Handle unique constraint violation (slot already taken)
        if (error.code === '23505' && error.constraint === 'booking_slot_unique_idx') {
            return new Response(JSON.stringify({ error: 'This time slot was just taken. Please choose another time.' }), {
                status: 409, // Conflict
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: error.message || 'Failed to create booking' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
