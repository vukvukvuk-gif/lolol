
// Static UUIDs for services to keep them constant across environments
// Static UUIDs for services to keep them constant across environments
export const SERVICE_IDS = {
    REGULAR_MAINTENANCE: "9f1c3a72-6b8d-4e91-9c52-2f4a7d6e8b10",
    DEEP_CLEANING: "2c7e5f19-3a44-4b2d-8f61-9d3a7b5c1e22",
    MOVE_IN_OUT: "7a8d1c34-5f92-4e6b-a713-3c9f2d8b4a55",
    AIRBNB_TURNOVER: "4e2b9d61-8c73-4f15-b2a4-6d1e7c9f3a88",
    POST_CONSTRUCTION: "1b6f3d82-9a45-4c7e-8d21-5f3a9b7e2c66",
    OFFICE_CLEANING: "8d3a7c51-2f94-4b6e-a182-7c5e1d9a3f44",
} as const;

export const SERVICES = [
    {
        id: SERVICE_IDS.REGULAR_MAINTENANCE,
        name: "Regular Maintenance",
        description: "Professional cleaning for your home, recurring or one-time.",
        basePrice: "168.00",
    },
    {
        id: SERVICE_IDS.DEEP_CLEANING,
        name: "Deep Cleaning",
        description: "Thorough cleaning for homes with extra detailing and buildup removal.",
        basePrice: "228.00",
    },
    {
        id: SERVICE_IDS.MOVE_IN_OUT,
        name: "Move-In / Move-Out",
        description: "Preparation cleaning for selling, buying, or renting a home.",
        basePrice: "293.00",
    },
    {
        id: SERVICE_IDS.AIRBNB_TURNOVER,
        name: "Airbnb Turnover",
        description: "Fast and reliable turnover cleaning for short-term rentals.",
        basePrice: "180.00", // Estimate
    },
    {
        id: SERVICE_IDS.POST_CONSTRUCTION,
        name: "Post-Construction",
        description: "Specialized cleaning for homes after construction or renovation.",
        basePrice: "200.00",
    },
    {
        id: SERVICE_IDS.OFFICE_CLEANING,
        name: "Office Cleaning",
        description: "Professional cleaning services for commercial spaces and offices.",
        basePrice: "250.00", // Estimate
    },
];
