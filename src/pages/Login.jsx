import { useState, useCallback } from 'react'
import styles from './Login.module.css'
import showPasswordIcon from '../assets/show_password_icon.svg'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../auth/AuthContext'
import supabase from '../api/supabaseClient'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [usernameError, setUsernameError] = useState(null)
    const [passwordError, setPasswordError] = useState(null)
    const [loading, setLoading] = useState(false)

    const { signInUser } = UserAuth()
    const navigate = useNavigate()

    const handleLogIn = useCallback(
        async (e) => {
            e.preventDefault()
            if (loading) return

            setUsernameError(null)
            setPasswordError(null)

            setLoading(true)

            try {
                if (!username.trim()) {
                    setUsernameError('Username Required')
                    setLoading(false)
                    return
                }
                if (!password.trim()) {
                    setPasswordError('Password Required')
                    setLoading(false)
                    return
                }
                // Verify user exists
                const { data: userRecord, error: fetchError } = await supabase
                    .from('Users')
                    .select('UUID')
                    .eq('username', username)
                    .single()

                if (fetchError || !userRecord) {
                    setUsernameError('Username Not Found')
                    setLoading(false)
                    return
                }

                const result = await signInUser(username, password)
                if (!result.success) {
                    setPasswordError('Invalid Password')
                    setLoading(false)
                    return
                }

                const loggedInUser = result.data.user
                if (loggedInUser) {
                    // Log login event, use existing username state
                    const { error: insertError } = await supabase
                        .from('login_events')
                        .insert([
                            {
                                user_id: loggedInUser.id,
                                timestamp: new Date().toISOString(),
                                email: loggedInUser.email,
                                username: username, // already in state
                            },
                        ])

                    if (insertError)
                        console.error(
                            'Failed to log event:',
                            insertError.message
                        )
                }
            } catch (err) {
                console.error(err)
                setPasswordError('Login Failed')
            } finally {
                setLoading(false)
            }
        },
        [username, password, loading, signInUser]
    )

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className='w-full flex flex-col items-center justify-center pt-20 pb-8 sm:items-center sm:justify-center h-[calc(100vh-100px)]'>
            <div className='w-full max-w-sm mx-4 p-6 shadow-[0_0_10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center rounded-md sm:max-w-lg sm:p-12'>
                <div className='text-2xl font-mont font-medium text-mebablue-dark mb-3'>
                    Login
                </div>
                <div className={styles.underline}></div>
                <form
                    onSubmit={handleLogIn}
                    noValidate
                    className='flex flex-col gap-4 mt-4 w-full'
                >
                    <div
                        className={`flex border border-neutral-300 rounded-md h-12 w-full focus-within:border-mebagold ${
                            usernameError
                                ? 'border-red-500'
                                : 'border-neutral-300'
                        }`}
                    >
                        <input
                            type='text'
                            placeholder=' Enter username'
                            required
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value)
                                if (usernameError) setUsernameError(null)
                            }}
                            className={styles.input}
                            autoComplete='off'
                        />
                    </div>
                    <div
                        className={`w-full h-12 flex flex-row border border-neutral-300 rounded-md items-center focus-within:border-mebagold ${
                            passwordError
                                ? 'border-red-500'
                                : 'border-neutral-300'
                        }`}
                    >
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='      Enter password'
                            required
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (passwordError) setPasswordError(null)
                            }}
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

                    <div className='pt-4'>
                        <button
                            type='submit'
                            className='bg-mebablue-dark rounded-md px-4 py-2 text-lg text-white w-full cursor-pointer font-mont hover:bg-mebablue-light'
                        >
                            Login
                        </button>
                    </div>
                </form>
                {(usernameError || passwordError) && (
                    <p className='text-red-400 text-lg font-mont font-medium pt-2'>
                        {usernameError || passwordError}
                    </p>
                )}
                {loading && (
                    <p className='font-mont text-lg font-medium pt-2 text-mebablue-dark'>
                        Signing in…
                    </p>
                )}
            </div>
        </div>
    )
}

export default Login
