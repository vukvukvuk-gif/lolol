import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;
const env = (key: string) => process.env[key] || import.meta.env[key];
const reply = (status: number, message: string) => new Response(JSON.stringify({ message }), {
    status, headers: { "Content-Type": "application/json" },
});

export const POST: APIRoute = async ({ request }) => {
    let body: Record<string, unknown>;
    try { body = await request.json(); } catch { return reply(400, "Invalid request"); }
    const fields = ["firstName", "lastName", "email", "phone", "zipCode"] as const;
    if (!body || fields.some(key => typeof body[key] !== "string" || !(body[key] as string).trim() || (body[key] as string).length > 254)) {
        return reply(400, "All form fields are required and must be valid");
    }
    const [firstName, lastName, email, phone, zipCode] = fields.map(key => (body[key] as string).trim());
    const text = `New cleaning request\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nZIP code: ${zipCode}`;
    const token = env("TELEGRAM_BOT_TOKEN");
    const chatId = env("TELEGRAM_CHAT_ID");
    const resendKey = env("RESEND_API_KEY");
    const deliveries: Promise<void>[] = [];

    if (token && chatId) {
        deliveries.push((async () => {
            const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text, link_preview_options: { is_disabled: true } }),
                signal: AbortSignal.timeout(10000),
            });
            const result = await response.json();
            if (!response.ok || !result.ok) throw new Error("Notification delivery failed");
        })());
    }
    if (resendKey) {
        deliveries.push((async () => {
            const { error } = await new Resend(resendKey).emails.send({
                from: env("RESEND_FROM_EMAIL") || "Home Cleaning & Co <onboarding@resend.dev>",
                to: [env("LEAD_NOTIFICATION_EMAIL") || "support@homecleaningco.com"],
                subject: "New cleaning request",
                text,
            });
            if (error) throw new Error("Email delivery failed");
        })());
    }
    if (!deliveries.length) return reply(503, "Notifications are not configured");
    const results = await Promise.allSettled(deliveries);
    // A delivered email preserves the lead even if Telegram is temporarily unavailable.
    return results.some(result => result.status === "fulfilled")
        ? reply(200, "Success") : reply(502, "Unable to send request. Please try again or call us.");
};
