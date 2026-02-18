import { createClient } from '@supabase/supabase-js'

// Hardened environmental extraction for production build stability
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

// Fallbacks for build-time safety (Next.js pre-rendering)
const supabaseUrl = rawUrl && rawUrl.startsWith('http') ? rawUrl : 'https://placeholder.supabase.co'
const supabaseKey = rawKey || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
