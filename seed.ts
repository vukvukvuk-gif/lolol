
import { db } from './src/db';
import { locations, bookings } from './src/db/schema';
import { v4 as uuidv4 } from 'uuid';

const seed = async () => {
    console.log('Clearing existing data...');
    try {
        await db.delete(bookings);
        await db.delete(locations);
    } catch (e) {
        console.warn('Error clearing data (might be empty):', e);
    }

    console.log('Seeding locations...');
    // Locations from Areas.astro
    await db.insert(locations).values([
        { id: uuidv4(), name: 'St. Petersburg' },
        { id: uuidv4(), name: 'South Pasadena' },
        { id: uuidv4(), name: 'Pinellas Park' },
        { id: uuidv4(), name: 'Kenneth City' },
        { id: uuidv4(), name: 'Lealman' },
        { id: uuidv4(), name: 'West Lealman' },
        { id: uuidv4(), name: 'Gulfport' },
        { id: uuidv4(), name: 'Seminole' },
        { id: uuidv4(), name: 'Treasure Island' },
        { id: uuidv4(), name: 'Madeira Beach' },
        { id: uuidv4(), name: 'Bay Pines' },
    ]).onConflictDoNothing();

    console.log('Seeding complete!');
    process.exit(0);
};

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
