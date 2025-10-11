import React, { useState, useEffect } from 'react'
import { IoArrowBack, IoRefresh, IoFilter, IoDownload, IoChevronDown, IoChevronUp, IoCopy } from 'react-icons/io5'
import { BiSort } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../api/supabaseClient'
import { formatJobHistoryRecord, getJobStateComparison } from '../utils/jobHistoryOptimized'

const ViewHistory = () => {
    const navigate = useNavigate()
    const [logs, setLogs] = useState([])
    const [summary, setSummary] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [filters, setFilters] = useState({
        jobId: '',
        dateFrom: '',
        dateTo: '',
        userId: ''
    })
    const [showFilters, setShowFilters] = useState(false)
    const [expandedRows, setExpandedRows] = useState(new Set())
    const [copySuccess, setCopySuccess] = useState('')

    const ITEMS_PER_PAGE = 25

    // Fetch job history logs
    const fetchLogs = async (page = 1, currentFilters = filters) => {
        setLoading(true)
        setError(null)

        try {
            const offset = (page - 1) * ITEMS_PER_PAGE
            let query = supabase
                .from('JobsHistory')
                .select(`*`, { count: 'exact' })
                .order('change_time', { ascending: false })

            // Apply filters
            if (currentFilters.jobId && currentFilters.jobId.trim()) {
                query = query.eq('job_id', currentFilters.jobId.trim())
            }

            if (currentFilters.dateFrom) {
                query = query.gte('change_time', currentFilters.dateFrom)
            }

            if (currentFilters.dateTo) {
                query = query.lte('change_time', currentFilters.dateTo + 'T23:59:59')
            }

            if (currentFilters.userId && currentFilters.userId.trim()) {
                query = query.eq('changed_by_user_id', currentFilters.userId.trim())
            }

            // Apply pagination
            query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

            const { data, error: fetchError, count } = await query

            if (fetchError) {
                setError(`Failed to load job history: ${fetchError.message}`)
                console.error('Fetch error details:', fetchError)
                return
            }

            console.log('Raw JobsHistory data:', data)
            console.log('Total count:', count)

            if (!data || data.length === 0) {
                console.log('No history records found. This could mean:')
                console.log('1. No jobs have been created yet')
                console.log('2. Database triggers are not working')
                console.log('3. RLS policy is blocking access to JobsHistory')
            }

            const formattedLogs = data ? data.map(formatJobHistoryRecord) : []
            setLogs(formattedLogs)
            setTotalCount(count || 0)
        } catch (err) {
            setError('An error occurred while loading data')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Fetch summary data
    const fetchSummaryData = async () => {
        try {
            let query = supabase
                .from('JobsHistory')
                .select('*')

            if (filters.dateFrom) {
                query = query.gte('change_time', filters.dateFrom)
            }

            if (filters.dateTo) {
                query = query.lte('change_time', filters.dateTo + 'T23:59:59')
            }

            const { data, error: summaryError } = await query

            if (!summaryError && data) {
                const summary = {
                    totalActions: data.length,
                    newJobs: data.filter(log => !log.previous_state).length,
                    updatedJobs: data.filter(log => log.previous_state).length,
                    recentActivity: data.slice(0, 10)
                }
                setSummary(summary)
            }
        } catch (err) {
            console.error('Error fetching summary:', err)
        }
    }

    // Initial data load
    useEffect(() => {
        fetchLogs(1)
        fetchSummaryData()
    }, [])

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
    }

    const applyFilters = () => {
        setCurrentPage(1)
        fetchLogs(1, filters)
        fetchSummaryData()
    }

    const clearFilters = () => {
        const clearedFilters = { jobId: '', dateFrom: '', dateTo: '', userId: '' }
        setFilters(clearedFilters)
        setCurrentPage(1)
        fetchLogs(1, clearedFilters)
        fetchSummaryData()
    }

    // Handle pagination
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
        fetchLogs(newPage)
    }

    // Refresh data
    const handleRefresh = () => {
        fetchLogs(currentPage)
        fetchSummaryData()
    }

    // Toggle expanded row
    const toggleRowExpansion = (logId) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(logId)) {
            newExpanded.delete(logId)
        } else {
            newExpanded.add(logId)
        }
        setExpandedRows(newExpanded)
    }

    // Copy to clipboard functionality
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

    // Format the full content for copying
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

    // Export functionality (basic CSV export)
    const exportToCsv = () => {
        const headers = ['Date', 'User', 'Job ID', 'Action', 'Ship Name', 'Location', 'Changes Summary']
        const csvData = [
            headers.join(','),
            ...logs.map(log => [
                log.formattedDate,
                log.changed_by_user_id || 'Unknown User',
                log.job_id,
                log.isNewJob ? 'Created' : 'Updated',
                'Unknown Ship',
                'Unknown Location',
                `"${log.changesSummary}"`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvData], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `job_history_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    return (
        <div className='w-full pt-4 flex flex-col max-w-[1280px] mx-auto font-mont'>
            {/* Header */}
            <div className='flex py-4 bg-mebablue-dark rounded-md w-full shadow-xl relative items-center mb-4'>
                <button
                    onClick={() => navigate(-1)}
                    className='bg-mebagold shadow-md rounded-full p-2 absolute left-4 text-2xl text-center text-mebablue-dark hover:bg-yellow-300'
                >
                    <IoArrowBack className='w-6 h-6' />
                </button>

                <div className='w-full text-center'>
                    <span className='text-white text-2xl font-medium'>
                        Job Board History & Changes
                    </span>
                </div>

                <div className='absolute right-4 flex gap-2'>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className='bg-mebablue-light hover:bg-mebablue-hover p-2 rounded text-white'
                        title='Toggle Filters'
                    >
                        <IoFilter className='w-5 h-5' />
                    </button>
                    <button
                        onClick={handleRefresh}
                        className='bg-mebablue-light hover:bg-mebablue-hover p-2 rounded text-white'
                        title='Refresh'
                    >
                        <IoRefresh className='w-5 h-5' />
                    </button>
                    <button
                        onClick={exportToCsv}
                        className='bg-mebablue-light hover:bg-mebablue-hover p-2 rounded text-white'
                        title='Export CSV'
                    >
                        <IoDownload className='w-5 h-5' />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>Total History Records</div>
                    <div className='text-2xl font-bold text-mebablue-dark'>{summary.totalActions || 0}</div>
                </div>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>Jobs Created</div>
                    <div className='text-2xl font-bold text-green-600'>{summary.newJobs || 0}</div>
                </div>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>Jobs Updated</div>
                    <div className='text-2xl font-bold text-blue-600'>{summary.updatedJobs || 0}</div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className='bg-white rounded-lg shadow p-4 mb-4'>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Job ID</label>
                            <input
                                type="text"
                                value={filters.jobId}
                                onChange={(e) => handleFilterChange('jobId', e.target.value)}
                                placeholder="Enter Job ID"
                                className='w-full border rounded px-3 py-2'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>From Date</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                className='w-full border rounded px-3 py-2'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>To Date</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                className='w-full border rounded px-3 py-2'
                            />
                        </div>
                        <div className='flex items-end gap-2'>
                            <button
                                onClick={applyFilters}
                                className='bg-mebablue-dark text-white px-4 py-2 rounded hover:bg-mebablue-hover'
                            >
                                Apply
                            </button>
                            <button
                                onClick={clearFilters}
                                className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className='flex justify-center items-center py-12'>
                    <div className='text-lg text-gray-600'>Loading history...</div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
                    <div className='text-red-800'>{error}</div>
                </div>
            )}

            {/* Copy Success Message */}
            {copySuccess && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-md">
                        {copySuccess}
                    </div>
                </div>
            )}

            {/* Job History Table */}
            {!loading && !error && (
                <div className='bg-white rounded-lg shadow overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th className='px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8'>
                                        
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Date & Time
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        User
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Job ID
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Action
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Job Details
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Changes Summary
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                {logs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr className='hover:bg-gray-50'>
                                            <td className='px-2 py-4 text-center'>
                                                <button
                                                    onClick={() => toggleRowExpansion(log.id)}
                                                    className='text-gray-400 hover:text-gray-600'
                                                >
                                                    {expandedRows.has(log.id) ? 
                                                        <IoChevronUp className='w-5 h-5' /> : 
                                                        <IoChevronDown className='w-5 h-5' />
                                                    }
                                                </button>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                                {log.formattedDate}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                                {log.changed_by_user_id || 'Unknown User'}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900'>
                                                {log.job_id}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    log.isNewJob ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {log.isNewJob ? 'Created' : 'Updated'}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-900'>
                                                <div className='font-medium'>Job #{log.job_id}</div>
                                                <div className='text-gray-500'>View details in expanded view</div>
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-500 max-w-xs'>
                                                <div className='truncate' title={log.changesSummary}>
                                                    {log.changesSummary}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm'>
                                                <button
                                                    onClick={() => copyToClipboard(getFullContentForCopy(log), log.id)}
                                                    className='text-mebablue-dark hover:text-mebablue-hover'
                                                    title='Copy full details'
                                                >
                                                    <IoCopy className='w-4 h-4' />
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRows.has(log.id) && (
                                            <tr>
                                                <td colSpan="8" className='px-6 py-4 bg-gray-50'>
                                                    <div className='space-y-4'>
                                                        <div className='flex justify-between items-center'>
                                                            <h4 className='text-lg font-semibold text-gray-900'>Full Change Details</h4>
                                                            <button
                                                                onClick={() => copyToClipboard(getFullContentForCopy(log), log.id)}
                                                                className='bg-mebablue-dark text-white px-3 py-1 rounded text-sm hover:bg-mebablue-hover flex items-center gap-2'
                                                            >
                                                                <IoCopy className='w-4 h-4' />
                                                                Copy All
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Field-by-field comparison */}
                                                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                                                            <div>
                                                                <h5 className='font-medium text-gray-900 mb-2'>Field Changes:</h5>
                                                                <div className='bg-white p-3 rounded border max-h-60 overflow-y-auto'>
                                                                    {getJobStateComparison(log.previousStateFormatted, log.newStateFormatted).map((change, index) => (
                                                                        <div key={index} className='mb-2 text-sm'>
                                                                            <div className='font-medium text-gray-700'>{change.field}:</div>
                                                                            <div className='ml-2'>
                                                                                <span className={`px-2 py-1 rounded text-xs ${
                                                                                    change.changeType === 'added' ? 'bg-green-100 text-green-800' :
                                                                                    change.changeType === 'removed' ? 'bg-red-100 text-red-800' :
                                                                                    'bg-blue-100 text-blue-800'
                                                                                }`}>
                                                                                    {change.changeType}
                                                                                </span>
                                                                                <div className='mt-1'>
                                                                                    <span className='text-gray-500'>From: </span>
                                                                                    <span className='font-mono text-sm'>{change.oldValue || 'N/A'}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className='text-gray-500'>To: </span>
                                                                                    <span className='font-mono text-sm'>{change.newValue || 'N/A'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <h5 className='font-medium text-gray-900 mb-2'>Raw Data:</h5>
                                                                <div className='space-y-2'>
                                                                    {log.previousStateFormatted && (
                                                                        <div>
                                                                            <div className='text-sm font-medium text-gray-700'>Previous State:</div>
                                                                            <pre className='bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap'>
                                                                                {JSON.stringify(log.previousStateFormatted, null, 2)}
                                                                            </pre>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div>
                                                                        <div className='text-sm font-medium text-gray-700'>New State:</div>
                                                                        <pre className='bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap'>
                                                                            {JSON.stringify(log.newStateFormatted, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200'>
                            <div className='text-sm text-gray-700'>
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} results
                            </div>
                            <div className='flex gap-2'>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className='px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = i + Math.max(1, currentPage - 2)
                                    if (page > totalPages) return null
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-2 border rounded text-sm ${
                                                page === currentPage 
                                                    ? 'bg-mebablue-dark text-white' 
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                })}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className='px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && logs.length === 0 && (
                <div className='text-center py-12'>
                    <div className='text-gray-500 text-lg'>No history found</div>
                    <div className='text-gray-400 text-sm mt-2'>Try adjusting your filters or check back later</div>
                </div>
            )}
        </div>
    )
}

export default ViewHistory
