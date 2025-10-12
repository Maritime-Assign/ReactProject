import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined) // state to hold session value
    const [role, setRole] = useState(null) // state to hold role
    const [loadingSession, setLoadingSession] = useState(true) // capture loading state

    // Sign in
    const signInUser = async (username, password) => {
        const email = `${username}@maritimeassign.local`
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (!error) {
            setSession(data.session)
            if (data.user) {
                const userRole = await fetchUserRole(data.user.id)
                if (userRole) {
                    setRole(userRole)
                } else {
                    // Role fetch failed → reset session and redirect
                    setSession(null)
                    setRole(null)
                    navigate('/login', { replace: true })
                }
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
        if (!userId) return null
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
            return data?.role ?? null
        } catch (err) {
            console.error('Unexpected JS error fetching role:', err)
            return null
        }
    }

    useEffect(() => {
        const initializeSession = async () => {
            try {
                const { data } = await supabase.auth.getSession()
                const currentSession = data?.session ?? null
                setSession(currentSession)
                if (currentSession?.user) {
                    const userRole = await fetchUserRole(currentSession.user.id)
                    if (userRole) {
                        setRole(userRole)
                    } else {
                        setSession(null)
                        setRole(null)
                        navigate('/login', { replace: true })
                    }
                }
            } catch (err) {
                console.error('Error fetching session on mount:', err)
                setSession(null)
                setRole(null)
            } finally {
                setLoadingSession(false)
            }
        }
        initializeSession()
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
