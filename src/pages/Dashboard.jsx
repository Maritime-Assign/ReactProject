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

const Dashboard = ({ allowedTiles }) => {
    const dashButton =
        'group w-30 h-25 sm:w-60 sm:h-50 flex flex-col items-center justify-center gap-2 rounded-md bg-mebablue-dark hover:bg-mebablue-light transition-colors duration-300 ease-in-out cursor-pointer'

    const iconStyle = 'w-[50px] h-[50px] sm:w-[100px] sm:h-[100px]'

    console.log('Allowed Tiles (admin):', allowedTiles)
    return (
        <div className='w-full h-[calc(100vh-80px)] flex items-center justify-center overflow-y-hidden mx-auto'>
            <div className='w-fit flex flex-col gap-3 sm:gap-4 p-6 sm:p-12 shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-md'>
                <div className='w-full text-center'>
                    <span className='text-xl sm:text-3xl font-medium font-mont text-mebablue-dark'>
                        Administrator Dashboard
                    </span>
                </div>
                <div className='w-full h-[2.5px] sm:h-[5px] rounded-full bg-mebablue-dark mb-2'></div>

                <div className='flex flex-row gap-3 sm:gap-4 font-mont text-white font-medium text-sm sm:text-2xl justify-center items-center'>
                    {allowedTiles.includes('manageJobs') && (
                        <Link
                            to='/manage-jobs'
                            className={
                                dashButton + 'inline-flex flex-col items-center'
                            }
                        >
                            <span className='mb-1'>Manage Jobs</span>
                            <RiListSettingsLine className={iconStyle} />
                        </Link>
                    )}

                    {allowedTiles.includes('addJobListing') && (
                        <Link
                            to='/addjob'
                            className={
                                dashButton +
                                ' inline-flex flex-col items-center'
                            }
                        >
                            <span className='mb-1'>Add Job Listing</span>
                            <RiPlayListAddLine className={iconStyle} />
                        </Link>
                    )}

                    {allowedTiles.includes('viewJobBoard') && (
                        <Link
                            to='/fsb'
                            className={
                                dashButton +
                                ' inline-flex flex-col items-center'
                            }
                        >
                            <span className='mb-1'>View Job Board</span>
                            <RiListView className={iconStyle} />
                        </Link>
                    )}
                </div>

                <div className='flex flex-row gap-3 sm:gap-4 font-mont text-white font-medium text-sm sm:text-2xl justify-center items-center'>
                    {allowedTiles.includes('viewChanges') && (
                        <Link
                            to='/history'
                            className={
                                dashButton +
                                ' inline-flex flex-col items-center'
                            }
                        >
                            <span className='mb-1'>View Changes</span>
                            <AiOutlineHistory className={iconStyle} />
                        </Link>
                    )}
                    {allowedTiles.includes('manageUsers') && (
                        <Link
                            to='/manageusers'
                            className={
                                dashButton +
                                ' inline-flex flex-col items-center'
                            }
                        >
                            <span className='mb-1'>Manage Users</span>
                            <LiaUsersCogSolid className={iconStyle} />
                        </Link>
                    )}
                    {allowedTiles.includes('addUser') && (
                        <Link
                            to='/add-user'
                            className={
                                dashButton +
                                ' inline-flex flex-col items-center'
                            }
                        >
                            <span className='mb-1'>Add User</span>
                            <LiaUserPlusSolid className={iconStyle} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
export default Dashboard
