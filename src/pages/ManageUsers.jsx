// npm install @faker-js/faker
// needed to generate fake testing data

import React, { useState, useEffect } from 'react'
import { useContext } from 'react'
import styles from './ManageUsers.module.css'
import { FaEdit, FaUserPlus, FaUserMinus } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import supabase from '../api/supabaseClient'
import { IoArrowBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

const getAllUsers = async () => {
    const { data, error } = await supabase.from('Users').select('*')

    if (error) {
        console.log('Error fetching users:', error)
        return []
    }

    return data
}

// define functionality
const ManageUsers = () => {
    const [searchWord, setSearchWord] = useState('')
    const [users, setUsers] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchUsers = async () => {
            const supabaseUsers = await getAllUsers()
            setUsers(supabaseUsers)
        }

        fetchUsers()
    }, [])

    const filteredUsers = users.filter(
        (user) =>
            String(user.first_name || '')
                .toLowerCase()
                .includes(searchWord.toLowerCase()) ||
            String(user.role_id || '')
                .toLowerCase()
                .includes(searchWord.toLowerCase()) ||
            String(user.role || '')
                .toLowerCase()
                .includes(searchWord.toLowerCase())
    )

    const roleOrder = { admin: 0, dispatch: 1, display: 2 }

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const ra = roleOrder[String(a.role || '').toLowerCase()] ?? 99
        const rb = roleOrder[String(b.role || '').toLowerCase()] ?? 99
        if (ra !== rb) return ra - rb // Admin > Dispatch > Display

        // within the same role, sort alphabetically by first name, then username
        const nameA = String(a.first_name || '').toLowerCase()
        const nameB = String(b.first_name || '').toLowerCase()
        if (nameA !== nameB) return nameA.localeCompare(nameB)

        return String(a.username || '')
            .toLowerCase()
            .localeCompare(String(b.username || '').toLowerCase())
    })

    // good ole div block
    // structure of page below
    return (
        <div className='w-full pt-4 flex flex-col max-w-[1280px] mx-auto font-mont'>
            <div className='flex py-4 bg-mebablue-dark rounded-md w-full shadow-xl relative items-center'>
                <button
                    onClick={() => navigate(-1)} // navigate back one page
                    className='bg-mebagold shadow-md rounded-full p-2 absolute left-4 text-2xl text-center text-mebablue-dark hover:bg-yellow-300'
                >
                    <IoArrowBack className='w-6 h-6' />
                </button>

                <div className='grow text-center'>
                    <span className='text-white text-2xl font-medium'>
                        Manage Users
                    </span>
                </div>

                <div className='grow mx-4 relative overflow-visible'>
                    <input
                        type='text'
                        placeholder='Search by name or role...'
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                        className='w-full py-2 pl-4 pr-10 rounded-lg text-sm text-gray-700 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                </div>
                {/*Button that links to the add user page; Add link later*/}
                <Link className='flex gap-2 mr-4' to={'/add-user'}>
                    <button
                        className='bg-mebablue-light hover:bg-mebablue-hover p-2 rounded text-white'
                        title='Add User'
                    >
                        <FaUserPlus className='w-5 h-5' />
                    </button>
                </Link>
            </div>
            <div className=' bg-white rounded-lg shadow overflow-hidden mt-6'>
                <div className='grid grid-cols-[80px_180px_250px_320px_1fr] items-center px-4 py-2 bg-blue-50'>
                    <div className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'></div>
                    <div className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Role
                        <span
                            className='info-icon'
                            title='Roles: Admin, Dispatch, Display'
                        >
                            🔍
                        </span>
                    </div>
                    <div className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Abbreviation
                    </div>
                    <div className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Name
                    </div>
                    <div className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Username
                    </div>
                </div>
                {sortedUsers.map((user, index) => (
                    <div
                        className='grid grid-cols-[80px_180px_250px_320px_1fr] items-center px-4 py-2 bg-white border-b border-gray-200'
                        key={`user-${user.id}-${index}`}
                    >
                        <div className='px-6 py-4 text-sm text-gray-900 truncate'>
                            {/*Button that links to the edit user page*/}
                            <Link to={'/edituser'} state={user}>
                                <button
                                    className='text-mebablue-dark hover:text-mebablue-hover edit role'
                                    title='Edit Role'
                                >
                                    <FaEdit />
                                </button>
                            </Link>
                        </div>
                        <div className='px-6 py-4 text-sm text-gray-900 truncate'>
                            {user.role[0].toUpperCase() + user.role.slice(1)}
                        </div>
                        <div className='px-6 py-4 text-sm text-gray-900 truncate'>
                            {user.abbreviation}
                        </div>
                        <div className='px-6 py-4 text-sm text-gray-900 truncate'>
                            {user.first_name}
                        </div>
                        <div className='px-6 py-4 text-sm text-gray-900 truncate'>
                            {user.username}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ManageUsers
