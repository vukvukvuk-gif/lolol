
import { db } from './src/db';
import { sql } from 'drizzle-orm';

const setup = async () => {
    console.log('Creating stored procedure: get_bookings_for_month...');

    // Drop if exists to avoid conflicts during development
    await db.execute(sql`DROP FUNCTION IF EXISTS get_bookings_for_month(text)`);

    // Create get_bookings_for_month
    await db.execute(sql`
        CREATE OR REPLACE FUNCTION get_bookings_for_month(month_pattern TEXT)
        RETURNS TABLE (date_str TEXT, time_str TEXT)
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY
            SELECT b.date, b.time
            FROM bookings b
            WHERE b.date LIKE month_pattern || '%';
        END;
        $$;
    `);

    // Create get_bookings_for_day
    await db.execute(sql`
        CREATE OR REPLACE FUNCTION get_bookings_for_day(day_input TEXT)
        RETURNS TABLE (time_str TEXT)
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY
            SELECT b.time
            FROM bookings b
            WHERE b.date = day_input;
        END;
        $$;
    `);

    // Create is_slot_booked
    await db.execute(sql`
        CREATE OR REPLACE FUNCTION is_slot_booked(day_input TEXT, time_input TEXT)
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        AS $$
        DECLARE
            slot_exists BOOLEAN;
        BEGIN
            SELECT EXISTS(SELECT 1 FROM bookings b WHERE b.date = day_input AND b.time = time_input) INTO slot_exists;
            RETURN slot_exists;
        END;
        $$;
    `);

    console.log('Stored procedure created successfully.');
    process.exit(0);
};

setup().catch((err) => {
    console.error('Failed to create stored procedure:', err);
    process.exit(1);
});
