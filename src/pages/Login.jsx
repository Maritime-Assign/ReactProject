import React, { useState, useEffect } from 'react'
import styles from './Login.module.css'
import Cookies from 'js-cookie'
import showPasswordIcon from '../assets/show_password_icon.svg'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'
import { UserAuth } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { signInUser } = UserAuth();
    const navigate = useNavigate();
    
    const handleLogIn = async (e) => {
        e.preventDefault();
        setLoading(true)
        const { session, error } = await signInUser(email, password); // Use your signIn function
    
        if (error) {
          setError(error); // Set the error message if sign-in fails
          setLoading(false);
    
          // Set a timeout to clear the error message after a specific duration (e.g., 3 seconds)
          setTimeout(() => {
            setError("");
          }, 3000); // 3000 milliseconds = 3 seconds
        } else {
          // Redirect or perform any necessary actions after successful sign-in
          navigate("/dashboard");
        }
    
        if (session) {
          closeModal();
          setError(""); // Reset the error when there's a session
        }
      };

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
                            placeholder=' Enter your password'
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
                <div className=''>
                    <button className='bg-mebablue-light rounded-md px-4 py-2 w-100'>
                        <Link to='/recovery'>
                            <span className='text-lg font-mont text-white'>
                                Forgot Password?
                            </span>
                        </Link>
                    </button>
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
