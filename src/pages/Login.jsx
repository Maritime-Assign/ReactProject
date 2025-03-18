import React, { useState, useEffect } from 'react'
import './Login.css'
import Cookies from 'js-cookie'
import showPasswordIcon from '../assets/show_password_icon.svg'
import { Routes, Route, Link } from 'react-router-dom'

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

    const handleSubmit = () => {
        console.log('Email:', email)
        console.log('Password:', password)
        if (rememberMe) {
            Cookies.set('email', email, { expires: 7 })
        } else {
            console.log('Email cookie removed')
            Cookies.remove('email')
        }
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div>
            <h3>Marine Engineers Beneficial Association (MEBA)</h3>
            <div className='container'>
                <div className='header'>
                    <div className='text'>login</div>
                    <div className='underline'></div>
                </div>
                <div className='input-box'>
                    <div className='input'>
                        <input
                            type='email'
                            placeholder=' Enter your email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className='input'>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder=' Enter your password'
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <img
                            className='showPasswordIcon'
                            src={showPasswordIcon}
                            alt='show password icon'
                            onClick={toggleShowPassword}
                        />
                    </div>
                </div>
                <div className='remember-me'>
                    <input
                        type='checkbox'
                        id='checkbox'
                        cursor='pointer'
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor='checkbox'>Remember Me</label>
                </div>
                <div className='forgot-password'>
                    <Link to='/recovery'>
                        <span>RECOVER PASSWORD</span>
                    </Link>
                </div>
                <div className='submit-container'>
                    <div className='submit' onClick={handleSubmit}>
                        Login
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
