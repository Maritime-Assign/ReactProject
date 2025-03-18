import React, { useState } from 'react'
import './PasswordRecovery.css'
import { Link } from 'react-router-dom'

function PasswordRecovery() {
    const [text, setText] = useState('')

    const handleChange = (event) => {
        setText(event.target.value) // Update state with the input value
    }

    return (
        <div>
            <div className='passwordContainer'>
                <h3>Forgot Password?</h3>
                <div className='content'>
                    <label htmlFor='inputField'>
                        Enter Your E-mail address:{' '}
                    </label>
                    <input
                        type='text'
                        id='inputField'
                        value={text}
                        onChange={handleChange}
                        placeholder='Type your email here'
                    />
                    <button className='recoveryButton'>
                        Send recovery email
                    </button>

                    <Link to='/login'>
                        <button className='backoutButton'>
                            BACK TO LOGIN PAGE
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default PasswordRecovery
