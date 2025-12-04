import supabase from '../api/supabaseClient'
import { useEffect, useRef, useState, useCallback } from 'react'
import { UserAuth } from '../auth/AuthContext.jsx'
import { updateJob } from '../utils/jobHistoryOptimized.js'
import { Plus, Minus } from 'lucide-react'

const JobListing = ({ rowIndex, handleClaimJob, isCompact, ...props }) => {
    const { user, role } = UserAuth()
    const [status, setStatus] = useState(true)
    const [makingClaim, setClaim] = useState(false)
    const [error, setError] = useState(null)

    // Remember which rows the user has expanded

    const [expandedMap, setExpandedMap] = useState(() => ({}))

    const isExpanded = !!expandedMap[props.id]
    const toggleExpanded = () => {
        setExpandedMap((prev) => ({ ...prev, [props.id]: !prev[props.id] }))
    }

    const textRef = useRef(null)
    const [isTruncated, setIsTruncated] = useState(false)

    useEffect(() => {
        const checkTruncation = () => {
            if (!textRef.current) return

            // Compare actual height vs 2 lines
            const lineHeight =
                parseFloat(getComputedStyle(textRef.current).lineHeight) || 20
            const maxHeight = lineHeight * 2 + 8

            setIsTruncated(textRef.current.scrollHeight > maxHeight)
        }

        checkTruncation()
        window.addEventListener('resize', checkTruncation)
        return () => window.removeEventListener('resize', checkTruncation)
    }, [props.notes]) // Only recheck when notes actually change

    // Show button if text is truncated AND user hasn't expanded it yet
    const showExpandButton = isTruncated
    const formatDate = (dateString) => {
        if (!dateString) return ''
        if (typeof dateString !== 'string') return ''

        // Parse YYYY-MM-DD directly without Date object
        const parts = dateString.split('-')
        if (parts.length !== 3) return ''

        const [year, month, day] = parts

        if (!year || !month || !day) return ''

        // Return MM/DD/YYYY format
        return `${month}/${day}/${year}`
    }

    // Format with 2-digit year (for FillDate)
    const formatDateShort = (dateString) => {
        if (!dateString) return ''
        if (typeof dateString !== 'string') return ''

        const parts = dateString.split('-')
        if (parts.length !== 3) return ''

        const [year, month, day] = parts

        if (!year || !month || !day) return ''

        return `${month}/${day}/${year.slice(-2)}` // MM/DD/YY
    }

    // make sure the status matches incoming prop
    useEffect(() => {
        if (props.open == 'Open') {
            setStatus(true)
        } else {
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

            // Get local date
            const today = new Date()
            const year = today.getFullYear()
            const month = String(today.getMonth() + 1).padStart(2, '0')
            const day = String(today.getDate()).padStart(2, '0')
            const localDate = `${year}-${month}-${day}`

            // Build claim data
            const claimData = {
                open: 'Filled',
                FillDate: localDate,
                claimedBy: user.id,
            }

            // Update job and log the change
            const result = await updateJob(props.id, claimData, user.id)

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

    const rowClass =
        rowIndex % 2 === 0
            ? 'bg-slate-200 border-b border-slate-300'
            : 'bg-slate-100 border-b border-slate-300'

    const textSize = isCompact
        ? 'text-[7px] md:text-[0.7rem] leading-none'
        : 'text-[8px] md:text-[0.8125rem]'

    const cellHeight = isCompact
        ? 'h-6 md:h-8' // Shorter for 21+ jobs
        : 'h-10 md:h-14' // Current height for ≤20 jobs

    const cellStyle = `items-center justify-center flex ${cellHeight}`

    const displayNotes = props.notes?.trim() || null

    return (
        <div
            className={`grid grid-cols-27 w-full ${textSize} font-mont font-semibold overflow-visible ${cellHeight}`}
        >
            {/*Disable the button if the user's role is display*/}
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                {status ? (
                    role == 'display' ? (
                        <div
                            className={`inline-flex items-center justify-center bg-linear-to-r from-green-500 to-green-600 text-white ${
                                isCompact ? 'px-1.5 py-1.5' : 'px-1.5 py-1.5'
                            } rounded font-medium ${textSize}`}
                        >
                            OPEN
                        </div>
                    ) : (
                        <button
                            data-testid='claim-button'
                            onClick={claimJob}
                            disabled={makingClaim}
                            className={`inline-flex items-center justify-center rounded bg-linear-to-r from-green-500 to-green-600
                                     text-white hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                                       transition-all duration-200 ease-out font-medium  hover:cursor-pointer ${
                                           isCompact
                                               ? 'px-1.5 py-1.5'
                                               : 'px-1.5 py-1.5'
                                       } ${textSize}`}
                        >
                            {makingClaim ? 'Filling...' : 'OPEN'}
                        </button>
                    )
                ) : props.open == 'Filled' ? (
                    <span className='text-red-700 text-center'>
                        Filled
                        <br />
                        {props.FillDate
                            ? `${formatDateShort(props.FillDate)}`
                            : ''}
                    </span>
                ) : (
                    <span className='text-red-700 text-center'>
                        Filled by CO
                        <br />
                        {props.FillDate
                            ? `${formatDateShort(props.FillDate)}`
                            : ''}
                    </span>
                )}
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span
                    className={
                        props.abbrev ? 'bg-red-300 px-1 py-1 rounded' : ''
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
                <span>{formatDate(props.dateCalled)}</span>
            </div>
            <div className={`col-span-3 ${cellStyle} ${rowClass}`}>
                <span className='truncate block'>{props.shipName}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span>{formatDate(props.joinDate)}</span>
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span>{props.billet}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span className='truncate'>{props.type}</span>
            </div>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                <span>{props.days}</span>
            </div>
            <div className={`col-span-3 ${cellStyle} ${rowClass}`}>
                <span className='truncate'>{props.location}</span>
            </div>
            <div className={`col-span-2 ${cellStyle} ${rowClass}`}>
                <span
                    title={props.company}
                    className={
                        props.msc
                            ? `bg-blue-300 px-1 py-1 rounded truncate`
                            : `truncate`
                    }
                >
                    {props.company}
                </span>
            </div>
            <div className={`col-span-3 ${cellStyle} ${rowClass}`}>
                <span className='truncate'>{props.crewRelieved}</span>
            </div>
            <div className={`relative col-span-4 ${cellStyle} ${rowClass}`}>
                {/* Hidden measuring span — only if there's text */}
                {displayNotes && (
                    <span
                        ref={textRef}
                        className='invisible absolute left-0 top-0 w-full px-2 py-1 line-clamp-2'
                        aria-hidden='true'
                    >
                        {displayNotes}
                    </span>
                )}

                {/* ONLY render ANYTHING if displayNotes exists AND (it's, showExpandButton || !isTruncated) */}
                {displayNotes ? (
                    showExpandButton ? (
                        // Expandable button — ONLY gets bg-mebagold when collapsed + nightCard
                        <button
                            type='button'
                            onClick={toggleExpanded}
                            aria-label={
                                isExpanded ? 'Collapse notes' : 'Expand notes'
                            }
                            className={`flex justify-between items-start w-full rounded hover:bg-indigo-200 transition-all cursor-pointer ${
                                isCompact ? 'px-1 py-0.5' : 'px-2 py-1'
                            }
                                ${
                                    isExpanded
                                        ? 'absolute z-50 bg-white shadow-lg border border-mebagold'
                                        : props.nightCard
                                        ? 'bg-mebagold'
                                        : 'bg-transparent'
                                }`}
                        >
                            <span
                                className={`flex-1 text-left
                                    ${
                                        isExpanded
                                            ? 'whitespace-pre-wrap break-words'
                                            : 'line-clamp-2'
                                    }`}
                                data-testid='notesContent'
                            >
                                {displayNotes}
                            </span>
                            <div className='relative w-5 h-5 ml-2 flex-shrink-0'>
                                <Plus
                                    className={`absolute inset-0 transition-opacity ${
                                        isExpanded ? 'opacity-0' : 'opacity-100'
                                    }`}
                                    size={16}
                                />
                                <Minus
                                    className={`absolute inset-0 transition-opacity ${
                                        isExpanded ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    size={16}
                                />
                            </div>
                        </button>
                    ) : (
                        // Short notes — normal display
                        <span
                            className={`text-center ${
                                isCompact ? 'px-1 py-0.5' : 'px-2 py-1'
                            } ${props.nightCard ? 'bg-mebagold rounded' : ''}`}
                        >
                            {displayNotes}
                        </span>
                    )
                ) : null}
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
