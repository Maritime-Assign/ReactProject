import React from 'react'
import { Link } from 'react-router-dom'
import { MdLogin, MdTableRows } from 'react-icons/md'
import { LiaUserLockSolid, LiaUsersCogSolid } from 'react-icons/lia'
import { AiOutlineHistory } from 'react-icons/ai'
import {
    RiListSettingsLine,
    RiListView,
    RiPlayListAddLine,
} from 'react-icons/ri'
/*
Managers will lose their access to manager user's permissions, meaning they can't change a person's role, but still retain the ability to manage the dashboard and jobs 
*/
const DashboardDispatch = () => {
    const dashButton =  
        'group w-90 h-50 flex flex-col items-center justify-center gap-2 rounded-md bg-mebablue-dark hover:bg-mebablue-light transition-colors duration-300 ease-in-out overflow-hidden cursor-pointer';

    return (
        <div className='w-full h-[calc(100vh-80px)] flex items-center justify-center overflow-y-hidden mx-auto'>
            <div className='w-fit flex flex-col gap-4 p-12 shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-md'>
                <div className='w-full text-center'>
                    <span className='text-3xl font-medium font-mont text-mebablue-dark'>
                        Dispatch Dashboard
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
                        <span className='mb-1'>View Job Board</span>
                        <Link to='/fsb'>
                            <button className='cursor-pointer'>
                                <RiListView className='w-[100px] h-[100px]' />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardDispatch
