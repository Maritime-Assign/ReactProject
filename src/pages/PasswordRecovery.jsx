import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Login.module.css'
import supabase from '../supabaseClient'

function PasswordRecovery() {
    const [text, setText] = useState('')

    const handleChange = (event) => {
        setText(event.target.value)
    }

    const handlePasswordReset = async() => {
        if (!text) {
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(text, {
            redirectTo: `${ window.location.origin }/set-password`,
        })

        if (error) {
            console.error('Error sending password reset email:', error.message);
        }
    }

    return (
        <div className='flex w-full h-[calc(100vh-100px)] justify-center items-center'>
            <div className='w-fit flex flex-col items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.1)] p-12'>
                <div className='text-2xl font-mont font-medium text-mebablue-dark mb-3'>
                    Forgot Password?
                </div>
                <div className='w-[400px] h-[5px] rounded-full bg-mebablue-dark'></div>

                <div className='flex flex-col gap-4 mt-4'>
                    <div className='flex border border-neutral-300 rounded-md h-12 w-100 focus-within:border-amber-300 mb-2'>
                        <input
                            type='text'
                            value={text}
                            onChange={handleChange}
                            placeholder=' Enter your email address'
                            className={styles.input}
                        />
                    </div>
                </div>
                <div className='py-2'>
                    <button className='bg-mebablue-light rounded-md px-4 py-2 w-100'>
                        <Link to='/login'>
                            <span className='text-lg font-mont text-white'>
                                Back to Login
                            </span>
                        </Link>
                    </button>
                </div>
                <div className=''>
                    <button className='bg-mebablue-dark rounded-md px-4 py-2 text-lg text-white w-100 cursor-pointer font-mont'
                            onClick={handlePasswordReset}>
                        Send Recovery Email
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PasswordRecovery
