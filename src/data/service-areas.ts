export type ServiceArea = {
    name: string;
    slug: string;
    primary?: boolean;
    summary: string;
    zipCodes: string[];
    nearbyAreas: string[];
};

export const serviceAreas: ServiceArea[] = [
    {
        name: "St. Petersburg",
        slug: "st-petersburg",
        primary: true,
        summary:
            "Professional house cleaning throughout St. Petersburg, from downtown condos to family homes near the beaches.",
        zipCodes: [
            "33701",
            "33702",
            "33703",
            "33704",
            "33705",
            "33706",
            "33707",
            "33708",
            "33709",
            "33710",
            "33711",
            "33712",
            "33713",
            "33714",
            "33715",
            "33716",
        ],
        nearbyAreas: [
            "Downtown St. Petersburg",
            "Old Northeast",
            "Kenwood",
            "Snell Isle",
            "Shore Acres",
            "Coquina Key",
        ],
    },
    {
        name: "South Pasadena",
        slug: "south-pasadena-fl",
        summary:
            "Reliable recurring and deep cleaning for condos, townhomes, and residences in South Pasadena.",
        zipCodes: ["33707"],
        nearbyAreas: ["Pasadena Isle", "Harbourside", "Pasadena Golf Club Estates"],
    },
    {
        name: "Pinellas Park",
        slug: "pinellas-park",
        summary:
            "Flexible home cleaning services for busy households and rental properties across Pinellas Park.",
        zipCodes: ["33780", "33781", "33782"],
        nearbyAreas: ["Mainlands", "Skyview Terrace", "Bon Park", "Cross Bayou"],
    },
    {
        name: "Kenneth City",
        slug: "kenneth-city",
        summary:
            "Consistent maintenance cleaning and move-out support for homes in Kenneth City.",
        zipCodes: ["33709"],
        nearbyAreas: ["Clearview Oaks", "Sun Haven Homes", "Kenneth Park"],
    },
    {
        name: "Lealman",
        slug: "lealman",
        summary:
            "Detail-focused residential cleaning for Lealman homeowners and nearby neighborhoods.",
        zipCodes: ["33709", "33713", "33714"],
        nearbyAreas: ["Lealman Heights", "North Disston Heights", "Harris Park"],
    },
    {
        name: "West Lealman",
        slug: "west-lealman",
        summary:
            "Trusted cleaning services for homes and apartments throughout West Lealman.",
        zipCodes: ["33709", "33710", "33713"],
        nearbyAreas: ["Tyrone area", "Jungle Terrace", "Disston Heights"],
    },
    {
        name: "Gulfport",
        slug: "gulfport",
        summary:
            "House cleaning with a personal touch for Gulfport cottages, bungalows, and waterfront homes.",
        zipCodes: ["33707"],
        nearbyAreas: ["Art District", "Marina District", "Boca Ciega Bay area"],
    },
    {
        name: "Seminole",
        slug: "seminole",
        summary:
            "Routine, deep, and move-in cleaning for households throughout Seminole and nearby communities.",
        zipCodes: ["33772", "33776", "33777", "33778"],
        nearbyAreas: ["Oakhurst", "Seminole Lake Country Club", "Bardmoor fringe"],
    },
    {
        name: "Treasure Island",
        slug: "treasure-island",
        summary:
            "Dependable cleaning for full-time residents, vacation homes, and coastal properties in Treasure Island.",
        zipCodes: ["33706"],
        nearbyAreas: ["Isle of Capri", "Sunshine Beach", "Paradise Island"],
    },
    {
        name: "Madeira Beach",
        slug: "madeira-beach",
        summary:
            "Professional cleaning for Madeira Beach homes, condos, and short-term rental turnovers.",
        zipCodes: ["33708"],
        nearbyAreas: ["Madeira Way", "Gulf Boulevard corridor", "John's Pass area"],
    },
    {
        name: "Bay Pines",
        slug: "bay-pines",
        summary:
            "Convenient home cleaning service for Bay Pines residents and properties near the waterfront.",
        zipCodes: ["33708"],
        nearbyAreas: ["Bay Pines VA area", "Long Bayou", "Seminole waterfront"],
    },
];
