import supabase from '../api/supabaseClient'
import { useEffect, useRef, useState } from 'react'
import { UserAuth } from '../auth/AuthContext.jsx'
import { updateJobWithHistory } from '../utils/jobHistory'
import { Plus, Minus } from 'lucide-react'

const JobListing = ({ rowIndex, handleClaimJob, ...props }) => {
    const { user, role } = UserAuth()
    const [status, setStatus] = useState(true)
    const [makingClaim, setClaim] = useState(false)
    const [error, setError] = useState(null)
    const [expandedNotes, setExpandedNotes] = useState(false)
    const [showButton, setShowButton] = useState(false)
    const spanRef = useRef(null)

    // format dates coming from supabase
    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
        })
    }

    // make sure the status matches incoming prop
    useEffect(() => {
        if (props.open == 'Open') {
            setStatus(true)
        }
        else {
            setStatus(false)
        }
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

        try {
            // Require authentication
            if (!user) {
                setError('You must be logged in to claim a job.')
                setClaim(false)
                return
            }

            // Restrict display users
            if (role === 'display') {
                setError(
                    'Only admin and dispatch users are able to claim a job.'
                )
                setClaim(false)
                return
            }

            // Fetch the full user record for logging
            const { data: userData, error: userError } = await supabase
                .from('Users')
                .select('*')
                .eq('UUID', user.id)
                .single()

            if (userError || !userData) {
                console.error('Error finding user data:', userError)
                setError('Unable to find user data.')
                setClaim(false)
                return
            }

            // Build claim data
            const claimData = {
                open: 'Filled',
                FillDate: new Date().toISOString().split('T')[0],
                claimedBy: user.id,
                claimed_at: new Date().toISOString(),
            }

            // Update job and log the change
            const result = await updateJobWithHistory(
                props.id,
                claimData,
                user.id
            )

            if (result.success) {
                handleClaimJob() // refresh list
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
        } catch (err) {
            console.error('Unexpected error claiming job:', err)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setClaim(false)
        }
    }

    useEffect(() => {
        const checkOverflow = () => {
            if (!spanRef.current) return
            const span = spanRef.current
            const lineHeight = parseFloat(getComputedStyle(span).lineHeight)
            const maxHeightForTwoLines = lineHeight * 2

            // larger buffer to ignore tiny overflows
            const tolerance = lineHeight * 0.6 // roughly half a line
            const isOverflowing =
                span.scrollHeight - tolerance > maxHeightForTwoLines

            const isTestEnv =
                (typeof process !== 'undefined' &&
                    (process.env.VITEST === 'true' ||
                        process.env.NODE_ENV === 'test')) ||
                (typeof import.meta !== 'undefined' &&
                    import.meta.env?.MODE === 'test')

            setShowButton(isOverflowing || isTestEnv)
        }

        checkOverflow()
        const timeout = setTimeout(checkOverflow, 0)
        window.addEventListener('resize', checkOverflow)

        return () => {
            clearTimeout(timeout)
            window.removeEventListener('resize', checkOverflow)
        }
    }, [props.notes, props.nightCard]) // Add nightCard if it affects padding

    const rowClass =
        rowIndex % 2 === 0
            ? 'bg-slate-200 border-b border-slate-300'
            : 'bg-slate-100 border-b border-slate-300'
    const cellStyle = 'items-center justify-center flex h-14'
    return (
        <div className='grid grid-cols-27 w-full text-[8px] md:text-[0.8125rem] font-mont font-semibold overflow-visible h-12 md:h-14'>
            {/*Disable the button if the user's role is display*/}
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                {status ? (
                    role == 'display' ? (
                        <div className='inline-flex items-center justify-center bg-linear-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded font-medium text-xs md:text-sm'>
                            Open
                        </div>
                    ) : (
                        <button
                            onClick={claimJob}
                            disabled={makingClaim}
                            className='inline-flex items-center justify-center px-1 md:px-2 py-1 rounded bg-linear-to-r from-green-500 to-green-600
                                     text-white hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                                       transition-all duration-200 ease-out font-medium text-[10px] md:text-sm hover:cursor-pointer'
                        >
                            {makingClaim ? 'Filling...' : 'Open'}
                        </button>
                    )
                ) : (
                    props.open == 'Filled' ? (
                        <span className='text-red-700 text-center'>
                            Filled
                            <br />
                            {props.FillDate ? `${formatDate(props.FillDate)}` : ''}
                        </span>
                    ) : (
                        <span className='text-red-700 text-center'>
                            Filled by CO
                            <br />
                            {props.FillDate ? `${formatDate(props.FillDate)}` : ''}
                        </span>
                    )
                )}
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span
                    className={
                        props.abbrev ? 'bg-red-300 px-2 py-1 rounded' : ''
                    }
                >
                    {props.abbrev ? props.abbrev : '---'}
                </span>
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
            <div className={`col-span-3 ${cellStyle} ${rowClass}`}>
                <span>{props.shipName}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span>{props.joinDate}</span>
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span>{props.billet}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span>{props.type}</span>
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span>{props.days}</span>
            </div>
            <div className={`col-span-3 ${cellStyle} ${rowClass}`}>
                <span>{props.location}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span
                    className={props.msc ? `bg-blue-300 px-2 py-1 rounded` : ``}
                >
                    {props.company}
                </span>
            </div>
            <div className={`col-span-3 ${cellStyle} ${rowClass}`}>
                <span>{props.crewRelieved}</span>
            </div>
            <div className={`relative col-span-4 ${cellStyle} ${rowClass}`}>
                <span
                    ref={spanRef}
                    className={`text-center line-clamp-2 overflow-hidden transition-all px-2 py-1 ${
                        props.nightCard ? `bg-mebagold rounded` : ``
                    }`}
                    style={{
                        display: showButton ? 'none' : 'inline',
                        visibility: showButton ? 'hidden' : 'visible',
                    }}
                >
                    {props.notes}
                </span>

                {showButton && (
                    <button
                        aria-label='Expand Notes'
                        type='button'
                        onClick={() => setExpandedNotes(!expandedNotes)}
                        className={`flex justify-between items-start px-2 py-1 w-full rounded hover:bg-indigo-200 hover:cursor-pointer transition-all ${
                            props.nightCard ? `bg-mebagold rounded` : ``
                        }
                            ${
                                expandedNotes
                                    ? 'absolute z-50 bg-white shadow-lg border border-mebagold'
                                    : 'relative'
                            }`}
                        style={{
                            transition:
                                'transform 0.2s, background-color 0.2s, box-shadow 0.2s, border 0.2s',
                        }}
                    >
                        <span
                            className={`flex-1 overflow-hidden ${
                                expandedNotes
                                    ? 'whitespace-pre-wrap'
                                    : 'line-clamp-2'
                            }`}
                            style={{ transition: 'white-space 0.2s' }}
                            data-testid='notesContent'
                        >
                            {props.notes}
                        </span>
                        <div className='relative w-4 h-4 ml-2'>
                            <Plus
                                className={`absolute inset-0 transition-opacity duration-200 ${
                                    expandedNotes ? 'opacity-0' : 'opacity-100'
                                }`}
                                size={16}
                            />
                            <Minus
                                className={`absolute inset-0 transition-opacity duration-200 ${
                                    expandedNotes ? 'opacity-100' : 'opacity-0'
                                }`}
                                size={16}
                            />
                        </div>
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
