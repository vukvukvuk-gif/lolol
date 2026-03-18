import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const resendApiKey =
    (import.meta && import.meta.env && import.meta.env.RESEND_API_KEY) ||
    process.env.RESEND_API_KEY;
const leadRecipient =
    (import.meta && import.meta.env && import.meta.env.LEAD_NOTIFICATION_EMAIL) ||
    process.env.LEAD_NOTIFICATION_EMAIL ||
    "support@homecleaningco.com";
const fromEmail =
    (import.meta && import.meta.env && import.meta.env.RESEND_FROM_EMAIL) ||
    process.env.RESEND_FROM_EMAIL ||
    "Home Cleaning & Co <onboarding@resend.dev>";

export const POST: APIRoute = async ({ request }) => {
    if (!resendApiKey) {
        return new Response(
            JSON.stringify({ error: "RESEND_API_KEY is not configured" }),
            { status: 500 },
        );
    }

    const resend = new Resend(resendApiKey);

    try {
        const body = await request.json();
        const { firstName, lastName, email, phone, zipCode } = body;

        if (!firstName || !lastName || !email || !phone || !zipCode) {
            return new Response(
                JSON.stringify({ error: "All form fields are required" }),
                { status: 400 },
            );
        }

        const { error } = await resend.emails.send({
            from: fromEmail,
            to: [leadRecipient],
            subject: `New Lead: ${firstName} ${lastName}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2F9E87;">New Free Estimate Request</h2>
                    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Zip Code:</strong> ${zipCode}</p>
                </div>
            `,
        });

        if (error) {
            return new Response(JSON.stringify({ error }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: "Success" }), {
            status: 200,
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Internal Error" }), {
            status: 500,
        });
    }
};
