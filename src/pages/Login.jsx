import React, { useState, useEffect } from 'react'
import './Login.css'
import Cookies from 'js-cookie'
import showPasswordIcon from '../assets/show_password_icon.svg'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    useEffect(() => {
        const savedEmail = Cookies.get('email')
        if (savedEmail) {
            setEmail(savedEmail)
            setRememberMe(true)
        }
    }, [])

    // * const handleSubmit = () => {
    //    console.log('Email:', email)
    //    console.log('Password:', password)
    //    if (rememberMe) {
    //        Cookies.set('email', email, { expires: 7 })
    //    } else {
    //        console.log('Email cookie removed')
    //        Cookies.remove('email')
    //    }
    //}

    const [err, setErr] = useState('')
    const [busy, setBusy] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async () => {
        setBusy(true)
        setErr('')

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        setBusy(false)
        if (error) {
            setErr(error.message)
            return
        }

        // redirect upon successful login
        navigate('/dashboard')
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className='w-full'>
            <div className='w-full flex flex-col items-center justify-center'>
                <div className='header'>
                    <div className='text-2xl font-fig font-medium text-mebablue-dark'>
                        Login
                    </div>
                    <div className='underline'></div>
                </div>
                <div className='flex flex-col gap-4'>
                    <div className='flex border border-neutral-300 rounded-md h-12 w-100 focus-within:border-mebagold'>
                        <input
                            type='email'
                            placeholder=' Enter your email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='input'
                        />
                    </div>
                    <div className='w-100 h-12 flex flex-row border border-neutral-300 rounded-md items-center focus-within:border-mebagold'>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder=' Enter your password'
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='input'
                        />
                        <img
                            className='mr-2 hover:cursor-pointer'
                            src={showPasswordIcon}
                            alt='show password icon'
                            onClick={toggleShowPassword}
                        />
                    </div>
                </div>
                <div className='flex flex-row w-full items-center justify-center py-2'>
                    <input
                        type='checkbox'
                        id='checkbox'
                        cursor='pointer'
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className='checkbox'
                    />
                    <span
                        htmlFor='checkbox'
                        className='font-fig text-mebablue-dark ml-2 py-2 font-medium text-lg'
                    >
                        Remember Me
                    </span>
                </div>
                <div className=''>
                    <button className='bg-mebablue-light rounded-md px-4 py-2 w-50'>
                        <Link to='/recovery'>
                            <span className='text-lg font-fig text-white'>
                                Recover Password
                            </span>
                        </Link>
                    </button>
                </div>

                <div className='py-2'>
                    <button
                        className='bg-mebablue-dark rounded-md px-4 py-2 text-lg text-white w-50 cursor-pointer'
                        onClick={handleSubmit}
                    >
                        Login
                    </button>
                </div>
                {err && (
                    <p style={{ color: 'red', textAlign: 'center' }}>{err}</p>
                )}
                {busy && <p style={{ textAlign: 'center' }}>Signing in…</p>}
            </div>
        </div>
    )
}

export default Login
