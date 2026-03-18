import { db } from "../db";
import { basePricing, addOnPricingRules, addOns, services } from "../db/schema";
import { eq, and, lte, gte, isNull, or } from "drizzle-orm";

export interface PricingRequest {
    serviceId: string;
    locationId: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    frequency: "one_time" | "weekly" | "bi_weekly" | "monthly";
    addOnIds: string[];
}

export interface PricingResult {
    basePrice: number;
    addOnTotal: number;
    finalPrice: number;
    breakdown: {
        base: number;
        addOns: Array<{
            id: string;
            name: string;
            price: number;
        }>;
    };
}

export async function calculatePrice(request: PricingRequest): Promise<PricingResult> {
    const { serviceId, locationId, bedrooms, bathrooms, sqft, frequency, addOnIds } = request;

    // Fix: Convert empty string to null for Postgres UUID compatibility
    const queryLocationId = locationId && locationId.trim() !== "" ? locationId : null;

    // 1. Fetch Base Price
    const basePriceRecords = await db.select()
        .from(basePricing)
        .where(
            and(
                eq(basePricing.serviceId, serviceId),
                eq(basePricing.bedrooms, bedrooms),
                eq(basePricing.bathrooms, bathrooms),
                eq(basePricing.frequency, frequency),
                or(eq(basePricing.locationId, queryLocationId), isNull(basePricing.locationId))
            )
        );

    // If multiple records found (e.g. global + specific), pick specific.
    let selectedBase = basePriceRecords.find(r => r.locationId === queryLocationId);
    if (!selectedBase) {
        selectedBase = basePriceRecords.find(r => r.locationId === null);
    }

    if (!selectedBase) {
        throw new Error("Base pricing not found for these parameters.");
    }

    const basePrice = parseFloat(selectedBase.basePrice);

    // 2. Calculate Add-Ons
    let addOnTotal = 0;
    const addOnBreakdown: PricingResult['breakdown']['addOns'] = [];

    if (addOnIds.length > 0) {
        for (const addOnId of addOnIds) {
            // Using db.query might fail if schema relations aren't set up, safer to use select
            const [addOn] = await db.select().from(addOns).where(eq(addOns.id, addOnId));

            if (!addOn) continue;

            let price = 0;

            if (addOn.priceType === 'flat') {
                price = parseFloat(addOn.basePrice || "0");
            } else if (addOn.priceType === 'rule_based') {
                // Fetch rules
                const rules = await db.select()
                    .from(addOnPricingRules)
                    .where(eq(addOnPricingRules.addOnId, addOnId));

                const matchedRule = rules.find(rule => {
                    const bedMatch = (rule.minBedrooms === null || bedrooms >= rule.minBedrooms) &&
                        (rule.maxBedrooms === null || bedrooms <= rule.maxBedrooms);
                    const sqftMatch = (rule.minSqft === null || sqft >= rule.minSqft) &&
                        (rule.maxSqft === null || sqft <= rule.maxSqft);
                    return bedMatch && sqftMatch;
                });

                if (matchedRule) {
                    if (matchedRule.adjustmentType === 'flat') {
                        price = parseFloat(matchedRule.flatAmount || "0");
                    } else if (matchedRule.adjustmentType === 'percentage') {
                        price = basePrice * (parseFloat(matchedRule.percentage || "0") / 100);
                    }
                } else {
                    price = parseFloat(addOn.basePrice || "0");
                }
            } else if (addOn.priceType === 'per_unit') {
                price = parseFloat(addOn.basePrice || "0");
            }

            addOnTotal += price;
            addOnBreakdown.push({
                id: addOn.id,
                name: addOn.name,
                price: price
            });
        }
    }

    return {
        basePrice,
        addOnTotal,
        finalPrice: basePrice + addOnTotal,
        breakdown: {
            base: basePrice,
            addOns: addOnBreakdown
        }
    };
}
