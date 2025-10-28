import supabase from '../api/supabaseAdmin'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import PasswordModal from '../components/PasswordModal/PasswordModal.jsx'

const EditUser = () => {
    //Convert the data of a user and make it editable
    const { state } = useLocation()
    const navigate = useNavigate()

    if (!state) {
        navigate('/users-roles') // fall back if no state is passed
        return null
    }

    let [user, setUser] = useState({
        username: state.username,
        password: '',
        role: state.role || '',
    })

    
    async function updateUser() {
        const updatedUser = {
            username: user.username,
            role: user.role
        }

        const { data, error } = await supabase
            .from('Users')
            .update(updatedUser)
            .eq('UUID', state.UUID)
            .select()

        if (error) {
            alert('Failed to update user')
        }
        else {
            alert('User updated successfully')
        }
            
        console.log(state.UUID);
        console.log(user);
    }
    
    //State for the admin password modal
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleAdminPasswordSubmit = async (password) => {
        const { data, error } = await supabase
            .auth
            .admin
            .updateUserById(
                state.UUID,
                { password: user.password }
            )
        
        if (error) {
            alert('Failure to update user password')
        }
        
        setIsModalOpen(false)

        console.log(user)

        updateUser()

        return true
    }

    //Enables the use of a pending state to represent a form being processed
    const { processing } = useFormStatus()

    //Functions to handle edits of a user's info
    function updateUsername(e) {
        setUser({ ...user, username: e.target.value })
    }

    function updatePassword(e) {
        setUser({ ...user, password: e.target.value })
    }

    function updateRole(e) {
        setUser({ ...user, role: e.target.value })
    }


    //Does nothing for now; Implement Supabase functionality when user data format is finalized
    function submitEdits(e) {
        //Show a message to represent that the edits were submitted; REMOVE WHEN ACTUAL IMPLEMENTATION IS DONE
        e.preventDefault()

        if (user.password) {
            setIsModalOpen(true)
            return
        }

        updateUser()
    }

    return (
        <div className='flex justify-center flex-col py-4 mb-4 w-[1280px] m-auto'>
            <span className='p-4 text-2xl text-[#242762] font-medium'>
                Edit User
            </span>
            {/*Front end mockup for editing a user's info*/}
            <form onSubmit={submitEdits}>
                {/*User's name section*/}
                <div className='grid grid-cols-3 p-4 gap-2'>
                    <div>
                        <span className='text-xl text-[#242762] text-semibold'>
                            Username
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <input
                                type='text'
                                placeholder='Enter username here'
                                value={user.username}
                                onChange={updateUsername}
                                className='w-[300px] h-[48px] text-center bg-neutral-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                    <div>
                        <span className='text-xl text-[#242762] text-semibold'>
                            Password
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <input
                                type='text'
                                placeholder='Enter password here'
                                value={user.password}
                                onChange={updatePassword}
                                className='w-[300px] h-[48px] text-center bg-neutral-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                </div>

                {/*User's assigned role section*/}
                <div className='grid grid-flex-rows p-4 gap-2'>
                    {/*User role selection section*/}
                    <div>
                        <span className='py-2 text-[#242762] text-xl text-semibold'>
                            User Role
                        </span>
                        <label className='flex content-center gap-3 py-3'>
                            <select
                                className='border-1 bg-neutral-100'
                                name='newUserRole'
                                defaultValue={user.role}
                                onChange={updateRole}
                            >
                                <option value='admin'>Admin</option>
                                <option value='dispatch'>Dispatch</option>
                                <option value='display'>Display</option>
                            </select>
                        </label>
                    </div>
                </div>

                {/*Buttons to confirm or cancel the edits made to a user*/}
                <div className='flex flex-row gap-4 p-4'>
                    <Link to='/users-roles'>
                        <button className='px-4 h-12 bg-mebablue-light rounded-md text-white hover:bg-mebablue-hover'>
                            Cancel Changes
                        </button>
                    </Link>
                    <button
                        className='px-4 h-12 bg-mebablue-light rounded-md text-white hover:bg-mebablue-hover'
                        type='submit'
                        disabled={processing}
                    >
                        {/*The submit button label changes based on the status of the form submission*/}
                        {processing ? 'Submitting' : 'Submit Changes'}
                    </button>
                </div>
            </form>
            <PasswordModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleAdminPasswordSubmit}
            />
        </div>
    )
}
export default EditUser
