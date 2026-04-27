import { createClient } from '@supabase/supabase-js'

// Defaults match `.env.example` so `npm run dev` works without `.env.local`.
// Override with your own project by copying `.env.example` to `.env.local`.
const DEFAULT_URL = 'https://jexqrbxpgxnmwxgkyinn.supabase.co'
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleHFyYnhwZ3hubXd4Z2t5aW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNTA5NTUsImV4cCI6MjA5MjgyNjk1NX0.dqrX_D6KabdK-kyzZD7mbFO6CfG9cHjJ_cvvJq1c2AM'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || DEFAULT_URL
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || DEFAULT_ANON_KEY

/** True when both URL and anon key came from the environment (not built-in fallbacks). */
export const isSupabaseEnvFromFile = Boolean(
  import.meta.env.VITE_SUPABASE_URL?.trim() && import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
)

if (import.meta.env.DEV && !isSupabaseEnvFromFile) {
  console.info(
    '[united-trip-planner] Using built-in demo Supabase URL and anon key. Add .env.local to point at your own project.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Hardcoded demo user — matches seed in `supabase/seed/`
export const DEMO_USER_ID =
  (import.meta.env.VITE_DEMO_USER_ID as string | undefined)?.trim() ||
  '00000000-0000-0000-0000-000000000001'
