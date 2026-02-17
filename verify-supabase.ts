import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load .env.local manually
const envPath = path.resolve(__dirname, '.env.local')
const envConfig = dotenv.parse(fs.readFileSync(envPath))

for (const k in envConfig) {
    process.env[k] = envConfig[k]
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key Length:', supabaseKey?.length)

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    try {
        const { data, error } = await supabase.from('clients').select('count', { count: 'exact', head: true })

        if (error) {
            // failed to fetch often means network or URL issues
            // 401 means invalid key
            console.error('Connection Error:', error.message, error.details, error.hint, error.code)
        } else {
            console.log('Connection Successful! Supabase is reachable.')
        }
    } catch (err) {
        console.error('Unexpected Error:', err)
    }
}

testConnection()
