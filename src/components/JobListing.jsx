import React from 'react'
import { useEffect, useState } from 'react'
import { UserAuth } from '../context/AuthContext.jsx'
import { supabase } from '../supabaseClient'
import { updateJobWithHistory } from '../utils/jobHistory'

const JobListing = ({ rowIndex, handleClaimJob, ...props }) => {
    const { user } = UserAuth()
    const [status, setStatus] = useState(props.open)
    const [makingClaim, setClaim] = useState(false)
    const [error, setError] = useState(null)
    const [userRole, setUserRole] = useState(null)

    // make sure the status matches incoming prop
    useEffect(() => {
        setStatus(props.open)
    }, [props.open])

    // Auto-clear error message after 3 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null)
            }, 3000)
            
            return () => clearTimeout(timer)
        }
    }, [error])

    const getUserRole = async () => {
        const {data, error} = await supabase.from("Users").select().eq('UUID', user.id)
        if (error) {
            console.log('Error finding user data.', error)
            return
        }
        else {
            setUserRole(data.at(0).role)
            return
        }
    }
    // Claim a job function with history logging
    const claimJob = async () => {
        setClaim(true)
        setError(null)

        const {data, error} = await supabase.from("Users").select().eq('UUID', user.id)
        if (error) {
            console.log('Error finding user data.', error)
            return
        }
        // If claim is made when not logged in
        if (!user) {
            setError('You must be logged in to claim a job.')
            setClaim(false)
            return
        }
        // Check if a user has the right permissions to claim a job
        else if (userRole == 'display') {
            setError('Only admin and dispatch users are able to claim a job.')
            setClaim(false)
            return
        }
        try {
            // Prepare the updated job data for claiming
            const claimData = {
                open: false,
                FillDate: new Date().toISOString().split('T')[0],
                claimedBy: user.id,
                claimed_at: new Date().toISOString(),
            }

            // Use updateJobWithHistory to handle both the update and history logging
            const result = await updateJobWithHistory(props.id, claimData, user.id)

            if (result.success) {
                // Success - refresh the job list
                handleClaimJob()
            } else {
                console.error('Claim failed:', result.error)
                if (result.error?.message?.includes('No rows') || result.error?.code === 'PGRST116') {
                    setError('This job has already been claimed by someone else.')
                } else {
                    setError('Failed to claim the job. Please try again.')
                }
            }

        } catch (error) {
            console.error('Unexpected error claiming job:', error)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setClaim(false)
        }
    }

    const rowClass = rowIndex % 2 === 0 ? 'bg-[#D9E3FF]' : 'bg-gray-100'
    const cellStyle = 'px-1 py-3 items-center justify-center flex'
    getUserRole()
    return (
        <div className='grid grid-cols-20 w-full text-sm font-mont font-semibold h-fit'>
            {/*Disable the button if the user's role is display*/} 
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                {status ?
                ( userRole == 'display' ? 
                    <div
                        className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                        Open
                    </div>
                    : 
                    <button
                        onClick={claimJob}
                        disabled={makingClaim}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:outline-2 hover:outline-green-900 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
                    >
                        {makingClaim ? 'Opening...' : 'Open'}
                    </button>
                ) : (
                    <span className="text-red-700 text-m text-center">
                        Claimed {props.FillDate ? `on ${props.FillDate}` : ''}
                    </span>
                )}
            </div>

            {/* Job Data Grid */}            
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}><span>{props.region}</span></div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}><span>{props.hall}</span></div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}><span>{props.dateCalled}</span></div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}><span>{props.shipName}</span></div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}><span>{props.joinDate}</span></div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}><span>{props.billet}</span></div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}><span>{props.type}</span></div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}><span>{props.days}</span></div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}><span>{props.location}</span></div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}><span>{props.company}</span></div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}><span>{props.crewRelieved}</span></div>
            <div className={`col-span-3 text-left ${cellStyle} ${rowClass}`}><span>{props.notes}</span></div>

            {/*Error display */}
            {error && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md w-80">
                        <div className="flex items-start justify-between">
                            <p className="text-sm">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-500 hover:text-red-700 ml-2"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default JobListing