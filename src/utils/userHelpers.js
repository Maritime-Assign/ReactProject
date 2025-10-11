import { supabase } from '../api/supabaseClient'

// Function to fetch user role from Supabase
// Returns the role as a string, or null if not found
export async function fetchUserRole(userId) {
  const { data, error } = await supabase
    .from('Users')
    .select('role')
    .eq('UUID', userId)
    .single()

  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }
  return data?.role ?? null
}
