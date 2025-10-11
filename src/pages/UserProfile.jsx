import { Link } from "react-router-dom"
import React, { useState, useEffect } from 'react'
import supabase from "../supabaseClient"

//Gets the user's data from the database
const GetUserData = async () => {
    const { data: { user }, error} = await supabase.auth.getUser()
    if (user) {
        const {data, error} = await supabase.from("Users").select().eq('UUID', user.id)
        if (error) {
            console.log('Error finding user data.', error)
            return []
        }
        else {
            return data.at(0);
        }
    }
    else {
        console.log('Error finding user id.', error)
        return [];
    }
}

const UserProfile = () => {
    const [user, setUser] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const FetchUserData = async () => {
            const userData = await GetUserData()
            setUser(userData)
            setLoading(false)
        }
        FetchUserData()
    }, [])
    
    var displayPhoneNum = user.phone_number;
    //Displays in the event that a user has no phone number tied to their profile
    if (user.phone_number == '') {
        displayPhoneNum = 'None'
    }

    //Displays a temporary loading screen to prevent the rendering of null values before data is retrieved 
    if (loading) {
        return (
            <div className='flex justify-center flex-col py-4 mb-4 w-[1280px] m-auto'>
                <span className='p-4 text-3xl text-[#242762] font-bold'>
                    Loading...
                </span>
            </div>
        );
    }
    else {
        return (
            <div className='flex justify-center flex-col py-4 mb-4 w-[1280px] m-auto'>
                <span className='p-4 text-3xl text-[#242762] font-bold'>
                    User Profile
                </span>
                <div className='grid grid-cols-3 p-4 gap-2'>
                    <div>
                        <span className='text-2xl text-[#242762] text-semibold'>
                            First Name
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <span className='w-[300px] h-[48px] text-xl'>
                                {user.first_name}
                            </span>
                        </div>
                    </div>
                    <div>
                        <span className='text-2xl text-[#242762] text-semibold'>
                            Last Name
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <span className='w-[300px] h-[48px] text-xl'>
                                {user.last_name}
                            </span>
                        </div>
                    </div>
                    <div>
                        <span className='text-2xl text-[#242762] text-semibold'>
                            Role
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <span className='w-[300px] h-[48px] text-xl'>
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-3 p-4 gap-2'>
                    <div>
                        <span className='text-2xl text-[#242762] text-semibold'>
                            Email
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <span className='w-[300px] h-[48px] text-xl'>
                                {user.email}
                            </span>
                        </div>
                    </div>
                    <div>
                        <span className='text-2xl text-[#242762] text-semibold'>
                            Phone Number
                        </span>
                        <div className='flex content-center py-3 gap-3'>
                            <span className='w-[300px] h-[48px] text-xl'>
                                {displayPhoneNum}
                            </span>
                        </div>
                    </div>
                </div>
                <Link to='/editprofile' className='px-4' state={user}>
                    <button className='px-4 h-12 bg-mebablue-light rounded-md text-white hover:bg-mebablue-hover'>
                        Edit Profile
                    </button>
                </Link>
            </div>
        );
    }
}

export default UserProfile;