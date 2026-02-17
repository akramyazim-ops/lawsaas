import { createClient } from '@supabase/supabase-js'

// We use direct access and provide a hard fallback to avoid any falsy values
// during the Next.js build/prerendering phase.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// Double check to ensure we are not passing an empty string
const finalUrl = supabaseUrl.trim() === '' ? 'https://placeholder.supabase.co' : supabaseUrl
const finalKey = supabaseKey.trim() === '' ? 'placeholder' : supabaseKey

export const supabase = createClient(finalUrl, finalKey)
