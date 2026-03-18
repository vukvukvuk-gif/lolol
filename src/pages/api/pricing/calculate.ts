import type { APIRoute } from 'astro';
import { calculatePrice, type PricingRequest } from '../../../lib/pricing-engine';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json() as PricingRequest;

        // Validation (basic)
        if (!body.serviceId || !body.bedrooms || !body.bathrooms || !body.frequency) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const result = await calculatePrice(body);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        console.error("Pricing calculation error:", error);
        return new Response(JSON.stringify({ error: error.message || "Calculation failed" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
