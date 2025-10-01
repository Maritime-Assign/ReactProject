import React, { useState, useEffect } from 'react'
import { IoArrowBack, IoRefresh, IoFilter, IoDownload } from 'react-icons/io5'
import { BiSort } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { fetchAuditLogs, fetchAuditSummary, formatAuditLog } from '../components/AuditFetch'

const ViewHistory = () => {
    const navigate = useNavigate()
    const [logs, setLogs] = useState([])
    const [summary, setSummary] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [filters, setFilters] = useState({
        action: 'ALL',
        dateFrom: '',
        dateTo: '',
        userId: ''
    })
    const [showFilters, setShowFilters] = useState(false)

    const ITEMS_PER_PAGE = 25

    // Fetch audit logs
    const fetchLogs = async (page = 1, currentFilters = filters) => {
        setLoading(true)
        setError(null)

        try {
            const offset = (page - 1) * ITEMS_PER_PAGE
            const { data, error: fetchError, count } = await fetchAuditLogs({
                limit: ITEMS_PER_PAGE,
                offset,
                ...currentFilters,
                dateFrom: currentFilters.dateFrom || null,
                dateTo: currentFilters.dateTo || null
            })

            if (fetchError) {
                setError('Failed to load audit logs')
                console.error(fetchError)
                return
            }

            const formattedLogs = data.map(formatAuditLog)
            setLogs(formattedLogs)
            setTotalCount(count)
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
            const { data, error: summaryError } = await fetchAuditSummary({
                dateFrom: filters.dateFrom || null,
                dateTo: filters.dateTo || null
            })

            if (!summaryError) {
                setSummary(data)
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
        const clearedFilters = { action: 'ALL', dateFrom: '', dateTo: '', userId: '' }
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

    // Export functionality (basic CSV export)
    const exportToCsv = () => {
        const headers = ['Date', 'User', 'Action', 'Ship Name', 'Location', 'Changes']
        const csvData = [
            headers.join(','),
            ...logs.map(log => [
                log.formattedDate,
                log.user_email || 'System',
                log.actionText,
                log.shipName,
                log.jobLocation,
                `"${log.changedFieldsText}"`
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

    const getActionBadgeClass = (action) => {
        const classes = {
            'INSERT': 'bg-green-100 text-green-800',
            'UPDATE': 'bg-blue-100 text-blue-800',
            'DELETE': 'bg-red-100 text-red-800',
            'CLAIM': 'bg-purple-100 text-purple-800'
        }
        return classes[action] || 'bg-gray-100 text-gray-800'
    }

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
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>Total Actions</div>
                    <div className='text-2xl font-bold text-mebablue-dark'>{summary.totalActions || 0}</div>
                </div>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>Jobs Created</div>
                    <div className='text-2xl font-bold text-green-600'>{summary.actionCounts?.INSERT || 0}</div>
                </div>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>Jobs Updated</div>
                    <div className='text-2xl font-bold text-blue-600'>{summary.actionCounts?.UPDATE || 0}</div>
                </div>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>Jobs Claimed</div>
                    <div className='text-2xl font-bold text-purple-600'>{summary.actionCounts?.CLAIM || 0}</div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className='bg-white rounded-lg shadow p-4 mb-4'>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Action Type</label>
                            <select
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                                className='w-full border rounded px-3 py-2'
                            >
                                <option value="ALL">All Actions</option>
                                <option value="INSERT">Created</option>
                                <option value="UPDATE">Updated</option>
                                <option value="DELETE">Deleted</option>
                                <option value="CLAIM">Claimed</option>
                            </select>
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

            {/* Audit Logs Table */}
            {!loading && !error && (
                <div className='bg-white rounded-lg shadow overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Date & Time
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        User
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Action
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Job Details
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Changes Made
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                {logs.map((log) => (
                                    <tr key={log.id} className='hover:bg-gray-50'>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                            {log.formattedDate}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                            {log.user_email || 'System'}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeClass(log.action)}`}>
                                                {log.actionText}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 text-sm text-gray-900'>
                                            <div className='font-medium'>{log.shipName}</div>
                                            <div className='text-gray-500'>{log.jobLocation}</div>
                                        </td>
                                        <td className='px-6 py-4 text-sm text-gray-500 max-w-xs'>
                                            <div className='truncate' title={log.changedFieldsText}>
                                                {log.changedFieldsText || 'No specific changes tracked'}
                                            </div>
                                        </td>
                                    </tr>
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