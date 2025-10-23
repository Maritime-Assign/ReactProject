import React, { useState, useEffect } from 'react'
import supabase from '../api/supabaseClient'
import { IoArrowBack, IoRefresh, IoFilter, IoDownload, IoChevronDown, IoChevronUp, IoCopy, IoListOutline } from 'react-icons/io5'
import { BiSort } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { formatJobHistoryRecord, getJobStateComparison } from '../utils/jobHistoryOptimized'
import HistoryPopout from './HistoryPopout'

const ViewHistory = () => {
    const navigate = useNavigate()
    const [logs, setLogs] = useState([])
    const [groupedLogs, setGroupedLogs] = useState([])
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
    const [selectedJobId, setSelectedJobId] = useState(null)
    const [viewMode, setViewMode] = useState('grouped') // 'grouped' or 'flat'

    const ITEMS_PER_PAGE = 25

    // Fetch job history logs
    const fetchLogs = async (page = 1, currentFilters = filters) => {
        setLoading(true)
        setError(null)

        try {
            if (viewMode === 'grouped') {
                // Fetch grouped view - only most recent change per job
                await fetchGroupedLogs(page, currentFilters)
            } else {
                // Fetch flat view - all history records
                await fetchFlatLogs(page, currentFilters)
            }
        } catch (err) {
            setError('An error occurred while loading data')
            console.error(err)
            setLoading(false)
        }
    }

    // Fetch grouped logs (most recent change per job_id)
    const fetchGroupedLogs = async (page = 1, currentFilters = filters) => {
        try {
            const offset = (page - 1) * ITEMS_PER_PAGE

            // First, get all job_ids that match the filters
            let jobIdsQuery = supabase
                .from('JobsHistory')
                .select('job_id')

            // Apply filters
            if (currentFilters.jobId && currentFilters.jobId.trim()) {
                jobIdsQuery = jobIdsQuery.eq('job_id', currentFilters.jobId.trim())
            }

            if (currentFilters.dateFrom) {
                jobIdsQuery = jobIdsQuery.gte('change_time', currentFilters.dateFrom)
            }

            if (currentFilters.dateTo) {
                jobIdsQuery = jobIdsQuery.lte('change_time', currentFilters.dateTo + 'T23:59:59')
            }

            if (currentFilters.userId && currentFilters.userId.trim()) {
                jobIdsQuery = jobIdsQuery.eq('changed_by_user_id', currentFilters.userId.trim())
            }

            const { data: allJobIds, error: jobIdsError } = await jobIdsQuery

            if (jobIdsError) {
                setError(`Failed to load job IDs: ${jobIdsError.message}`)
                console.error('Job IDs error:', jobIdsError)
                setLoading(false)
                return
            }

            // Get unique job IDs
            const uniqueJobIds = [...new Set(allJobIds.map(item => item.job_id))]
            const totalUniqueJobs = uniqueJobIds.length

            // Paginate the unique job IDs
            const paginatedJobIds = uniqueJobIds.slice(offset, offset + ITEMS_PER_PAGE)

            // Fetch the most recent record for each paginated job_id
            const groupedData = []
            for (const jobId of paginatedJobIds) {
                let query = supabase
                    .from('JobsHistory')
                    .select('*')
                    .eq('job_id', jobId)
                    .order('change_time', { ascending: false })
                    .limit(1)

                // Re-apply filters for consistency
                if (currentFilters.dateFrom) {
                    query = query.gte('change_time', currentFilters.dateFrom)
                }

                if (currentFilters.dateTo) {
                    query = query.lte('change_time', currentFilters.dateTo + 'T23:59:59')
                }

                if (currentFilters.userId && currentFilters.userId.trim()) {
                    query = query.eq('changed_by_user_id', currentFilters.userId.trim())
                }

                const { data, error } = await query

                if (!error && data && data.length > 0) {
                    groupedData.push(data[0])
                }
            }

            // Sort by most recent change_time
            groupedData.sort((a, b) => new Date(b.change_time) - new Date(a.change_time))

            const formattedLogs = groupedData.map(formatJobHistoryRecord)
            setGroupedLogs(formattedLogs)
            setTotalCount(totalUniqueJobs)
            setLoading(false)
        } catch (err) {
            setError('An error occurred while loading grouped data')
            console.error(err)
            setLoading(false)
        }
    }

    // Fetch flat logs (all history records)
    const fetchFlatLogs = async (page = 1, currentFilters = filters) => {
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
                setLoading(false)
                return
            }

            const formattedLogs = data ? data.map(formatJobHistoryRecord) : []
            setLogs(formattedLogs)
            setTotalCount(count || 0)
            setLoading(false)
        } catch (err) {
            setError('An error occurred while loading flat data')
            console.error(err)
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
    }, [viewMode])

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

    // Toggle view mode
    const toggleViewMode = () => {
        setViewMode(viewMode === 'grouped' ? 'flat' : 'grouped')
        setCurrentPage(1)
    }

    // Open history popout
    const openHistoryPopout = (jobId, initialData) => {
        setSelectedJobId(jobId)
    }

    // Close history popout
    const closeHistoryPopout = () => {
        setSelectedJobId(null)
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
                {/*Title text*/}
                <div className='flex-grow text-center'>
                    <span className='text-white text-2xl font-medium'>
                        Job Board History & Changes
                    </span>
                </div>
                {/* Search Bar */}
                <div className='flex-grow mx-4'>
                    <input
                        type='text'
                        placeholder='Search job id, user, change type, or date…'
                        className='w-full py-2 px-4 rounded-lg text-sm text-gray-700 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                </div>


                {/* icons */}
                <div className='flex gap-2 mr-4'>
                    <button
                        onClick={toggleViewMode}
                        className='bg-mebablue-light hover:bg-mebablue-hover p-2 rounded text-white'
                        title={viewMode === 'grouped' ? 'Switch to Flat View' : 'Switch to Grouped View'}
                    >
                        <IoListOutline className='w-5 h-5' />
                    </button>
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

            {/* View Mode Indicator */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4'>
                <div className='text-sm text-blue-800'>
                    {viewMode === 'grouped' ?
                        '📊 Grouped View: Showing most recent change per job. Click a row to view full history.' :
                        '📋 Flat View: Showing all history records chronologically.'
                    }
                </div>
            </div>

            {/* Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>
                        {viewMode === 'grouped' ? 'Unique Jobs with Changes' : 'Total History Records'}
                    </div>
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
                                {(viewMode === 'grouped' ? groupedLogs : logs).map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            className={`hover:bg-gray-50 ${viewMode === 'grouped' ? 'cursor-pointer' : ''}`}
                                            onClick={() => viewMode === 'grouped' && openHistoryPopout(log.job_id, log)}
                                        >
                                            <td className='px-2 py-4 text-center'>
                                                {viewMode === 'grouped' ? (
                                                    <IoChevronDown className='w-5 h-5 text-gray-400' />
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleRowExpansion(log.id)
                                                        }}
                                                        className='text-gray-400 hover:text-gray-600'
                                                    >
                                                        {expandedRows.has(log.id) ?
                                                            <IoChevronUp className='w-5 h-5' /> :
                                                            <IoChevronDown className='w-5 h-5' />
                                                        }
                                                    </button>
                                                )}
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
                                                <div className='text-gray-500'>
                                                    {viewMode === 'grouped' ? 'Click to view full history' : 'View details in expanded view'}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-500'>
                                                <div className='max-w-md'>
                                                    {(() => {
                                                        const changes = getJobStateComparison(log.previousStateFormatted, log.newStateFormatted)
                                                        const displayChanges = changes.slice(0, 3)
                                                        const remainingCount = changes.length - 3
                                                        
                                                        return (
                                                            <div className='space-y-1'>
                                                                {displayChanges.map((change, idx) => (
                                                                    <div key={idx} className='flex items-center gap-2 text-xs'>
                                                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                                            change.changeType === 'added' ? 'bg-green-100 text-green-700' :
                                                                            change.changeType === 'removed' ? 'bg-red-100 text-red-700' :
                                                                            'bg-blue-100 text-blue-700'
                                                                        }`}>
                                                                            {change.field}
                                                                        </span>
                                                                        <span className='text-gray-400'>→</span>
                                                                        <span className='truncate max-w-[200px]' title={String(change.newValue || 'None')}>
                                                                            {String(change.newValue || 'None')}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                                {remainingCount > 0 && (
                                                                    <div className='text-xs text-gray-400 italic'>
                                                                        +{remainingCount} more change{remainingCount !== 1 ? 's' : ''}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })()}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm'>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        copyToClipboard(getFullContentForCopy(log), log.id)
                                                    }}
                                                    className='text-mebablue-dark hover:text-mebablue-hover'
                                                    title='Copy full details'
                                                >
                                                    <IoCopy className='w-4 h-4' />
                                                </button>
                                            </td>
                                        </tr>
                                        {viewMode === 'flat' && expandedRows.has(log.id) && (
                                            <tr>
                                                <td colSpan="8" className='px-6 py-4 bg-gray-50'>
                                                    <div className='space-y-4'>
                                                        <div className='flex justify-between items-center'>
                                                            <h4 className='text-lg font-semibold text-gray-900'>Change Summary</h4>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    copyToClipboard(getFullContentForCopy(log), log.id)
                                                                }}
                                                                className='bg-mebablue-dark text-white px-3 py-1 rounded text-sm hover:bg-mebablue-hover flex items-center gap-2'
                                                            >
                                                                <IoCopy className='w-4 h-4' />
                                                                Copy All
                                                            </button>
                                                        </div>
                                                        
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
                                                            <h5 className="font-medium text-gray-900 mb-2">Complete Job Snapshot</h5>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                {log.previousStateFormatted && (
                                                                    <div>
                                                                        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Before Changes</div>
                                                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-80 overflow-y-auto">
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
                                                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-80 overflow-y-auto">
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
            {!loading && !error && (viewMode === 'grouped' ? groupedLogs : logs).length === 0 && (
                <div className='text-center py-12'>
                    <div className='text-gray-500 text-lg'>No history found</div>
                    <div className='text-gray-400 text-sm mt-2'>Try adjusting your filters or check back later</div>
                </div>
            )}

            {/* History Popout */}
            {selectedJobId && (
                <HistoryPopout
                    jobId={selectedJobId}
                    onClose={closeHistoryPopout}
                    initialData={groupedLogs.find(log => log.job_id === selectedJobId)}
                />
            )}
        </div>
    )
}

export default ViewHistory
