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
                    return
                }
                if (!password.trim()) {
                    setPasswordError('Password Required')
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
                    return
                }

                const result = await signInUser(username, password)
                if (!result.success) {
                    setPasswordError('Invalid Password')
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
        <div className='w-full h-[calc(100vh-100px)] flex items-center justify-center'>
            <div className='w-fit p-12 shadow-[0_0_10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center rounded-md'>
                <div className='text-2xl font-mont font-medium text-mebablue-dark mb-3'>
                    Login
                </div>
                <div className={styles.underline}></div>
                <div className='flex flex-col gap-4 mt-4'>
                    <div
                        className={`flex border border-neutral-300 rounded-md h-12 w-100 focus-within:border-mebagold ${
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
                        className={`w-100 h-12 flex flex-row border border-neutral-300 rounded-md items-center focus-within:border-mebagold ${
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
                </div>
                {/*  Temporarily hide forgot password button, no longer works with usernames  */}
                {/* <div className='pt-4'>
                    <Link to='/password-recovery'>
                        <button className='bg-mebablue-light rounded-md px-4 py-2 w-100 cursor-pointer'>
                            <span className='text-lg font-mont text-white'>
                                Forgot Password?
                            </span>
                        </button>
                    </Link>
                </div> */}

                <div className='pt-4'>
                    <button
                        className='bg-mebablue-dark rounded-md px-4 py-2 text-lg text-white w-100 cursor-pointer font-mont hover:bg-mebablue-light'
                        onClick={handleLogIn}
                    >
                        Login
                    </button>
                </div>
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
