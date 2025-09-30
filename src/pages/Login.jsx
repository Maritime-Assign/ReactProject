import { useState, useEffect, useCallback } from 'react'
import styles from './Login.module.css'
import showPasswordIcon from '../assets/show_password_icon.svg'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import supabase from '../supabaseClient'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const { signInUser, user, role, loadingSession } = UserAuth()
    const navigate = useNavigate()

    // Redirect automatically if a user is already logged in
    useEffect(() => {
        if (!loadingSession && user) {
            navigate('/dashboard')
        }
        if (!loadingSession && !user) {
            navigate('/login')
        }
    }, [user, role, loadingSession, navigate])

    const handleLogIn = useCallback(
        async (e) => {
            e.preventDefault()
            if (loading) return
            setLoading(true)
            setError(null)

            try {
                const result = await signInUser(email, password)

                if (!result.success) {
                    setError(result.error || 'Login failed')
                    return
                }

                // login event logging
                const loggedInUser = result.data.user
                if (loggedInUser) {
                    const { error: insertError } = await supabase
                        .from('login_events')
                        .insert([
                            {
                                user_id: loggedInUser.id,
                                timestamp: new Date().toISOString(), // matches table column
                                email: loggedInUser.email,
                            },
                        ])

                    if (insertError) {
                        console.error(
                            'Failed to log event:',
                            insertError.message
                        )
                    }
                }
            } catch (err) {
                console.error(err)
                setError('Unexpected error logging in')
            } finally {
                setLoading(false)
            }
        },
        [email, password, loading, signInUser, navigate]
    ) // dependencies for useCallback

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className='w-full h-[calc(100vh-100px)] flex items-center justify-center'>
            <div className='w-fit p-12 shadow-[0_0_10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center rounded-md'>
                <div className='text-2xl font-mont font-medium text-mebablue-dark mb-3'>
                    Login
                </div>
                <div className={styles.underline}></div>
                <div className='flex flex-col gap-4 mt-4'>
                    <div className='flex border border-neutral-300 rounded-md h-12 w-100 focus-within:border-mebagold'>
                        <input
                            type='email'
                            placeholder=' Enter your email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            autoComplete='off'
                        />
                    </div>
                    <div className='w-100 h-12 flex flex-row border border-neutral-300 rounded-md items-center focus-within:border-mebagold'>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='   Enter your password'
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            autoComplete='off'
                        />
                        <img
                            className='mr-2 hover:cursor-pointer'
                            src={showPasswordIcon}
                            alt='show password icon'
                            onClick={toggleShowPassword}
                        />
                    </div>
                </div>
                <div className='pt-4'>
                    <Link to='/password-recovery'>
                        <button className='bg-mebablue-light rounded-md px-4 py-2 w-100 cursor-pointer'>
                            <span className='text-lg font-mont text-white'>
                                Forgot Password?
                            </span>
                        </button>
                    </Link>
                </div>

                <div className='py-2'>
                    <button
                        className='bg-mebablue-dark rounded-md px-4 py-2 text-lg text-white w-100 cursor-pointer font-mont'
                        onClick={handleLogIn}
                    >
                        Login
                    </button>
                </div>
                {error && (
                    <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
                )}
                {loading && <p style={{ textAlign: 'center' }}>Signing in…</p>}
            </div>
        </div>
    )
}

export default Login
