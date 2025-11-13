import React, { useState, useEffect } from 'react'
import { getJobStateComparison } from '../utils/jobHistoryOptimized' // Assuming this path is correct
// Import getActionColorClasses if used elsewhere, but not strictly needed for this file's core logic now.

// Note: Ensure the getActionColorClasses helper used for field bubbles
// is available or defined (as it was in the previous step).

const HistoryChangesSummary = ({ log }) => {
    const [resolvedChanges, setResolvedChanges] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    // useEffect runs whenever the log's state data changes
    useEffect(() => {
        // Only run if we have state data to compare
        if (!log || (!log.previousStateFormatted && !log.newStateFormatted)) {
            setResolvedChanges([])
            setIsLoading(false)
            return
        }

        const fetchChanges = async () => {
            setIsLoading(true)
            try {
                // This is the core logic that creates the list of detailed changes (resolvedChanges)
                const changesArray = await getJobStateComparison(
                    log.previousStateFormatted,
                    log.newStateFormatted
                )
                setResolvedChanges(changesArray)
            } catch (error) {
                console.error('Error fetching job state comparison:', error)
                setResolvedChanges([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchChanges()
    }, [log.previousStateFormatted, log.newStateFormatted])

    // Return the JSX for the change details column (the <td>)
    return (
        <td className='px-6 py-4 text-sm text-gray-900 truncate max-w-[250px]'>
            {/* 1. Check Loading State */}
            {isLoading ? (
                <div className='text-xs text-gray-400 italic'>
                    Loading detailed changes...
                </div>
            ) : resolvedChanges.length === 0 ? (
                // 2. No changes found (e.g., if a 'Created' log had no previous state to compare, or the states were identical)
                <div className='text-xs text-gray-500'>
                    No detailed changes to display
                </div>
            ) : (
                // 3. Render the detailed list of changes (Field → New Value style)
                <div className='space-y-1'>
                    {resolvedChanges.slice(0, 3).map((change, idx) => (
                        <div
                            key={idx}
                            className='flex items-center gap-2 text-xs'
                        >
                            {/* Field Name Bubble (colored based on change type: added/removed/updated) */}
                            <span
                                className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    change.changeType === 'added'
                                        ? 'bg-green-100 text-green-700'
                                        : change.changeType === 'removed'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-blue-100 text-blue-700' // 'updated' changes use blue
                                }`}
                            >
                                {change.field}
                            </span>

                            {/* Arrow Separator */}
                            <span className='text-gray-400'>→</span>

                            {/* New Value (truncated with full value in title tooltip) */}
                            <span
                                className='truncate max-w-[100px] text-gray-700'
                                title={String(change.newValue || 'None')}
                            >
                                {String(change.newValue || 'None')}
                            </span>
                        </div>
                    ))}

                    {/* 4. Remaining Count Logic */}
                    {resolvedChanges.length > 3 && (
                        <div className='text-xs text-gray-400 italic'>
                            + {resolvedChanges.length - 3} more change
                            {resolvedChanges.length - 3 !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            )}
        </td>
    )
}

export default HistoryChangesSummary
