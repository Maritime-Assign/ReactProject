import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'
import showPasswordIcon from '../assets/show_password_icon.svg'
import supabase from '../supabaseClient'

function SetPassword() {
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [passwordMatch, setPasswordMatch] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const toggleShowConfirm = () => {
        setShowConfirm(!showConfirm)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Validate passwords match
        if (password !== passwordMatch) {
            alert('Passwords do not match')
            return
        }

        // Update password
        const { error } = await supabase.auth.updateUser({
            password: password,
        })

        if (error) {
            alert('Error updating password: ' + error.message)
        } else {
            alert('Password updated successfully!')
            navigate('/login')
        }
        setLoading(false)
    }

    return (
        <div className='flex w-full h-[calc(100vh-100px)] justify-center items-center'>
            <div className='w-fit flex flex-col items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.1)] p-12'>
                <div className='text-2xl font-mont font-medium text-mebablue-dark mb-3'>
                    Create Password
                </div>
                <div className='w-[400px] h-[5px] rounded-full bg-mebablue-dark'></div>

                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-4 mt-4'>
                        <div className='flex flex-row border border-neutral-300 rounded-md h-12 w-100 focus-within:border-amber-300'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder=' Enter your password'
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                autoComplete='off'
                            />
                            <img
                                className='my-auto mr-2 hover:cursor-pointer h-5 w-5'
                                src={showPasswordIcon}
                                alt='show password icon'
                                onClick={toggleShowPassword}
                            />
                        </div>
                        <div className='flex flex-row border border-neutral-300 rounded-md h-12 w-100 focus-within:border-amber-300 mb-2'>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                placeholder='Confirm Password'
                                required
                                value={passwordMatch}
                                onChange={(e) =>
                                    setPasswordMatch(e.target.value)
                                }
                                className={styles.input}
                                autoComplete='off'
                            />
                            <img
                                className='my-auto mr-2 hover:cursor-pointer h-5 w-5'
                                src={showPasswordIcon}
                                alt='show password icon'
                                onClick={toggleShowConfirm}
                            />
                        </div>
                    </div>
                    <div className='pt-2'>
                        <button
                            type='submit'
                            disabled={loading}
                            className='bg-mebablue-dark rounded-md px-4 py-2 text-lg text-white w-100 cursor-pointer font-mont'
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SetPassword
