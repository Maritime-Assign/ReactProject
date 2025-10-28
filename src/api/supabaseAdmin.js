import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseService = import.meta.env.VITE_SUPABASE_SERVICE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseService, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export default supabaseAdmin
