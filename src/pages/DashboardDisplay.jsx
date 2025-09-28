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
The viewer dashboard will only access to the dashboard button which allow dashboard viewing.
*/
const DashboardDisplay = () => {
    const dashButton =
        'group w-120 h-102 flex flex-col items-center justify-center gap-2 rounded-md bg-mebablue-dark hover:bg-mebablue-light transition-colors duration-300 ease-in-out overflow-hidden cursor-pointer';

    return (
        <div className='w-400 h-[calc(100vh-80px)] flex items-center justify-center overflow-y-hidden mx-auto'>
            <div className='w-fit flex flex-col gap-4 p-12 shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-md'>
                <div className='w-full text-center'>
                    <span className='text-3xl font-medium font-mont text-mebablue-dark'>
                        Display Dashboard
                    </span>
                </div>
                <div className='w-full h-[5px] rounded-full bg-mebablue-dark mb-2'></div>
                <div className='flex flex-row gap-4 font-mont text-white font-medium text-2xl justify-center items-center'>
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

export default DashboardDisplay
