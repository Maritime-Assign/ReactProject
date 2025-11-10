import React, { useState, useEffect } from 'react'
import { IoClose, IoChevronDown, IoChevronUp, IoCopy } from 'react-icons/io5'
import supabase from '../api/supabaseClient'
import { formatJobHistoryRecord, getJobStateComparison } from '../utils/jobHistoryOptimized'

const HistoryPopout = ({ jobId, onClose, initialData = null }) => {
    const [history, setHistory] = useState(initialData ? [initialData] : [])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedRows, setExpandedRows] = useState(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [copySuccess, setCopySuccess] = useState('')
    
    const ITEMS_PER_PAGE = 10

    // Fetch full history for the job
    const fetchHistory = async (page = 1) => {
        setLoading(true)
        setError(null)

        try {
            const offset = (page - 1) * ITEMS_PER_PAGE
            const { data, error: fetchError, count } = await supabase
                .from('JobsHistory_test2')
                .select('*', { count: 'exact' })
                .eq('job_id', jobId)
                .order('change_time', { ascending: false })
                .range(offset, offset + ITEMS_PER_PAGE - 1)

            if (fetchError) {
                setError(`Failed to load history: ${fetchError.message}`)
                console.error('Fetch error:', fetchError)
                return
            }

            const formattedHistory = data ? data.map(formatJobHistoryRecord) : []
            setHistory(formattedHistory)
            setTotalCount(count || 0)
        } catch (err) {
            setError('An error occurred while loading history')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // If we have initial data, don't fetch immediately
        if (initialData) {
            setLoading(false)
            setTotalCount(1)
            // Fetch full history after showing initial data
            fetchHistory(1)
        } else {
            fetchHistory(1)
        }
    }, [jobId])

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
        fetchHistory(newPage)
    }

    const loadMore = () => {
        handlePageChange(currentPage + 1)
    }

    const toggleRowExpansion = (logId) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(logId)) {
            newExpanded.delete(logId)
        } else {
            newExpanded.add(logId)
        }
        setExpandedRows(newExpanded)
    }

    const copyToClipboard = async (text, logId) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopySuccess(`Copied log ${logId}!`)
            setTimeout(() => setCopySuccess(''), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
            setCopySuccess('Failed to copy')
            setTimeout(() => setCopySuccess(''), 2000)
        }
    }

    const getFullContentForCopy = (log) => {
        const comparison = getJobStateComparison(log.previousStateFormatted, log.newStateFormatted)
        const changeDetails = comparison.map(change => 
            `${change.field}: ${change.oldValue || 'N/A'} → ${change.newValue || 'N/A'} (${change.changeType})`
        ).join('\n')

        return `Job History Entry
Date: ${log.formattedDate}
User: ${log.changed_by_user_id || 'Unknown User'}
Job ID: ${log.job_id}
Action: ${log.isNewJob ? 'Job Created' : 'Job Updated'}

Changes:
${changeDetails}

Previous State:
${log.previous_state || 'N/A (New Job)'}

New State:
${log.new_state}`
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Full History for Job #{jobId}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <IoClose className="w-6 h-6" />
                    </button>
                </div>

                {/* Copy Success Message */}
                {copySuccess && (
                    <div className="absolute top-4 right-4 z-50">
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-md">
                            {copySuccess}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-lg text-gray-600">Loading history...</div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="text-red-800">{error}</div>
                        </div>
                    )}

                    {!loading && !error && history.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">No history found for this job</div>
                        </div>
                    )}

                    {!loading && !error && history.length > 0 && (
                        <div className="space-y-4">
                            {history.map((log) => (
                                <div key={log.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Summary Row */}
                                    <div className="bg-gray-50 p-4 flex items-center gap-4">
                                        <button
                                            onClick={() => toggleRowExpansion(log.id)}
                                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                        >
                                            {expandedRows.has(log.id) ? 
                                                <IoChevronUp className="w-5 h-5" /> : 
                                                <IoChevronDown className="w-5 h-5" />
                                            }
                                        </button>
                                        
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Date & Time</div>
                                                <div className="text-sm font-medium text-gray-900">{log.formattedDate}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">User</div>
                                                <div className="text-sm font-medium text-gray-900">{log.changed_by_user_id || 'Unknown User'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Action</div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    log.isNewJob ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {log.isNewJob ? 'Created' : 'Updated'}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => copyToClipboard(getFullContentForCopy(log), log.id)}
                                            className="text-mebablue-dark hover:text-mebablue-hover flex-shrink-0"
                                            title="Copy full details"
                                        >
                                            <IoCopy className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Changes Summary */}
                                    <div className="px-4 py-3 bg-white border-t border-gray-200">
                                        <div className="max-w-full">
                                            {(() => {
                                                const changes = getJobStateComparison(log.previousStateFormatted, log.newStateFormatted)
                                                const displayChanges = changes.slice(0, 4)
                                                const remainingCount = changes.length - 4
                                                
                                                return (
                                                    <div className='flex flex-wrap gap-2'>
                                                        {displayChanges.map((change, idx) => (
                                                            <div key={idx} className='flex items-center gap-2 text-xs bg-gray-50 px-2 py-1 rounded'>
                                                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                                    change.changeType === 'added' ? 'bg-green-100 text-green-700' :
                                                                    change.changeType === 'removed' ? 'bg-red-100 text-red-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                    {change.field}
                                                                </span>
                                                                <span className='text-gray-400'>→</span>
                                                                <span className='truncate max-w-[150px] text-gray-700' title={String(change.newValue || 'None')}>
                                                                    {String(change.newValue || 'None')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {remainingCount > 0 && (
                                                            <div className='flex items-center text-xs text-gray-500 italic bg-gray-100 px-2 py-1 rounded'>
                                                                +{remainingCount} more change{remainingCount !== 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedRows.has(log.id) && (
                                        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Change Summary</h4>
                                            
                                            {/* Spreadsheet-style Field Changes Table */}
                                            <div className="mb-4">
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-100">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Field</th>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Previous Value</th>
                                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-24">Change</th>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">New Value</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {getJobStateComparison(log.previousStateFormatted, log.newStateFormatted).map((change, index) => (
                                                                <tr key={index} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                                                        {change.field}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                                        {change.oldValue || <span className="text-gray-400 italic">None</span>}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                            change.changeType === 'added' ? 'bg-green-100 text-green-800' :
                                                                            change.changeType === 'removed' ? 'bg-red-100 text-red-800' :
                                                                            'bg-blue-100 text-blue-800'
                                                                        }`}>
                                                                            {change.changeType === 'added' ? '+ Added' :
                                                                             change.changeType === 'removed' ? '- Removed' :
                                                                             '↻ Modified'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                                        {change.newValue || <span className="text-gray-400 italic">None</span>}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Complete Job Snapshot */}
                                            <div className="mt-4">
                                                <h5 className="font-medium text-gray-900 mb-2 text-sm">Complete Job Snapshot</h5>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {log.previousStateFormatted && (
                                                        <div>
                                                            <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Before Changes</div>
                                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <tbody className="bg-white divide-y divide-gray-100">
                                                                        {Object.entries(log.previousStateFormatted).map(([key, value], idx) => (
                                                                            <tr key={idx} className="hover:bg-gray-50">
                                                                                <td className="px-3 py-2 text-xs font-medium text-gray-600 w-1/3">
                                                                                    {key}
                                                                                </td>
                                                                                <td className="px-3 py-2 text-xs text-gray-900">
                                                                                    {value !== null && value !== undefined ? String(value) : <span className="text-gray-400 italic">null</span>}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div>
                                                        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                                                            {log.previousStateFormatted ? 'After Changes' : 'Job Created'}
                                                        </div>
                                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                            <table className="min-w-full divide-y divide-gray-200">
                                                                <tbody className="bg-white divide-y divide-gray-100">
                                                                    {Object.entries(log.newStateFormatted).map(([key, value], idx) => (
                                                                        <tr key={idx} className="hover:bg-gray-50">
                                                                            <td className="px-3 py-2 text-xs font-medium text-gray-600 w-1/3">
                                                                                {key}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-xs text-gray-900">
                                                                                {value !== null && value !== undefined ? String(value) : <span className="text-gray-400 italic">null</span>}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer with Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} changes
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                                >
                                    Previous
                                </button>
                                {currentPage < totalPages && (
                                    <button
                                        onClick={loadMore}
                                        className="px-4 py-2 bg-mebablue-dark text-white rounded text-sm hover:bg-mebablue-hover"
                                    >
                                        Load More
                                    </button>
                                )}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HistoryPopout