import { createClient } from "@supabase/supabase-js";
import { env } from "@/configs/env";

// Create Supabase client
const supabase = createClient(env.SUPABASE_PROJECT_URL, env.SUPABASE_ANON_KEY);

export const supabaseStorage = supabase.storage.from(env.SUPABASE_BUCKET_NAME);
