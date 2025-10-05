import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { supabase } from '../supabaseClient'

const EditUser = () => {
    //Convert the data of a user and make it editable
    const { state } = useLocation()
    const navigate = useNavigate()

    if (!state) {
        navigate('/users-roles') // fall back if no state is passed
        return null
    }

    const [user, setUser] = useState({
        fname: state.first_name,
        lname: state.last_name,
        email: state.email || '',
        role: state.role || '',
    })

    //Enables the use of a pending state to represent a form being processed
    const { processing } = useFormStatus()

    //Functions to handle edits of a user's info
    function updateFirstName(e) {
        setUser({ ...user, fname: e.target.value })
    }

    function updateLastName(e) {
        setUser({ ...user, lname: e.target.value })
    }

    function updateEmail(e) {
        setUser({ ...user, email: e.target.value })
    }

    function updateRole(e) {
        setUser({ ...user, role: e.target.value })
    }

    //Does nothing for now; Implement Supabase functionality when user data format is finalized
    async function submitEdits(e) {
        //Show a message to represent that the edits were submitted; REMOVE WHEN ACTUAL IMPLEMENTATION IS DONE
        e.preventDefault()

        const updatedUser = {
            first_name: user.fname,
            last_name: user.lname,
            email: user.email,
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

    /*
    async function testPost(append) {
        const updatedUser = {
            first_name: 'Unit' + String(append),
        }

        const { data, error } = await supabase
            .from('Users')
            .update(updatedUser)
            .eq('UUID', '5d87ebd2-896e-46f0-adf0-738b315f172f')
            .select()
        
        if (error) {
            console.log('Failed to update test user');
        }
        else {
            console.log('Test user updated successfully');
        }
    }

    testPost(Math.random());
    */

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
                            First Name
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <input
                                type='text'
                                placeholder='Enter name here'
                                value={user.fname}
                                onChange={updateFirstName}
                                className='w-[300px] h-[48px] text-center bg-neutral-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                    <div>
                        <span className='text-xl text-[#242762] text-semibold'>
                            Last Name
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <input
                                type='text'
                                placeholder='Enter name here'
                                value={user.lname}
                                onChange={updateLastName}
                                className='w-[300px] h-[48px] text-center bg-neutral-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                </div>

                {/*User's email and assigned role section*/}
                <div className='grid grid-flex-rows p-4 gap-2'>
                    <div>
                        <span className='text-xl text-[#242762] text-semibold'>
                            Email
                        </span>
                        <div className='flex content-center py-3'>
                            <input
                                type='text'
                                placeholder='Enter email here'
                                value={user.email}
                                onChange={updateEmail}
                                className='w-[300px] h-[48px] text-center bg-neutral-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
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
        </div>
    )
}
export default EditUser
