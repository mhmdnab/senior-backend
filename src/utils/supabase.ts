import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL) {
  throw new Error("Missing supabase url!!");
}

if (!SERVICE_ROLE_KEY) {
  throw new Error("Missing supabase role key!!");
}

// Remove the unsupported `fetch` field from the options object:
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
