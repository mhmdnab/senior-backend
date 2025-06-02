import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing supabase role key!!");
}

if (!SUPABASE_URL) {
  throw new Error("Missing supabase url!!");
}

// Remove the unsupported `fetch` field from the options object:
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);
