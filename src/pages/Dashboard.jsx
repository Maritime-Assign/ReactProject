import React from 'react'
import { Link } from 'react-router-dom'
import { MdLogin, MdTableRows } from 'react-icons/md'
import {
    LiaUserLockSolid,
    LiaUserPlusSolid,
    LiaUsersCogSolid,
} from 'react-icons/lia'
import { AiOutlineHistory } from 'react-icons/ai'
import {
    RiListSettingsLine,
    RiListView,
    RiPlayListAddLine,
} from 'react-icons/ri'

const Dashboard = () => {
    const dashButton =
        'flex flex-col items-center p-5 rounded-md w-3xs bg-mebablue-dark hover:bg-mebablue-light transition-colors duration-300 ease-in-out cursor-pointer'

    return (
        <div className='w-full h-[calc(100vh-80px)] flex items-center justify-center overflow-y-hidden mx-auto'>
            <div className='w-fit flex flex-col gap-4 p-12 shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-md'>
                <div className='w-full text-center'>
                    <span className='text-3xl font-medium font-mont text-mebablue-dark'>
                        Administrator Dashboard
                    </span>
                </div>
                <div className='w-full h-[5px] rounded-full bg-mebablue-dark mb-2'></div>
                <div className='flex flex-row gap-4 font-mont text-white font-medium text-2xl justify-center items-center'>
                    <div className={dashButton}>
                        <span className='mb-1'>Manage Jobs</span>
                        <Link to='/board'>
                            <button className='cursor-pointer'>
                                <RiListSettingsLine className='w-[100px] h-[100px]' />
                            </button>
                        </Link>
                    </div>
                    <div className={dashButton}>
                        <span className='mb-1'>Add Job Listing</span>
                        <Link to='/addjob'>
                            <button className='cursor-pointer'>
                                <RiPlayListAddLine className='w-[100px] h-[100px]' />
                            </button>
                        </Link>
                    </div>
                    <div className={dashButton}>
                        <span className='mb-1'>View Job Board</span>
                        <Link to='/fsb'>
                            <button className='cursor-pointer'>
                                <RiListView className='w-[100px] h-[100px]' />
                            </button>
                        </Link>
                    </div>
                </div>
                <div className='flex flex-row gap-4 font-mont text-white font-medium text-2xl justify-center items-center'>
                    <div className={dashButton}>
                        <span className='mb-1'>View Changes</span>
                        <Link to='/dashboard'>
                            <button className='cursor-pointer'>
                                <AiOutlineHistory className='w-[100px] h-[100px]' />
                            </button>
                        </Link>
                    </div>
                    <div className={dashButton}>
                        <span className='mb-1'>Manage Users</span>
                        <Link to='/users-roles'>
                            <button className='cursor-pointer'>
                                <LiaUsersCogSolid className='w-[100px] h-[100px]' />
                            </button>
                        </Link>
                    </div>
                    <div className={dashButton}>
                        <span className='mb-1'>Add New User</span>
                        <Link to='/add-user'>
                            <button className='cursor-pointer'>
                                <LiaUserPlusSolid className='w-[100px] h-[100px]' />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
