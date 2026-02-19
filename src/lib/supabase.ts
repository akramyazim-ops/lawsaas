import { createClient } from '@supabase/supabase-js'

// Hardened environmental extraction for production build stability
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

// Fallbacks for build-time safety (Next.js pre-rendering)
// We use a valid URL format to prevent Supabase-js from throwing during static analysis
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : 'https://placeholder-project.supabase.co'
const supabaseKey = rawKey || 'placeholder-key'

// Log only in non-production or if we're using placeholders to help debug missing env vars
if (supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Supabase URL is missing or invalid. Using placeholder for build stability.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
