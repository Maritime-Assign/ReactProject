import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined) // state to hold session value
    const [role, setRole] = useState(null) // state to hold role
    const [loadingSession, setLoadingSession] = useState(true) // capture loading state

    // Sign in
    const signInUser = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (!error) {
            setSession(data.session)
            if (data.user) {
                const userRole = await fetchUserRole(data.user.id)
                setRole(userRole)
                console.log(
                    'Session/user/role after login:',
                    data.session,
                    data.user,
                    userRole
                )
            }
        }
        return { success: !error, data, error }
    }

    // Sign out
    const signOut = async () => {
        try {
            await supabase.auth.signOut()
        } catch (err) {
            console.error('Error signing out:', err)
        } finally {
            // Clear context state
            setSession(null)
            setRole(null)
            // Any other state your provider exposes, e.g., loading flags
        }
    }

    const fetchUserRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('Users')
                .select('role')
                .eq('UUID', userId)
                .maybeSingle()

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

    const [sessionInitialized, setSessionInitialized] = useState(false)

    useEffect(() => {
        const initializeSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession()
                setSession(session ?? null)

                if (session?.user) {
                    const userRole = await fetchUserRole(session.user.id)
                    setRole(userRole)
                } else {
                    setRole(null)
                }
            } catch (err) {
                console.error('Error fetching session on mount:', err)
                setSession(null)
                setRole(null)
            } finally {
                setLoadingSession(false)
                setSessionInitialized(true)
            }
        }

        initializeSession()

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (!sessionInitialized) return // ignore events until initial fetch
                setSession(session ?? null)

                if (session?.user) {
                    const userRole = await fetchUserRole(session.user.id)
                    setRole(userRole)
                } else {
                    setRole(null)
                }
            }
        )

        return () => listener.subscription.unsubscribe()
    }, [sessionInitialized])

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
