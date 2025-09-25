import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined)
    const [role, setRole] = useState(null)

    // Sign in
    const signInUser = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password,
            })

            // Handle Supabase error explicitly
            if (error) {
                console.error('Sign-in error:', error.message) // Log the error for debugging
                return { success: false, error: error.message } // Return the error
            }

            // If no error, return success
            console.log('Sign-in success:', data)
            return { success: true, data } // Return the user data
        } catch (error) {
            // Handle unexpected issues
            console.error('Unexpected error during sign-in:', err.message)
            return {
                success: false,
                error: 'An unexpected error occurred. Please try again.',
            }
        }
    }

    // Sign out
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error signing out:', error)
        }
        setRole(null)
    }

    useEffect(() => {
        // On mount, check initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session)
            if (session?.user) {
                const userRole = await fetchUserRole(session.user.id)
                setRole(userRole)
            }
        })
    }, [])

    const fetchUserRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('public.users')
                .select('role')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Supabase api error fetching role:', error)
                return null
            }
            return data.role
        } catch (err) {
            console.error('Unexpected JS error fetching role:', err)
            return null
        }
    }

    return (
        <AuthContext.Provider
            value={{ signInUser, session, user: session?.user, signOut }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}
