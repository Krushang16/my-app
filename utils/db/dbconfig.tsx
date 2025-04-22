

import {neon} from "@neondatabase/serverless";

import {drizzle} from "drizzle-orm/neon-http";

import* as schema from "./schema";

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql,{schema});

export async function getUnreadNotifications(userId: number) {
    const sql = neon(process.env.DATABASE_URL!);
    const query = `
        SELECT id, message, read
        FROM notifications
        WHERE user_id = $1 AND read = false; // Assuming this is the correct table and condition
    `;
    console.log('Executing SQL Query:', query); // Log the query to help debugging
  
    // Note the order of arguments to sql.query(): first the query, then an array of parameters
    try {
      const result = await sql.query(query, [userId]); // Make sure parameters are passed correctly
      return result.rows;
    } catch (error) {
      console.error('Error in getUnreadNotifications:', error);
      throw error; // Re-throw to handle upstream
    }
  }