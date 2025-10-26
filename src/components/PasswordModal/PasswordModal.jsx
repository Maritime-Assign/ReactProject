import { useState } from 'react'
import './PasswordModal.css'

const PasswordModal = ({ isOpen, onClose, onSubmit }) => {
    const [adminPassword, setAdminPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (adminPassword.trim() === '') {
            setErrorMessage('Please enter your password.')
            return
        }

        // Send password to parent component to verify
        const isValid = await onSubmit(adminPassword)
        if (!isValid) {
            setErrorMessage('Invalid password.');
        }
    }

    if (!isOpen) {
        return null
    }

    return (
      <div className='modal-overlay'>
        <div className='modal-content'>
          <h2>Re-enter Your Password</h2>
          <form onSubmit={handleSubmit}>
            <input
              type='password'
              placeholder='Your password'
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
            {errorMessage && <p className='error-message'>{errorMessage}</p>}
            <button type='submit'>Submit</button>
            <button type='button' onClick={onClose}>Cancel</button>
          </form>
        </div>
      </div>
    )
}

export default PasswordModal
