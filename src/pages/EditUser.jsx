import supabaseAdmin from '../api/supabaseAdmin'
import supabase from '../api/supabaseClient'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'

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
        abbreviation: state.abbreviation,
    })

    const [abbrevError, setAbbrevError] = useState('')
    
    async function updateUser() {

        // Checks if user requires super admin perms to edit
        if (!(await isAdminEditable())) {
            alert('This user can only be edited by a super admin')
            return
        }

        const updatedUser = {
            username: user.username,
            role: user.role,
            abbreviation: user.abbreviation,
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

    const isSuperAdmin = async () => {
        // Get currently logged in user from auth table
        const { data: { user }, error } = await supabase
            .auth
            .getUser()

        // Get logged in user's entry from Users table and fetch
        // superAdmin value
        const { data: loggedUser } =  await supabase
            .from('Users')
            .select('UUID, superAdmin')
            .eq('UUID', user.id)

        // Array object is returned, user is accessed at index 0
        return loggedUser[0].superAdmin
    }

    const isAdminEditable = async () => {
        // Compares selected user's initial role
        if (state.role === 'admin') {
            // If logged in user is not admin then early return
            if (!(await isSuperAdmin())) {
                return false
            }
        }

        return true
    }

    const handleAdminPasswordSubmit = async () => {
        // Checks if user requires super admin perms to edit
        if (!(await isAdminEditable())) {
            alert('This user can only be edited by a super admin')
            return
        }

        const { data, error } = await supabaseAdmin
            .auth
            .admin
            .updateUserById(
                state.UUID,
                { password: user.password }
            )
        
        if (error) {
            alert(error.message)
            return
        }

        updateUser()
    }

    const deleteUser = async () => {
        const confirmation = confirm('Delete user?')

        if (confirmation) {
            // Early return if user is not a super admin
            // Applies only to admin deletion
            if (!(await isAdminEditable())) {
                alert('This user can only be deleted by a super admin')
                return
            }

            const { data: authData, error: authError } = await supabaseAdmin
                .auth
                .admin
                .deleteUser(state.UUID)

            if (authError) {
                alert(authError.message)
                return
            }
            // Delete entry in Users table as well
            else {
                const { data: usersData, error: usersError } = await supabase
                    .from('Users')
                    .delete()
                    .eq('UUID', state.UUID)
                    .select()

                    if (usersError) {
                        alert(usersError.message)
                    }
            }

            navigate('/users-roles')
            alert('User deleted successfully')
        }
    }

    //Enables the use of a pending state to represent a form being processed
    const { processing } = useFormStatus()

    //Functions to handle edits of a user's info
    function updateUsername(e) {
        setUser({ ...user, username: e.target.value })
        console.log(state.role)
    }

    function updatePassword(e) {
        setUser({ ...user, password: e.target.value })
    }

    function updateRole(e) {
        setUser({ ...user, role: e.target.value })
    }

    function updateAbbrev(e) {
        const raw = e.target.value.toUpperCase()
    setUser(u => ({ ...u, abbreviation: raw }))
    setAbbrevError(raw.length === 3 ? '' : 'Must be exactly 3 letters')
    }


    //Does nothing for now; Implement Supabase functionality when user data format is finalized
    function submitEdits(e) {
        //Show a message to represent that the edits were submitted; REMOVE WHEN ACTUAL IMPLEMENTATION IS DONE
        e.preventDefault()

        // Update admin password, updates user sequentially
        // then early returns
        if (user.password) {
            handleAdminPasswordSubmit();
            return
        }

        if (user.abbreviation.length !== 3) {
            alert('Abbreviation must be exactly 3 letters')
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
                <div className='grid grid-cols-[320px_1fr] grid-rows-2 p-4 gap-2'>
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
                    <div>
                        <span className='text-xl text-[#242762] text-semibold'>
                            Abbreviation
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <input
                                type='text'
                                placeholder='Enter 3 character abbreviation here'
                                value={user.abbreviation}
                                onChange={updateAbbrev}
                                className='w-[300px] h-[48px] text-center bg-neutral-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                            {abbrevError && (
                                <p className='text-sm text-red-500'>{abbrevError}</p>
                            )}
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
                    <button 
                        className='px-4 h-12 bg-mebablue-light rounded-md text-white hover:bg-mebablue-hover'
                        type='button'
                        onClick={deleteUser}
                    >
                        Delete User
                    </button>
                </div>
            </form>
        </div>
    )
}
export default EditUser
