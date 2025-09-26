import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined) // state to hold session value
    const [role, setRole] = useState(null) // state to hold role
    const [loadingSession, setLoadingSession] = useState(true) // capture loading state

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
        } catch (err) {
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

    const fetchUserRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('Users')
                .select('role')
                .eq('UUID', userId)
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

    useEffect(() => {
        const initializeSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()
            if (session?.user) {
                setSession(session)
                const userRole = await fetchUserRole(session.user.id)
                setRole(userRole)
                // debug log for user role
                console.log('Fetched user role on mount:', userRole)
            } else {
                setSession(null)
                setRole(null)
            }
            setLoadingSession(false)
        }

        initializeSession()

        // Listen for login/logout and session changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    setSession(session)
                    const userRole = await fetchUserRole(session.user.id)
                    setRole(userRole)
                } else {
                    setSession(null)
                    setRole(null)
                }
                setLoadingSession(false)
            }
        )

        // Cleanup subscription on unmount
        return () => listener.subscription.unsubscribe()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user: session?.user,
                role,
                signInUser,
                signOut,
                loadingSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}
