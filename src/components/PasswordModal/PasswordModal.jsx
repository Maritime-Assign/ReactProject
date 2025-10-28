import { useState } from 'react'
import './PasswordModal.css'
import supabase from '../../api/supabaseClient'

const PasswordModal = ({ isOpen, onClose, onSubmit }) => {
    const [adminPassword, setAdminPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (adminPassword.trim() === '') {
            setErrorMessage('Please enter your password.')
            return
        }

        setIsVerifying(true)

        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            setErrorMessage('Failed to fetch user')
            setIsVerifying(false)
            return
        }

        const { data, error: passwordError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: adminPassword,
        })

        if (passwordError) {
            setErrorMessage('Invalid password.')
            setIsVerifying(false)
            return
        }

        const isValid = await onSubmit(adminPassword)
        if (!isValid) {
            setErrorMessage('Invalid password.')
        }

        setIsVerifying(false)
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
              disabled={isVerifying}
            />
            {errorMessage && <p className='error-message'>{errorMessage}</p>}
            <button type='submit' disabled={isVerifying}>Submit</button>
            <button type='button' onClick={onClose} disabled={isVerifying}>Cancel</button>
          </form>
        </div>
      </div>
    )
}

export default PasswordModal
