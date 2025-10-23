import supabase from '../api/supabaseClient'
import { useEffect, useRef, useState } from 'react'
import { UserAuth } from '../auth/AuthContext.jsx'
import { updateJobWithHistory } from '../utils/jobHistory'
import { ChevronDown } from 'lucide-react'

const JobListing = ({ rowIndex, handleClaimJob, ...props }) => {
    const { user, role } = UserAuth()
    const [status, setStatus] = useState(props.open)
    const [makingClaim, setClaim] = useState(false)
    const [error, setError] = useState(null)
    const [expandedNotes, setExpandedNotes] = useState(false)
    const [showButton, setShowButton] = useState(false)
    const spanRef = useRef(null)

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

    // Claim a job function with history logging
    const claimJob = async () => {
        setClaim(true)
        setError(null)

        const { data, error } = await supabase
            .from('Users')
            .select()
            .eq('UUID', user.id)
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
        else if (role == 'display') {
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
            const result = await updateJobWithHistory(
                props.id,
                claimData,
                user.id
            )

            if (result.success) {
                // Success - refresh the job list
                handleClaimJob()
            } else {
                console.error('Claim failed:', result.error)
                if (
                    result.error?.message?.includes('No rows') ||
                    result.error?.code === 'PGRST116'
                ) {
                    setError(
                        'This job has already been claimed by someone else.'
                    )
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

    useEffect(() => {
        const checkOverflow = () => {
            if (spanRef.current) {
                const isOverflowing =
                    spanRef.current.scrollWidth > spanRef.current.clientWidth
                setShowButton(isOverflowing)
                console.log('📏 OVERFLOW CHECK:', {
                    notes: `"${props.notes}"`,
                    scrollWidth: spanRef.current.scrollWidth,
                    clientWidth: spanRef.current.clientWidth,
                    isOverflowing,
                })
            }
        }

        // Immediate check + micro-delay for DOM stability
        checkOverflow()
        const timeout = setTimeout(checkOverflow, 0)

        // Re-check on window resize (handles dynamic layouts)
        window.addEventListener('resize', checkOverflow)
        return () => {
            clearTimeout(timeout)
            window.removeEventListener('resize', checkOverflow)
        }
    }, [props.notes])

    const rowClass = rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'
    const cellStyle = 'px-1 py-3 items-center justify-center flex'
    return (
        <div className='grid grid-cols-20 w-full text-[0.8125rem] font-mont font-semibold h-fit'>
            {/*Disable the button if the user's role is display*/}
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                {status ? (
                    role == 'display' ? (
                        <div className='inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded font-medium text-sm'>
                            Open
                        </div>
                    ) : (
                        <button
                            onClick={claimJob}
                            disabled={makingClaim}
                            className='inline-flex items-center justify-center px-2 py-1 rounded bg-gradient-to-r from-green-500 to-green-600
                                     text-white hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                                       transition-all duration-200 ease-out font-medium text-sm hover:cursor-pointer'
                        >
                            {makingClaim ? 'Filling...' : 'Open'}
                        </button>
                    )
                ) : (
                    <span className='text-red-700 text-m text-center'>
                        Claimed {props.FillDate ? `on ${props.FillDate}` : ''}
                    </span>
                )}
            </div>
            {/* Job Data Grid */}
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span>{props.region}</span>
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span>{props.hall}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span>{props.dateCalled}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span>{props.shipName}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span>{props.joinDate}</span>
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span>{props.billet}</span>
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span>{props.type}</span>
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span>{props.days}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span>{props.location}</span>
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span>{props.company}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span>{props.crewRelieved}</span>
            </div>
            <div className={`col-span-3 ${cellStyle} ${rowClass}`}>
                {/* HIDDEN MEASUREMENT SPAN - Always exists for ref */}
                <span
                    ref={spanRef}
                    className='mx-4 whitespace-nowrap text-ellipsis overflow-hidden transition-all'
                    style={{
                        display: showButton ? 'none' : 'inline',
                        visibility: showButton ? 'hidden' : 'visible',
                    }}
                >
                    {props.notes}
                </span>

                {/* VISIBLE BUTTON WHEN OVERFLOWS */}
                {showButton && (
                    <button
                        type='button'
                        onClick={() => setExpandedNotes(!expandedNotes)}
                        className='flex justify-between items-start w-full mx-4 p-2 rounded hover:bg-indigo-200 hover:opacity-90 hover:cursor-pointer transition-all'
                    >
                        <span
                            className={`flex-1 overflow-hidden transition-all ${
                                expandedNotes
                                    ? 'whitespace-normal'
                                    : 'whitespace-nowrap text-ellipsis'
                            }`}
                        >
                            {props.notes}
                        </span>

                        <ChevronDown
                            className={`ml-2 flex-shrink-0 transition-transform duration-200 ${
                                expandedNotes ? 'rotate-180' : 'rotate-0'
                            }`}
                            size={16}
                        />
                    </button>
                )}
            </div>
            {/*Error display */}
            {error && (
                <div className='fixed top-4 right-4 z-50'>
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md w-80'>
                        <div className='flex items-start justify-between'>
                            <p className='text-sm'>{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className='text-red-500 hover:text-red-700 ml-2'
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
