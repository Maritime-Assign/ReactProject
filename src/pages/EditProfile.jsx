import supabase from '../api/supabaseClient';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Link, useNavigate, useLocation } from "react-router-dom";

const EditProfile = () => {
    const { state } = useLocation()
    const navigate = useNavigate()

    //Returns user back to previous page if the data wasn't passed properly
    if (!state) {
        navigate('/userprofile')
        return null
    }

    //Initialize the user data from data passed from UserProfile page
    const [userData, setUserData] = useState({
        uuid: state.UUID,
        fname: state.first_name,
        lname: state.last_name,
        email: state.email,
        pnum: state.phone_number
    })

    //Functions that allow for the user to input new values
    function updateFirstName(e) {
        setUserData({ ...userData, fname: e.target.value })
    }

    function updateLastName(e) {
        setUserData({ ...userData, lname: e.target.value })
    }

    function updateEmail(e) {
        setUserData({ ...userData, email: e.target.value })
    }

    function updatePhoneNumber(e) {
        setUserData({ ...userData, pnum: e.target.value })
    }

    const { processing } = useFormStatus()

    async function updateProfile(e) {
        e.preventDefault()

        //Updates the user's info within the Users table
        var {error} = await supabase.from("Users").update({
                                                            first_name: userData.fname, 
                                                            last_name: userData.lname, 
                                                            email: userData.email, 
                                                            phone_number: userData.pnum}  
                                                         ).eq('UUID', userData.uuid);
        
        //Display an error if the server could not update the Users table
        if (error) {
            console.log('Error updating user data', error);
            return
        }

        //Updates the user's info within the Auth Users tables
        var {data, error} = await supabase.auth.updateUser({data: { 
            last_name: userData.lname,
            first_name: userData.fname,
            phone_number: userData.pnum
        }})

        //Display an error if the server could not update the Auth Users table
        if (error) {
           console.log('Error updating auth user data', error);
           return
        }

        //Display a message to user that a verification email has been sent to the new email
        if (state.email != userData.email) {
            var {data, error} = await supabase.auth.updateUser({email: userData.email});
            alert('User email has been changed. Please go to the inbox of your updated email address to verify the change.')
        }
        navigate('/userprofile')
    }
    return (
        <div className='flex justify-center flex-col py-4 mb-4 w-[1280px] m-auto'>
            <span className='p-4 text-3xl text-[#242762] font-bold'>
                Edit Profile
            </span>
            <form onSubmit={updateProfile}>
                <div className='grid grid-cols-3 p-4 gap-2'>
                    <div>
                        <span className='text-2xl text-[#242762] text-semibold'>
                            First Name
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <input
                                type='text'
                                placeholder='Enter name here'
                                value={userData.fname}
                                onChange={updateFirstName}
                                className='w-[300px] h-[48px] px-2 bg-neutral-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                    <div>
                        <span className='text-2xl text-[#242762] text-semibold'>
                            Last Name
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <input
                                type='text'
                                placeholder='Enter name here'
                                value={userData.lname}
                                onChange={updateLastName}
                                className='w-[300px] h-[48px] px-2 bg-neutral-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-3 p-4 gap-2'>
                    <div>
                        <span className='text-2xl text-[#242762] text-semibold'>
                            Email
                        </span>
                        <div className='flex content-center py-3'>
                            <input
                                type='text'
                                placeholder='Enter email here'
                                value={userData.email}
                                onChange={updateEmail}
                                title='Valid email address. Example: user@example.com'
                                pattern='[a-zA-Z0-9._%+\-]{2,}@[a-zA-Z0-9.\-]{2,}.[a-zA-Z]{2,}'
                                className='w-[300px] h-[48px] px-2 bg-neutral-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                    <div>
                        <span className='text-2xl text-[#242762] text-semibold'>
                            Phone Number
                        </span>
                        <div className='flex content-center py-3'>
                            <input
                                type='text'
                                placeholder='Enter phone number here'
                                value={userData.pnum}
                                onChange={updatePhoneNumber}
                                title='10 digit phone number. Example: 123-456-7890'
                                pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}'
                                className='w-[300px] h-[48px] px-2 bg-neutral-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                </div>
                {/*Buttons to confirm or cancel the edits made to a user*/}
                <div className='flex flex-row gap-4 px-4'>
                    <Link to='/userprofile'>
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
    );
}
export default EditProfile;
