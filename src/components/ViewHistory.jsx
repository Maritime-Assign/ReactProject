import React, { useState, useEffect } from 'react'
import supabase from '../api/supabaseClient'
import {
    IoArrowBack,
    IoRefresh,
    IoFilter,
    IoDownload,
    IoChevronDown,
    IoChevronUp,
    IoCopy,
    IoListOutline,
} from 'react-icons/io5'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    formatJobHistoryRecord,
    getJobStateComparison,
} from '../utils/jobHistoryOptimized'
import HistoryPopout from './HistoryPopout'
import EditJobModal from './EditJobModal'
// clear icon for search bar / modal close
import { IoClose } from 'react-icons/io5'
import HistoryChangesSummary from './HistoryChangesSummary'

const ViewHistory = () => {
    const ITEMS_PER_PAGE = 10

    // used for URL updates based on search params
    const location = useLocation()

    const navigate = useNavigate()
    const [logs, setLogs] = useState([])
    const [groupedLogs, setGroupedLogs] = useState([])
    const [summary, setSummary] = useState({
        totalActions: 0,
        newJobs: 0,
        updatedJobs: 0,
        recentActivity: [],
        closedJobs: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [filters, setFilters] = useState({
        jobId: '',
        dateFrom: '',
        dateTo: '',
        userId: '',
    })
    const [showFilters, setShowFilters] = useState(false)
    const [expandedRows, setExpandedRows] = useState(new Set())
    const [copySuccess, setCopySuccess] = useState('')
    const [selectedJobId, setSelectedJobId] = useState(null)
    const [viewMode, setViewMode] = useState('grouped') // 'grouped' or 'flat'

    // modal state for Jobs Closed
    const [isClosedModalOpen, setIsClosedModalOpen] = useState(false)
    const [closedJobsList, setClosedJobsList] = useState([]) // { id, fillDate, history: [...] }
    const [closedModalLoading, setClosedModalLoading] = useState(false)
    const [expandedClosedJobs, setExpandedClosedJobs] = useState(new Set())

    // confirm/timeout state + updating guard
    // confirmPending: object mapping jobId -> boolean (true when waiting for confirm)
    const [confirmPending, setConfirmPending] = useState({})
    // updatingJobs: Set of jobIds being updated (to disable UI while supabase call)
    const [updatingJobs, setUpdatingJobs] = useState(new Set())
    // timers stored in a ref so they persist without re-renders
    const confirmTimers = React.useRef({})

    // pagination state for closed modal + handlers
    const [closedPage, setClosedPage] = useState(1)
    const closedItemsPerPage = ITEMS_PER_PAGE
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedJobForEdit, setSelectedJobForEdit] = useState(null)

    // Define searchQuery State
    const [searchQuery, setSearchQuery] = useState('')
    // Define state for debounce
    const [debouncedQuery, setDebouncedQuery] = useState('')

    // Used to prevent stale requests and manage search state
    // token request method
    const latestFetchID = React.useRef(0)

    // Define debounce timer - 1000 better to account for slower typing speed so less api calls are made
    // The goal is to make it simulate the time it would take to press enter on average query lengths.
    // So far ship name would be the longest and most time intensive - It is also a core search query required
    useEffect(() => {
        const handler = setTimeout(() => {
            const query = searchQuery.trim()
            setDebouncedQuery(query)
        }, 1000)
        // clear prior timeout
        return () => clearTimeout(handler)
    }, [searchQuery])

    // Debounce when query changes
    // Track last applied filter and skip fetch when nothing is changed
    const lastFilters = React.useRef(null)
    useEffect(() => {
        const query = debouncedQuery.trim()

        // Handle Empty input
        if (!query) {
            // Only fetch if we actually had filters applied/not empty
            const hadFilters = !!lastFilters.current
            || filters.jobId || filters.userId
            || (filters.dateFrom && filters.dateTo)

            if (hadFilters) {
            clearFilters()
            } else {
            // Nothing to clear, reset data without making backend call
            setLogs([])
            setGroupedLogs([])
            setTotalCount(0)
            setSummary({
                totalActions: 0,
                newJobs: 0,
                updatedJobs: 0,
                recentActivity: [],
                closedJobs: 0,
            })
            setLoading(false)
            }

            lastFilters.current = null
            return
        }

        const newFilters = detectSearchType(query)
        if (JSON.stringify(newFilters) !== JSON.stringify(lastFilters.current)) {
            handleSearch(query)
            lastFilters.current = newFilters
        }
    }, [debouncedQuery])

    // useEffect for search/pagination
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const query = params.get('q') || ''
        const page = parseInt(params.get('page'), 10) || 1

        if (query) {
            // Populate search, set page and trigger debounce effect
            setSearchQuery(query)
            setCurrentPage(page)
        }
    }, [location.search])

    // Build helper function to detect if its a jobid/username/date/etc
    const detectSearchType = (query) => {
        if (!query) return null
        const trimmed = query.trim()

        // If numeric assume job id first
        if (/^\d+$/.test(trimmed)) {
            return { type: 'jobid', value: trimmed }
        }

        // If "numeric/" then handle date formats
        // Handle MM/DD/YYYY | M/D/YYYY
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
            const [month, day, year] = trimmed.split('/')
            return {
                type: 'date',
                value: {
                    type: 'day',
                    year,
                    month: month.padStart(2, '0'),
                    day: day.padStart(2, '0'),
                },
            }
        }

        // Handle MM/DD | M/D | MM/DD/ | M/D/
        if (/^\d{1,2}\/\d{1,2}\/?$/.test(trimmed)) {
            const parts = trimmed.split('/')
            const month = parts[0].padStart(2, '0')
            const day = parts[1] ? parts[1].padStart(2, '0') : null
            // Assume user wants to see current year first if not a full date query
            const year = new Date().getFullYear()

            if (!day) {
                return {
                    type: 'date',
                    value: {
                        type: 'month',
                        year,
                        month,
                    },
                }
            }

            return {
                type: 'date',
                value: {
                    type: 'day',
                    year,
                    month,
                    day,
                },
            }
        }

        // Handle MM/ | M/
        if (/^\d{1,2}\/$/.test(trimmed)) {
            const month = trimmed.replace('/', '').padStart(2, '0')
            const year = new Date().getFullYear()
            return {
                type: 'date',
                value: {
                    type: 'month',
                    year,
                    month,
                },
            }
        }

        // Name can be ship name or user name
        return { type: 'name', value: trimmed }
    }

    // Build function to handle the search and refetch logs
    // If the search bar is empty, skip fetching data
    // This prevents unnecessary api calls when clearing the input
    const handleSearch = async (query) => {
        const trimmedQuery = query.trim()

        // If the search bar is empty, show everything
        if (!trimmedQuery) {
            // Only fetch is current filters have values
            if (
                filters.jobId ||
                filters.userId ||
                (filters.dateFrom && filters.dateTo)
            ) {
                await clearFilters()
            } else {
                // Reset state without fetch
                setLogs([])
                setGroupedLogs([])
                setTotalCount(0)
                setSummary({
                    totalActions: 0,
                    newJobs: 0,
                    updatedJobs: 0,
                    recentActivity: [],
                    closedJobs: 0,
                })
                setLoading(false)
            }
            return
        }

        const result = detectSearchType(trimmedQuery)

        // If invalid search input, do not show anything
        if (!result) {
            setLogs([])
            setGroupedLogs([])
            setTotalCount(0)
            setSummary({
                totalActions: 0,
                newJobs: 0,
                updatedJobs: 0,
                recentActivity: [],
                closedJobs: 0,
            })
            setLoading(false)
            return
        }

        const newFilters = { jobId: '', dateFrom: '', dateTo: '', userId: '' }
        // handle the filter types
        switch (result.type) {
            // handle jobid
            case 'jobid':
                newFilters.jobId = result.value
                break
            // Handle name - ship name or user name
            case 'name': {
                // Check if name is a valid user
                const { data: userData, error: userError } = await supabase
                    .from('Users')
                    .select('UUID')
                    .ilike('username', `${result.value}%`)

                if (userData && userData.length > 0) {
                    // Turn objects into ID list and store it
                    const userIds = userData.map((u) => u.UUID)
                    newFilters.userId = userIds
                } else {
                    // user name does not match then ship name
                    const { data: jobsByShip, error: shipError } =
                        await supabase
                            .from('Jobs')
                            .select('id')
                            .ilike('shipName', `%${result.value}%`)

                    if (jobsByShip && jobsByShip.length > 0) {
                        newFilters.jobId = jobsByShip.map((j) => j.id)
                    } else {
                        // If name is not a ship name or a user name then show nothing
                        setLogs([])
                        setGroupedLogs([])
                        setTotalCount(0)
                        setSummary({
                            totalActions: 0,
                            newJobs: 0,
                            updatedJobs: 0,
                            recentActivity: [],
                            closedJobs: 0,
                        })
                        setLoading(false)
                        return
                    }
                }
                break
            }
            // Format date into what backend expects
            case 'date': {
                const dateObj = result.value
                // Handle invalid dates first 27/, 9/99, etc
                const month = parseInt(dateObj.month, 10)
                const day = parseInt(dateObj.day, 10)
                if (
                    (month && (month < 1 || month > 12)) ||
                    (day && (day < 1 || day > 31))
                ) {
                    // Show no results instead of screen error
                    setLogs([])
                    setGroupedLogs([])
                    setTotalCount(0)
                    setSummary({
                        totalActions: 0,
                        newJobs: 0,
                        updatedJobs: 0,
                        recentActivity: [],
                        closedJobs: 0,
                    })
                    setLoading(false)
                    return
                }
                // Handle dates
                // YYYY
                if (dateObj.type === 'year') {
                    newFilters.dateFrom = `${dateObj.value}-01-01`
                    newFilters.dateTo = `${dateObj.value}-12-31`
                }
                // YYYY-MM
                if (dateObj.type === 'month') {
                    const lastDay = new Date(
                        Number(dateObj.year),
                        Number(dateObj.month),
                        0
                    ).getDate()
                    newFilters.dateFrom = `${dateObj.year}-${dateObj.month}-01`
                    newFilters.dateTo = `${dateObj.year}-${dateObj.month}-${lastDay}`
                }
                // YYYY-MM-DD
                if (dateObj.type === 'day') {
                    newFilters.dateFrom = `${dateObj.year}-${dateObj.month}-${dateObj.day}`
                    newFilters.dateTo = `${dateObj.year}-${dateObj.month}-${dateObj.day}`
                }
                // Partial date handling so supabase does not throw error from incomplete date
                else if (dateObj.type === 'partial') {
                    if (dateObj.month) {
                        newFilters.dateFrom = `${dateObj.year || '0000'}-${
                            dateObj.month
                        }-01`
                    }
                    if (dateObj.day) {
                        newFilters.dateTo = `${dateObj.year || '9999'}-${
                            dateObj.month
                        }-${dateObj.day.padStart(2, '0')}`
                    }
                }

                break
            }
        }

        setFilters(newFilters)
        setCurrentPage(1)

        // Update the URL without causing a reload
        navigate(
            {
                pathname: '/history',
                search: `?q=${encodeURIComponent(trimmedQuery)}&page=1`,
            },
            { replace: true }
        )

        // Fetch logs ONLY if filters are valid
        if (
            newFilters.jobId ||
            newFilters.userId ||
            (newFilters.dateFrom && newFilters.dateTo)
        ) {
            await fetchLogs(1, newFilters)
            await fetchSummaryData(newFilters)
        } else {
            setLogs([])
            setGroupedLogs([])
            setTotalCount(0)
            setSummary({
                totalActions: 0,
                newJobs: 0,
                updatedJobs: 0,
                recentActivity: [],
                closedJobs: 0,
            })
            setLoading(false)
        }
    }

    // Fetch job history logs
    const fetchLogs = async (page = 1, currentFilters = filters) => {
        setLoading(true)
        setError(null)

        // capture fetchid and increment
        const fetchId = ++latestFetchID.current

        try {
            let logsData
            if (viewMode === 'grouped') {
                // Fetch grouped view - only most recent change per job
                logsData = await fetchGroupedLogs(page, currentFilters)
            } else {
                // Fetch flat view - all history records
                logsData = await fetchFlatLogs(page, currentFilters)
            }
            // only update state if the fetch is the current one
            if (fetchId === latestFetchID.current) {
                if (viewMode === 'grouped') setGroupedLogs(logsData.logs)
                else setLogs(logsData.logs)
                setTotalCount(logsData.totalCount || 0)
                setLoading(false)
            }
        } catch (err) {
            setError('An error occurred while loading data')
            console.error(err)
            setLoading(false)
        }
    }

    const fetchGroupedLogs = async (page = 1, currentFilters = filters) => {
        setLoading(true)
        setError(null)

        try {
            const offset = (page - 1) * ITEMS_PER_PAGE

            // 1. QUERY TO GET ALL RELEVANT JOB IDs (ORDERED BY RECENT ACTIVITY)
            // We fetch all records matching the filters, but we order them by change_time DESC
            // to ensure the most recently updated jobs appear first in the results.
            let jobIdsQuery = supabase
                .from('JobsHistory')
                .select('job_id, change_time')
                .order('change_time', { ascending: false }) // KEY: Orders the results by time before deduplication

            // Apply filters (Job ID, Date Range, User ID) to the initial query
            // This narrows down which history entries are considered.
            if (currentFilters.jobId) {
                if (
                    Array.isArray(currentFilters.jobId) &&
                    currentFilters.jobId.length > 0
                ) {
                    jobIdsQuery = jobIdsQuery.in('job_id', currentFilters.jobId)
                } else if (
                    typeof currentFilters.jobId === 'string' &&
                    currentFilters.jobId.trim()
                ) {
                    jobIdsQuery = jobIdsQuery.eq(
                        'job_id',
                        currentFilters.jobId.trim()
                    )
                }
            }

            if (currentFilters.dateFrom) {
                jobIdsQuery = jobIdsQuery.gte(
                    'change_time',
                    currentFilters.dateFrom
                )
            }

            if (currentFilters.dateTo) {
                // Append time to ensure the entire 'dateTo' day is included
                jobIdsQuery = jobIdsQuery.lte(
                    'change_time',
                    currentFilters.dateTo + 'T23:59:59'
                )
            }

            if (currentFilters.userId && currentFilters.userId.length > 0) {
                jobIdsQuery = jobIdsQuery.in(
                    'changed_by_user_id',
                    currentFilters.userId
                )
            }

            const { data: allJobIds, error: jobIdsError } = await jobIdsQuery

            if (jobIdsError) {
                setError(`Failed to load job IDs: ${jobIdsError.message}`)
                console.error('Job IDs error:', jobIdsError)
                setLoading(false)
                return { logs: [], totalCount: 0 }
            }

            // 2. DEDUPLICATE AND PAGINATE JOB IDs
            // We use a Map to guarantee that we only list the job_id once.
            // Since `allJobIds` is already sorted by `change_time` DESC, the first time
            // a job_id appears is the most recent activity for that job, ensuring the list
            // of unique IDs is correctly ordered by global activity time.
            const uniqueJobIdsMap = new Map()
            for (const item of allJobIds || []) {
                if (!uniqueJobIdsMap.has(item.job_id)) {
                    uniqueJobIdsMap.set(item.job_id, item.change_time)
                }
            }
            const uniqueJobIds = Array.from(uniqueJobIdsMap.keys())

            const totalUniqueJobs = uniqueJobIds.length

            // Paginate the correctly ordered unique job IDs
            const paginatedJobIds = uniqueJobIds.slice(
                offset,
                offset + ITEMS_PER_PAGE
            )

            // 3. FETCH THE LATEST LOG FOR EACH PAGINATED JOB ID
            const groupedData = []
            for (const jobId of paginatedJobIds) {
                // For each unique job ID on the current page, fetch its absolute most recent log entry.
                let query = supabase
                    .from('JobsHistory')
                    .select(
                        '*, changed_by_user_id:Users(username), job:job_id ( shipName )'
                    )
                    .eq('job_id', jobId)
                    .order('change_time', { ascending: false })
                    .limit(1)

                // Re-apply date/user filters here for maximum consistency, although
                // the initial jobIdsQuery should have already filtered out invalid records.
                if (currentFilters.dateFrom) {
                    query = query.gte('change_time', currentFilters.dateFrom)
                }

                if (currentFilters.dateTo) {
                    query = query.lte(
                        'change_time',
                        currentFilters.dateTo + 'T23:59:59'
                    )
                }

                if (currentFilters.userId && currentFilters.userId.length > 0) {
                    query = query.in(
                        'changed_by_user_id',
                        currentFilters.userId
                    )
                }

                const { data, error } = await query

                if (!error && data && data.length > 0) {
                    groupedData.push(data[0])
                }
            }

            // The final sorting is now based on the `uniqueJobIds` order (recent activity first),
            // but sorting the final 10 items is still a good safety check.
            groupedData.sort(
                (a, b) => new Date(b.change_time) - new Date(a.change_time)
            )

            const formattedLogs = groupedData.map(formatJobHistoryRecord)
            setLoading(false)
            return { logs: formattedLogs, totalCount: totalUniqueJobs }
        } catch (err) {
            // General error handling for the entire process
            setError('An error occurred while loading grouped data')
            console.error(err)
            setLoading(false)
            return { logs: [], totalCount: 0 }
        }
    }

    // Fetch flat logs (all history records)
    const fetchFlatLogs = async (page = 1, currentFilters = filters) => {
        try {
            const offset = (page - 1) * ITEMS_PER_PAGE
            let query = supabase
                .from('JobsHistory')
                .select(
                    `*, changed_by_user_id:Users(username), job:job_id ( shipName )`,
                    {
                        count: 'exact',
                    }
                )
                .order('change_time', { ascending: false })

            // Apply filters - check if job id is array or string and handle both

            if (currentFilters.jobId) {
                if (
                    Array.isArray(currentFilters.jobId) &&
                    currentFilters.jobId.length > 0
                ) {
                    query = query.in('job_id', currentFilters.jobId)
                } else if (
                    typeof currentFilters.jobId === 'string' &&
                    currentFilters.jobId.trim()
                ) {
                    query = query.eq('job_id', currentFilters.jobId.trim())
                }
            }

            if (currentFilters.dateFrom) {
                query = query.gte('change_time', currentFilters.dateFrom)
            }

            if (currentFilters.dateTo) {
                query = query.lte(
                    'change_time',
                    currentFilters.dateTo + 'T23:59:59'
                )
            }

            if (currentFilters.userId && currentFilters.userId.length > 0) {
                query = query.in('changed_by_user_id', currentFilters.userId)
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
            return { logs: formattedLogs, totalCount: count || 0 }
        } catch (err) {
            setError('An error occurred while loading flat data')
            console.error(err)
            setLoading(false)
        }
    }

    // Fetch summary data
    const fetchSummaryData = async (currentFilters = filters) => {
        try {
            let query = supabase.from('JobsHistory').select('*')

            // Filter for job id - check if array or string and handle both
            if (currentFilters.jobId) {
                if (
                    Array.isArray(currentFilters.jobId) &&
                    currentFilters.jobId.length > 0
                ) {
                    query = query.in('job_id', currentFilters.jobId)
                } else if (
                    typeof currentFilters.jobId === 'string' &&
                    currentFilters.jobId.trim()
                ) {
                    query = query.eq('job_id', currentFilters.jobId.trim())
                }
            }

            if (currentFilters.dateFrom) {
                query = query.gte('change_time', currentFilters.dateFrom)
            }

            if (currentFilters.dateTo) {
                query = query.lte(
                    'change_time',
                    currentFilters.dateTo + 'T23:59:59'
                )
            }
            if (currentFilters.userId && currentFilters.userId.length > 0) {
                query = query.in('changed_by_user_id', currentFilters.userId)
            }

            const { data, error: summaryError } = await query

            if (!summaryError && data) {
                // compute basic summary from history rows
                const totalActions = data.length
                const newJobs = data.filter((log) => !log.previous_state).length
                const updatedJobs = data.filter(
                    (log) => log.previous_state
                ).length
                const recentActivity = data.slice(0, 10)

                // derive unique job ids from history rows
                const uniqueJobIds = [
                    ...new Set(data.map((d) => d.job_id)),
                ].filter(Boolean)

                // Now query Jobs table for those job ids and count where open === false (closed)
                let closedJobsCount = 0
                if (uniqueJobIds.length > 0) {
                    const { data: jobsData, error: jobsError } = await supabase
                        .from('Jobs')
                        .select('id')
                        .in('id', uniqueJobIds)
                        .in('open', ['Filled', 'Filled by Company']) // <-- closed jobs
                    if (!jobsError && jobsData) {
                        closedJobsCount = jobsData.length
                    } else if (jobsError) {
                        console.error(
                            'Error fetching Jobs closed state:',
                            jobsError
                        )
                    }
                }

                const newSummary = {
                    totalActions,
                    newJobs,
                    updatedJobs,
                    recentActivity,
                    closedJobs: closedJobsCount,
                }
                setSummary(newSummary)
            } else {
                // if error or no data, reset summary metrics
                setSummary({
                    totalActions: 0,
                    newJobs: 0,
                    updatedJobs: 0,
                    recentActivity: [],
                    closedJobs: 0,
                })
            }
        } catch (err) {
            console.error('Error fetching summary:', err)
            setSummary({
                totalActions: 0,
                newJobs: 0,
                updatedJobs: 0,
                recentActivity: [],
                closedJobs: 0,
            })
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
        fetchSummaryData(filters)
    }

    const clearFilters = async () => {
        // Create a blank filters object to remove all filters to ensure everything is fetched again
        const clearedFilters = {
            jobId: '',
            dateFrom: '',
            dateTo: '',
            userId: '',
        }
        // Update react state so app knows filters are cleared
        setFilters(clearedFilters)
        // Reset pagination
        setCurrentPage(1)
        // Full, unfiltered job history list
        await fetchLogs(1, clearedFilters)
        // Keep summary section in sync
        await fetchSummaryData(clearedFilters)
        navigate({ pathname: '/history', search: '?page=1' }, { replace: true })
    }

    // Handle pagination
    const handlePageChange = async (newPage) => {
        setCurrentPage(newPage)
        await fetchLogs(newPage)

        // Update URL with search and page num without causing a reload on page
        const params = new URLSearchParams(location.search)
        params.set('page', newPage)
        navigate(
            {
                pathname: '/history',
                search: params.toString(),
            },
            { replace: true }
        )
    }

    // Refresh data
    const handleRefresh = async () => {
        await fetchLogs(currentPage)
        await fetchSummaryData(filters)
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

    // Open edit job modal
    const openEditJobModal = async (jobId) => {
        try {
            // Fetch the current job data
            const { data, error } = await supabase
                .from('Jobs')
                .select('*')
                .eq('id', jobId)
                .single()

            if (error) {
                console.error('Error fetching job for edit:', error)
                return
            }

            if (data) {
                setSelectedJobForEdit(data)
                setShowEditModal(true)
            }
        } catch (err) {
            console.error('Exception fetching job:', err)
        }
    }

    // Close edit job modal
    const closeEditJobModal = () => {
        setShowEditModal(false)
        setSelectedJobForEdit(null)
    }

    // Handle job save from modal
    const handleJobSave = (updatedJob) => {
        // Refresh the history view
        fetchLogs(currentPage)
        closeEditJobModal()
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
    const getFullContentForCopy = async (log) => {
        const comparison = await getJobStateComparison(
            log.previousStateFormatted,
            log.newStateFormatted
        )
        const changeDetails = comparison
            .map(
                (change) =>
                    `${change.field}: ${change.oldValue || 'N/A'} → ${
                        change.newValue || 'N/A'
                    } (${change.changeType})`
            )
            .join('\n')

        return `Job History Entry
Date: ${log.formattedDate}
User: ${log.username}
Job ID: ${log.job_id}
Action: ${log.actionType}

Changes:
${changeDetails}

Previous State:
${log.previous_state || 'N/A (New Job)'}

New State:
${log.new_state}`
    }

    // Export functionality (basic CSV export)
    const exportToCsv = () => {
        const headers = [
            'Date',
            'User',
            'Job ID',
            'Action',
            'Ship Name',
            'Location',
            'Changes Summary',
        ]
        const csvData = [
            headers.join(','),
            ...logs.map((log) =>
                [
                    log.formattedDate,
                    log.username,
                    log.job_id,
                    log.actionType,
                    'Unknown Ship',
                    'Unknown Location',
                    `"${log.changesSummary}"`,
                ].join(',')
            ),
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

    // Check if a job is closed, a job is considered closed if it's not explicitly open
    const isJobClosed = (log) => {
        const s = log?.newStateFormatted || {}
        return s.open === 'Filled' || s.open === 'Filled by Company'
    }

    // Function to edit a job's status to open, refresh the page on call
    const reopenJob = async (jobId) => {
        const { error } = await supabase
            .from('Jobs')
            .update({ open: 'Open' })
            .eq('id', jobId)

        if (error) {
            console.error(`Failed to reopen job ${jobId}:`, error)
        } else {
            console.log(`Job ${jobId} reopened (open = true).`)
            await handleRefresh()
        }
    }

    // Function to edit a job's status to open, refresh the page on call
    const reopenJobArchive = async (jobId) => {
        const { error } = await supabase
            .from('Jobs')
            .update({ archivedJob: false })
            .eq('id', jobId)

        if (error) {
            console.error(`Failed to unarchive job ${jobId}:`, error)
        } else {
            console.log(`Job ${jobId} unarchived (archivedJob = false).`)
            await handleRefresh()
        }
    }

    // Modal open/close handlers for closed jobs
    const openClosedModal = () => {
        setClosedPage(1) // reset modal page
        setExpandedClosedJobs(new Set()) // collapse all modal items on open
        setIsClosedModalOpen(true)
    }
    const closeClosedModal = () => setIsClosedModalOpen(false)

    // close modal on ESC
    useEffect(() => {
        if (!isClosedModalOpen) return
        const onKey = (e) => {
            if (e.key === 'Escape') closeClosedModal()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [isClosedModalOpen])

    // helper to set confirm pending state for a job
    const setPendingFor = (jobId, val) => {
        setConfirmPending((prev) => {
            if (val) return { ...prev, [jobId]: true }
            const copy = { ...prev }
            delete copy[jobId]
            return copy
        })
    }

    // handle click for Open?/Confirm?
    const handleOpenClick = async (e, jobId) => {
        e.stopPropagation()

        // If already updating this job, ignore clicks
        if (updatingJobs.has(String(jobId))) return

        const isPending = !!confirmPending[jobId]

        if (!isPending) {
            // start confirm window
            setPendingFor(jobId, true)
            // clear any existing timer just in case
            if (confirmTimers.current[jobId]) {
                clearTimeout(confirmTimers.current[jobId])
            }
            confirmTimers.current[jobId] = setTimeout(() => {
                // 3s elapsed, clear pending state
                setPendingFor(jobId, false)
                delete confirmTimers.current[jobId]
            }, 3000)
            return
        }

        // If pending: user clicked "Confirm?" -> proceed to update DB
        // clear the pending timer
        if (confirmTimers.current[jobId]) {
            clearTimeout(confirmTimers.current[jobId])
            delete confirmTimers.current[jobId]
        }
        setPendingFor(jobId, false)

        // Mark updating
        setUpdatingJobs((prev) => {
            const s = new Set(prev)
            s.add(String(jobId))
            return s
        })

        try {
            // Perform supabase update: set open true
            const { data, error } = await supabase
                .from('Jobs')
                .update({ open: 'Open', archivedJob: false, claimedBy: null })
                .eq('id', jobId)
            if (error) throw error

            // Optimistic UI: remove job from closedJobsList
            setClosedJobsList((prev) =>
                prev.filter((j) => String(j.id) !== String(jobId))
            )

            // update summary counts (refetch summary)
            await fetchSummaryData(filters)

            setCopySuccess(`Job ${jobId} reopened.`)
            setTimeout(() => setCopySuccess(''), 3000)
        } catch (err) {
            console.error('Failed to open job:', err)
            setCopySuccess(`Failed to open job ${jobId}`)
            setTimeout(() => setCopySuccess(''), 3000)
        } finally {
            // clear updating flag
            setUpdatingJobs((prev) => {
                const s = new Set(prev)
                s.delete(String(jobId))
                return s
            })
        }
    }

    // Fetch closed jobs + their history when modal opens
    useEffect(() => {
        if (!isClosedModalOpen) return

        let cancelled = false
        const fetchClosedJobs = async () => {
            setClosedModalLoading(true)
            try {
                setClosedPage(1)

                // 1) Get job_ids from JobsHistory that match current filters
                let jobIdsQuery = supabase.from('JobsHistory').select('job_id')

                if (filters.jobId && filters.jobId.trim())
                    jobIdsQuery = jobIdsQuery.eq('job_id', filters.jobId.trim())
                if (filters.dateFrom)
                    jobIdsQuery = jobIdsQuery.gte(
                        'change_time',
                        filters.dateFrom
                    )
                if (filters.dateTo)
                    jobIdsQuery = jobIdsQuery.lte(
                        'change_time',
                        filters.dateTo + 'T23:59:59'
                    )
                if (filters.userId && filters.userId.length > 0)
                    jobIdsQuery = jobIdsQuery.in(
                        'changed_by_user_id',
                        filters.userId
                    )

                const { data: jobIdRows, error: jobIdsError } =
                    await jobIdsQuery
                if (jobIdsError) {
                    console.error(
                        'Error fetching job IDs for closed modal:',
                        jobIdsError
                    )
                    if (!cancelled) {
                        setClosedJobsList([])
                        setClosedModalLoading(false)
                    }
                    return
                }

                // Unique job ids that appear in the filtered JobsHistory
                const uniqueJobIds = [
                    ...new Set((jobIdRows || []).map((r) => r.job_id)),
                ].filter(Boolean)
                if (uniqueJobIds.length === 0) {
                    if (!cancelled) setClosedJobsList([])
                    return
                }

                // 2) Query Jobs for those job ids and only where open === false (closed)
                const { data: jobsData, error: jobsError } = await supabase
                    .from('Jobs')
                    .select('id, FillDate, shipName, type, crewRelieved')
                    .in('id', uniqueJobIds)
                    .in('open', ['Filled', 'Filled by Company'])

                if (jobsError) {
                    console.error(
                        'Error fetching Jobs closed state (filtered):',
                        jobsError
                    )
                    if (!cancelled) setClosedJobsList([])
                    return
                }

                // DEBUG: see what's returned (remove later)
                console.log('jobsData (closed):', jobsData)

                // Map & normalize fillDate + include shipName, type, crewRelieved (with fallbacks)
                const jobs = (jobsData || []).map((j) => ({
                    id: j.id,
                    fillDate: j.FillDate || j.filldate || j.fill_date || null,
                    // prefer explicit shipName, then snake case, then generic ship
                    shipName: j.shipName ?? j.ship_name ?? j.ship ?? null,
                    type: j.type ?? null,
                    // crewRelieved may be stored in multiple forms; prefer camelCase then snake_case
                    crewRelieved: j.crewRelieved ?? j.crew_relieved ?? null,
                }))

                // Sort chronologically by fillDate (newest first)
                jobs.sort((a, b) => {
                    const da = a.fillDate ? new Date(a.fillDate).getTime() : 0
                    const db = b.fillDate ? new Date(b.fillDate).getTime() : 0
                    return db - da
                })

                // 3) For each job, fetch history records — re-applying the same history filters
                const enriched = []
                for (const job of jobs) {
                    let historyQuery = supabase
                        .from('JobsHistory')
                        .select('*, changed_by_user_id:Users(username)')
                        .eq('job_id', String(job.id))
                        .order('change_time', { ascending: true })

                    // Re-apply filters so modal history matches page filters
                    if (filters.dateFrom)
                        historyQuery = historyQuery.gte(
                            'change_time',
                            filters.dateFrom
                        )
                    if (filters.dateTo)
                        historyQuery = historyQuery.lte(
                            'change_time',
                            filters.dateTo + 'T23:59:59'
                        )
                    if (filters.userId && filters.userId.length > 0)
                        historyQuery = historyQuery.in(
                            'changed_by_user_id',
                            filters.userId
                        )

                    const { data: historyData, error: historyError } =
                        await historyQuery

                    if (historyError) {
                        console.error(
                            `Error fetching history for job ${job.id}:`,
                            historyError
                        )
                        enriched.push({
                            id: job.id,
                            fillDate: job.fillDate,
                            shipName: job.shipName,
                            type: job.type,
                            crewRelieved: job.crewRelieved,
                            history: [],
                        })
                        continue
                    }

                    const formattedHistory = await Promise.all(
                        (historyData || []).map(async (record) => {
                            const formatted = formatJobHistoryRecord(record)
                            const changes = await getJobStateComparison(
                                formatted.previousStateFormatted,
                                formatted.newStateFormatted
                            )
                            return {
                                ...formatted,
                                changes, // Add pre-calculated changes
                            }
                        })
                    )

                    enriched.push({
                        id: job.id,
                        fillDate: job.fillDate,
                        shipName: job.shipName,
                        type: job.type,
                        crewRelieved: job.crewRelieved,
                        history: formattedHistory,
                    })
                }

                if (!cancelled) {
                    console.log('enriched closedJobsList:', enriched) // debug, remove later
                    setClosedJobsList(enriched)
                }
            } catch (err) {
                console.error(
                    'Error loading closed jobs modal data (filtered):',
                    err
                )
                if (!cancelled) setClosedJobsList([])
            } finally {
                if (!cancelled) setClosedModalLoading(false)
            }
        }

        fetchClosedJobs()
        return () => {
            cancelled = true
        }
    }, [isClosedModalOpen, filters])

    // Toggle expansion of job row inside closed modal
    const toggleClosedJobExpansion = (jobId) => {
        const s = new Set(expandedClosedJobs)
        if (s.has(jobId)) s.delete(jobId)
        else s.add(jobId)
        setExpandedClosedJobs(s)
    }

    // Pagination handlers for closed modal
    const goToClosedPrev = () => {
        setClosedPage((p) => Math.max(1, p - 1))
    }
    const goToClosedNext = () => {
        setClosedPage((p) => {
            const total = Math.max(
                1,
                Math.ceil(closedJobsList.length / closedItemsPerPage)
            )
            return Math.min(total, p + 1)
        })
    }

    // Keep closedPage in valid bounds if list length or per-page size changes
    useEffect(() => {
        const total = Math.max(
            1,
            Math.ceil(closedJobsList.length / closedItemsPerPage)
        )
        if (closedPage > total) setClosedPage(total)
        if (closedPage < 1) setClosedPage(1)
    }, [closedJobsList, closedItemsPerPage, closedPage])

    const formatDateForDisplay = (d) => {
        if (!d) return '—'
        try {
            const dt = new Date(d)
            if (isNaN(dt.getTime())) return String(d)
            return dt.toLocaleString()
        } catch {
            return String(d)
        }
    }

    // Derived values used in modal UI (must be computed before return/JSX)
    const totalClosedPages = Math.max(
        1,
        Math.ceil(closedJobsList.length / closedItemsPerPage)
    )
    const closedStartIndex = (closedPage - 1) * closedItemsPerPage
    const closedEndIndex = Math.min(
        closedStartIndex + closedItemsPerPage,
        closedJobsList.length
    )
    const closedPageItems = closedJobsList.slice(
        closedStartIndex,
        closedEndIndex
    )

    // CLEANUP: clear any confirm timers if modal closed or component unmounts
    useEffect(() => {
        if (!isClosedModalOpen) {
            // Clear pending states and timers when modal closes
            Object.values(confirmTimers.current).forEach((t) => clearTimeout(t))
            confirmTimers.current = {}
            setConfirmPending({})
        }
    }, [isClosedModalOpen])

    useEffect(() => {
        return () => {
            Object.values(confirmTimers.current).forEach((t) => clearTimeout(t))
            confirmTimers.current = {}
        }
    }, [])

    const getActionColorClasses = (actionType) => {
        // Ensure case-insensitivity and default to an empty string if null/undefined
        const type = actionType ? actionType.toLowerCase() : ''

        switch (type) {
            case 'created':
                // Green for new jobs
                return 'bg-green-100 text-green-800'
            case 'updated':
                // Blue for changes/updates
                return 'bg-blue-100 text-blue-800'
            case 'filled':
            case 'filled by company':
                // Red for closed jobs
                return 'bg-red-100 text-red-800'
            case 'archived':
                // Gray/Yellow for less critical states
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
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
                {/*Title text*/}
                <div className='grow text-center'>
                    <span className='text-white text-2xl font-medium'>
                        Job Board History & Changes
                    </span>
                </div>
                {/* Search Bar */}
                <div className='grow mx-4 relative overflow-visible'>
                    <input
                        type='text'
                        placeholder='Search by Username, Job ID, Date, or Vessel'
                        className='w-full py-2 pl-4 pr-10 rounded-lg text-sm text-gray-700 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {/* Spinner | Clear button */}
                    <div className='absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center'>
                        {loading ? (
                            <div className='animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full w-4 h-4'></div>
                        ) : searchQuery ? (
                            <button
                                data-testid='clearButton'
                                onClick={() => {
                                    setSearchQuery('')
                                }}
                                className='text-gray-400 hover:text-gray-600 bg-white rounded-full p-1'
                            >
                                <IoClose className='w-4 h-4' />
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* icons */}
                <div className='flex gap-2 mr-4'>
                    <button
                        onClick={toggleViewMode}
                        className='bg-mebablue-light hover:bg-mebablue-hover p-2 rounded text-white'
                        title={
                            viewMode === 'grouped'
                                ? 'Switch to Flat View'
                                : 'Switch to Grouped View'
                        }
                    >
                        <IoListOutline className='w-5 h-5' />
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
                    {viewMode === 'grouped'
                        ? '📊 Grouped View: Showing most recent change per job. Click a row to view full history.'
                        : '📋 Flat View: Showing all history records chronologically.'}
                </div>
            </div>

            {/* Summary Cards - now 4 cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>
                        {viewMode === 'grouped'
                            ? 'Unique Jobs with Changes'
                            : 'Total History Records'}
                    </div>
                    <div className='text-2xl font-bold text-mebablue-dark'>
                        {summary.totalActions || 0}
                    </div>
                </div>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>Jobs Created</div>
                    <div className='text-2xl font-bold text-green-600'>
                        {summary.newJobs || 0}
                    </div>
                </div>
                <div className='bg-white rounded-lg shadow p-4'>
                    <div className='text-sm text-gray-600'>Jobs Updated</div>
                    <div className='text-2xl font-bold text-blue-600'>
                        {summary.updatedJobs || 0}
                    </div>
                </div>

                {/* Jobs Closed card converted to a clickable button. */}
                <button
                    type='button'
                    onClick={openClosedModal}
                    aria-label='Jobs Closed'
                    className='bg-white rounded-lg shadow p-4 text-left transition-colors hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer'
                >
                    <div className='text-sm text-gray-600'>Jobs Closed</div>
                    <div className='text-2xl font-bold text-red-600'>
                        {summary.closedJobs || 0}
                    </div>
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className='flex flex-col items-center gap-2 text-gray-600'>
                    <div className='w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin'></div>
                    <div>Loading history...</div>
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
                <div className='fixed top-4 right-4 z-50'>
                    <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-md'>
                        {copySuccess}
                    </div>
                </div>
            )}

            {/* Job History Table */}
            {!loading && !error && (
                <div className='bg-white rounded-lg shadow overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full divide-y divide-gray-200 table-fixed'>
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th className='px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8'></th>
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
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]'>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                {(viewMode === 'grouped'
                                    ? groupedLogs
                                    : logs
                                ).map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            className={`hover:bg-gray-50 ${
                                                viewMode === 'grouped'
                                                    ? 'cursor-pointer'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                viewMode === 'grouped' &&
                                                openHistoryPopout(
                                                    log.job_id,
                                                    log
                                                )
                                            }
                                        >
                                            <td className='px-2 py-4 text-center'>
                                                {viewMode === 'grouped' ? (
                                                    <IoChevronDown className='w-5 h-5 text-gray-400' />
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleRowExpansion(
                                                                log.id
                                                            )
                                                        }}
                                                        className='text-gray-400 hover:text-gray-600'
                                                    >
                                                        {expandedRows.has(
                                                            log.id
                                                        ) ? (
                                                            <IoChevronUp className='w-5 h-5' />
                                                        ) : (
                                                            <IoChevronDown className='w-5 h-5' />
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-900 truncate max-w-[140px]'>
                                                <div className='text-base'>
                                                    {log.formattedDateTime.date}
                                                </div>
                                                {/* This <div> holds the time and forces a line break */}
                                                <div className=' text-gray-500 mt-0.5'>
                                                    {log.formattedDateTime.time}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-900 truncate max-w-[140px]'>
                                                {log.username}
                                            </td>
                                            <td className='px-6 py-4 text-sm font-mono text-gray-900 truncate max-w-[80px]'>
                                                {log.job_id}
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-900 truncate max-w-[180px] break-words'>
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        getActionColorClasses(
                                                            log.actionType
                                                        ) // Call the helper function here
                                                    }`}
                                                >
                                                    {log.actionType}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-500 break-words max-w-[250px]'>
                                                <div className='font-medium'>
                                                    {log.job?.shipName ??
                                                        log.job?.ship_name ??
                                                        'Unknown Ship'}
                                                </div>
                                                <div className='text-gray-500'>
                                                    {viewMode === 'grouped'
                                                        ? 'Click to view full history'
                                                        : 'View details in expanded view'}
                                                </div>
                                            </td>

                                            {/* Changes Summary */}
                                            <HistoryChangesSummary log={log} />
                                            {/* Actions */}
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-right w-[120px]'>
                                                {isJobClosed(log) &&
                                                    (() => {
                                                        const jobId = log.job_id
                                                        const isPendingMain =
                                                            !!confirmPending[
                                                                jobId
                                                            ]
                                                        const isUpdatingMain =
                                                            updatingJobs.has(
                                                                String(jobId)
                                                            )

                                                        return (
                                                            <button
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    // delegate to the shared handler that implements the 3s confirm window
                                                                    // handleOpenClick will call e.stopPropagation() itself but we keep this here
                                                                    // so clicks don't bubble if anything changes later.
                                                                    e.stopPropagation()
                                                                    handleOpenClick(
                                                                        e,
                                                                        jobId
                                                                    )
                                                                }}
                                                                // while waiting for confirmation the button turns grey (visual cue) but remains clickable
                                                                className={`px-2 py-1 rounded text-sm focus:outline-none transition-colors ${
                                                                    isUpdatingMain
                                                                        ? 'bg-gray-400 cursor-wait text-white'
                                                                        : isPendingMain
                                                                        ? 'bg-gray-200 text-gray-500' // grey while waiting for confirmation
                                                                        : 'text-mebablue-dark hover:text-mebablue-hover'
                                                                }`}
                                                                title={
                                                                    isPendingMain
                                                                        ? 'Click again to confirm'
                                                                        : 'Reopen job'
                                                                }
                                                                aria-pressed={
                                                                    isPendingMain
                                                                }
                                                                aria-label={
                                                                    isPendingMain
                                                                        ? `Confirm reopen job ${jobId}`
                                                                        : `Reopen job ${jobId}`
                                                                }
                                                            >
                                                                {isUpdatingMain ? (
                                                                    'Opening...'
                                                                ) : isPendingMain ? (
                                                                    'Confirm?'
                                                                ) : (
                                                                    <IoRefresh className='w-4 h-4' />
                                                                )}
                                                            </button>
                                                        )
                                                    })()}

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        openEditJobModal(
                                                            log.job_id
                                                        )
                                                    }}
                                                    className='text-blue-600 hover:text-blue-800'
                                                    title='Edit Job'
                                                >
                                                    <svg
                                                        className='w-4 h-4'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation()
                                                        const content =
                                                            await getFullContentForCopy(
                                                                log
                                                            )
                                                        copyToClipboard(
                                                            content,
                                                            log.id
                                                        )
                                                    }}
                                                    className='text-mebablue-dark hover:text-mebablue-hover'
                                                    title='Copy full details'
                                                >
                                                    <IoCopy className='w-4 h-4' />
                                                </button>
                                            </td>
                                        </tr>
                                        {viewMode === 'flat' &&
                                            expandedRows.has(log.id) && (
                                                <tr>
                                                    <td
                                                        colSpan='8'
                                                        className='px-6 py-4 bg-gray-50'
                                                    >
                                                        <div className='space-y-4'>
                                                            <div className='flex justify-between items-center'>
                                                                <h4 className='text-lg font-semibold text-gray-900'>
                                                                    Change
                                                                    Summary
                                                                </h4>
                                                                <button
                                                                    onClick={async (
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation()
                                                                        const content =
                                                                            await getFullContentForCopy(
                                                                                log
                                                                            )
                                                                        copyToClipboard(
                                                                            content,
                                                                            log.id
                                                                        )
                                                                    }}
                                                                    className='bg-mebablue-dark text-white px-3 py-1 rounded text-sm hover:bg-mebablue-hover flex items-center gap-2'
                                                                >
                                                                    <IoCopy className='w-4 h-4' />
                                                                    Copy All
                                                                </button>
                                                            </div>

                                                            {/* Spreadsheet-style Field Changes Table */}
                                                            <div className='mb-4'>
                                                                <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                                                                    <table className='min-w-full divide-y divide-gray-200'>
                                                                        <thead className='bg-gray-100'>
                                                                            <tr>
                                                                                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase'>
                                                                                    Field
                                                                                </th>
                                                                                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase'>
                                                                                    Previous
                                                                                    Value
                                                                                </th>
                                                                                <th className='px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-24'>
                                                                                    Change
                                                                                </th>
                                                                                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase'>
                                                                                    New
                                                                                    Value
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className='bg-white divide-y divide-gray-200'>
                                                                            {getJobStateComparison(
                                                                                log.previousStateFormatted,
                                                                                log.newStateFormatted
                                                                            ).map(
                                                                                (
                                                                                    change,
                                                                                    index
                                                                                ) => (
                                                                                    <tr
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className='hover:bg-gray-50'
                                                                                    >
                                                                                        <td className='px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap'>
                                                                                            {
                                                                                                change.field
                                                                                            }
                                                                                        </td>
                                                                                        <td className='px-4 py-3 text-sm text-gray-700'>
                                                                                            {change.oldValue || (
                                                                                                <span className='text-gray-400 italic'>
                                                                                                    None
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className='px-4 py-3 text-center'>
                                                                                            <span
                                                                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                                                    change.changeType ===
                                                                                                    'added'
                                                                                                        ? 'bg-green-100 text-green-800'
                                                                                                        : change.changeType ===
                                                                                                          'removed'
                                                                                                        ? 'bg-red-100 text-red-800'
                                                                                                        : 'bg-blue-100 text-blue-800'
                                                                                                }`}
                                                                                            >
                                                                                                {change.changeType ===
                                                                                                'added'
                                                                                                    ? '+ Added'
                                                                                                    : change.changeType ===
                                                                                                      'removed'
                                                                                                    ? '- Removed'
                                                                                                    : '↻ Modified'}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className='px-4 py-3 text-sm text-gray-700'>
                                                                                            {change.newValue || (
                                                                                                <span className='text-gray-400 italic'>
                                                                                                    None
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>

                                                            {/* Complete Job Snapshot */}
                                                            <div className='mt-4'>
                                                                <h5 className='font-medium text-gray-900 mb-2'>
                                                                    Complete Job
                                                                    Snapshot
                                                                </h5>
                                                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                                                                    {log.previousStateFormatted && (
                                                                        <div>
                                                                            <div className='text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider'>
                                                                                Before
                                                                                Changes
                                                                            </div>
                                                                            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden max-h-80 overflow-y-auto'>
                                                                                <table className='min-w-full divide-y divide-gray-200'>
                                                                                    <tbody className='bg-white divide-y divide-gray-100'>
                                                                                        {Object.entries(
                                                                                            log.previousStateFormatted
                                                                                        ).map(
                                                                                            (
                                                                                                [
                                                                                                    key,
                                                                                                    value,
                                                                                                ],
                                                                                                idx
                                                                                            ) => (
                                                                                                <tr
                                                                                                    key={
                                                                                                        idx
                                                                                                    }
                                                                                                    className='hover:bg-gray-50'
                                                                                                >
                                                                                                    <td className='px-3 py-2 text-xs font-medium text-gray-600 w-1/3'>
                                                                                                        {
                                                                                                            key
                                                                                                        }
                                                                                                    </td>
                                                                                                    <td className='px-3 py-2 text-xs text-gray-900'>
                                                                                                        {value !==
                                                                                                            null &&
                                                                                                        value !==
                                                                                                            undefined ? (
                                                                                                            String(
                                                                                                                value
                                                                                                            )
                                                                                                        ) : (
                                                                                                            <span className='text-gray-400 italic'>
                                                                                                                null
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            )
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div>
                                                                        <div className='text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider'>
                                                                            {log.previousStateFormatted
                                                                                ? 'After Changes'
                                                                                : 'Job Created'}
                                                                        </div>
                                                                        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden max-h-80 overflow-y-auto'>
                                                                            <table className='min-w-full divide-y divide-gray-200'>
                                                                                <tbody className='bg-white divide-y divide-gray-100'>
                                                                                    {Object.entries(
                                                                                        log.newStateFormatted
                                                                                    ).map(
                                                                                        (
                                                                                            [
                                                                                                key,
                                                                                                value,
                                                                                            ],
                                                                                            idx
                                                                                        ) => (
                                                                                            <tr
                                                                                                key={
                                                                                                    idx
                                                                                                }
                                                                                                className='hover:bg-gray-50'
                                                                                            >
                                                                                                <td className='px-3 py-2 text-xs font-medium text-gray-600 w-1/3'>
                                                                                                    {
                                                                                                        key
                                                                                                    }
                                                                                                </td>
                                                                                                <td className='px-3 py-2 text-xs text-gray-900'>
                                                                                                    {value !==
                                                                                                        null &&
                                                                                                    value !==
                                                                                                        undefined ? (
                                                                                                        String(
                                                                                                            value
                                                                                                        )
                                                                                                    ) : (
                                                                                                        <span className='text-gray-400 italic'>
                                                                                                            null
                                                                                                        </span>
                                                                                                    )}
                                                                                                </td>
                                                                                            </tr>
                                                                                        )
                                                                                    )}
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
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}{' '}
                                to{' '}
                                {Math.min(
                                    currentPage * ITEMS_PER_PAGE,
                                    totalCount
                                )}{' '}
                                of {totalCount} results
                            </div>
                            <div className='flex gap-2'>
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    className='px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
                                >
                                    Previous
                                </button>
                                {Array.from(
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                        const page =
                                            i + Math.max(1, currentPage - 2)
                                        if (page > totalPages) return null
                                        return (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    handlePageChange(page)
                                                }
                                                className={`px-3 py-2 border rounded text-sm ${
                                                    page === currentPage
                                                        ? 'bg-mebablue-dark text-white'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    }
                                )}
                                <button
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
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
            {!loading &&
                !error &&
                (viewMode === 'grouped' ? groupedLogs : logs).length === 0 && (
                    <div className='text-center py-12'>
                        <div className='text-gray-500 text-lg'>
                            No history found
                        </div>
                        <div className='text-gray-400 text-sm mt-2'>
                            Try adjusting your filters or check back later
                        </div>
                    </div>
                )}

            {/* History Popout */}
            {selectedJobId && (
                <HistoryPopout
                    jobId={selectedJobId}
                    onClose={closeHistoryPopout}
                    initialData={groupedLogs.find(
                        (log) => log.job_id === selectedJobId
                    )}
                />
            )}

            {/* Jobs Closed Modal */}
            {isClosedModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center'>
                    <div
                        className='absolute inset-0 bg-black/40'
                        onClick={closeClosedModal}
                        aria-hidden='true'
                    />
                    <div className='relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 p-4 z-10'>
                        <button
                            type='button'
                            onClick={closeClosedModal}
                            className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
                            aria-label='Close closed jobs modal'
                        >
                            <IoClose className='w-5 h-5' />
                        </button>

                        <h2 className='text-lg font-semibold mb-2'>
                            Closed Jobs
                        </h2>

                        {closedModalLoading ? (
                            <div className='py-8 flex flex-col items-center gap-2'>
                                <div className='w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin'></div>
                                <div className='text-sm text-gray-600'>
                                    Loading closed jobs...
                                </div>
                            </div>
                        ) : closedJobsList.length === 0 ? (
                            <div className='text-sm text-gray-600 py-6'>
                                No closed jobs found.
                            </div>
                        ) : (
                            <>
                                <div className='max-h-[60vh] overflow-y-auto'>
                                    <ul className='divide-y divide-gray-200'>
                                        {closedPageItems.map((job) => {
                                            const isExpanded =
                                                expandedClosedJobs.has(
                                                    String(job.id)
                                                )
                                            const isPending =
                                                !!confirmPending[job.id]
                                            const isUpdating = updatingJobs.has(
                                                String(job.id)
                                            )
                                            return (
                                                <li
                                                    key={job.id}
                                                    className='py-3'
                                                >
                                                    <div className='flex items-start gap-3'>
                                                        <div className='flex-shrink-0'>
                                                            <button
                                                                type='button'
                                                                onClick={(e) =>
                                                                    handleOpenClick(
                                                                        e,
                                                                        job.id
                                                                    )
                                                                }
                                                                className={`text-white px-3 py-1 rounded text-sm focus:outline-none ${
                                                                    isUpdating
                                                                        ? 'bg-gray-400 cursor-wait'
                                                                        : isPending
                                                                        ? 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                                                                        : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                                                                }`}
                                                                aria-label={`Open job ${job.id}`}
                                                                disabled={
                                                                    isUpdating
                                                                }
                                                            >
                                                                {isUpdating
                                                                    ? 'Opening...'
                                                                    : isPending
                                                                    ? 'Confirm?'
                                                                    : 'Open?'}
                                                            </button>
                                                        </div>

                                                        {/* Main expandable content (click expands/collapses) */}
                                                        <div className='flex-1'>
                                                            <button
                                                                type='button'
                                                                onClick={() =>
                                                                    toggleClosedJobExpansion(
                                                                        String(
                                                                            job.id
                                                                        )
                                                                    )
                                                                }
                                                                aria-expanded={
                                                                    isExpanded
                                                                }
                                                                aria-controls={`closed-job-history-${job.id}`}
                                                                className='w-full text-left flex items-center justify-between gap-4 p-3 rounded hover:bg-gray-100 active:bg-gray-200 focus:outline-none'
                                                            >
                                                                <div className='ml-1'>
                                                                    <div className='text-sm font-medium text-gray-900'>
                                                                        Job #
                                                                        {job.id}
                                                                        {job.shipName ? (
                                                                            <span className='text-sm font-medium text-gray-600 ml-2'>
                                                                                —{' '}
                                                                                {
                                                                                    job.shipName
                                                                                }
                                                                            </span>
                                                                        ) : null}
                                                                    </div>

                                                                    <div className='text-xs text-gray-500 mt-1'>
                                                                        <span>
                                                                            Type:{' '}
                                                                            {job.type ??
                                                                                '—'}
                                                                        </span>
                                                                        <span className='mx-2'>
                                                                            ·
                                                                        </span>
                                                                        <span>
                                                                            Crew
                                                                            Relieved:{' '}
                                                                            {job.crewRelieved !==
                                                                                null &&
                                                                            job.crewRelieved !==
                                                                                undefined
                                                                                ? String(
                                                                                      job.crewRelieved
                                                                                  )
                                                                                : '—'}
                                                                        </span>
                                                                        <span className='mx-2'>
                                                                            ·
                                                                        </span>
                                                                        <span>
                                                                            FillDate:{' '}
                                                                            {formatDateForDisplay(
                                                                                job.fillDate
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className='flex items-center gap-2'>
                                                                    {isExpanded ? (
                                                                        <IoChevronUp className='w-5 h-5 text-gray-600' />
                                                                    ) : (
                                                                        <IoChevronDown className='w-5 h-5 text-gray-600' />
                                                                    )}
                                                                </div>
                                                            </button>

                                                            {isExpanded && (
                                                                <div
                                                                    id={`closed-job-history-${job.id}`}
                                                                    className='mt-3 bg-gray-50 rounded p-3'
                                                                >
                                                                    {job.history
                                                                        .length ===
                                                                    0 ? (
                                                                        <div className='text-sm text-gray-500'>
                                                                            No
                                                                            history
                                                                            entries
                                                                            for
                                                                            this
                                                                            job.
                                                                        </div>
                                                                    ) : (
                                                                        <div className='space-y-3'>
                                                                            {job.history.map(
                                                                                (
                                                                                    entry
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            entry.id
                                                                                        }
                                                                                        className='bg-white border border-gray-200 rounded px-3 py-2'
                                                                                    >
                                                                                        <div className='flex items-start justify-between'>
                                                                                            <div>
                                                                                                <div className='text-xs text-gray-600'>
                                                                                                    {
                                                                                                        entry.formattedDate
                                                                                                    }
                                                                                                </div>
                                                                                                <div className='text-sm font-medium'>
                                                                                                    {entry.username ||
                                                                                                        'Unknown User'}
                                                                                                </div>
                                                                                                <div className='text-xs text-gray-500'>
                                                                                                    {entry.isNewJob
                                                                                                        ? 'Created'
                                                                                                        : 'Updated'}
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className='flex items-center gap-2'>
                                                                                                <button
                                                                                                    onClick={async (
                                                                                                        e
                                                                                                    ) => {
                                                                                                        e.stopPropagation()
                                                                                                        const content =
                                                                                                            await getFullContentForCopy(
                                                                                                                entry
                                                                                                            )
                                                                                                        copyToClipboard(
                                                                                                            content,
                                                                                                            entry.id
                                                                                                        )
                                                                                                    }}
                                                                                                    className='text-mebablue-dark hover:text-mebablue-hover'
                                                                                                    title='Copy full details'
                                                                                                >
                                                                                                    <IoCopy className='w-5 h-5' />
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className='mt-2 text-xs text-gray-700'>
                                                                                            {(() => {
                                                                                                const changes =
                                                                                                    entry.changes ||
                                                                                                    []
                                                                                                if (
                                                                                                    !changes ||
                                                                                                    changes.length ===
                                                                                                        0
                                                                                                )
                                                                                                    return (
                                                                                                        <span className='text-gray-400 italic'>
                                                                                                            No
                                                                                                            changes
                                                                                                            recorded
                                                                                                        </span>
                                                                                                    )
                                                                                                return (
                                                                                                    <div className='flex flex-wrap gap-2'>
                                                                                                        {changes
                                                                                                            .slice(
                                                                                                                0,
                                                                                                                6
                                                                                                            )
                                                                                                            .map(
                                                                                                                (
                                                                                                                    c,
                                                                                                                    i
                                                                                                                ) => (
                                                                                                                    <span
                                                                                                                        key={
                                                                                                                            i
                                                                                                                        }
                                                                                                                        className='inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700'
                                                                                                                    >
                                                                                                                        {
                                                                                                                            c.field
                                                                                                                        }

                                                                                                                        :{' '}
                                                                                                                        {String(
                                                                                                                            c.newValue ??
                                                                                                                                'None'
                                                                                                                        )}
                                                                                                                    </span>
                                                                                                                )
                                                                                                            )}
                                                                                                        {changes.length >
                                                                                                            6 && (
                                                                                                            <span className='text-xs text-gray-400 italic'>
                                                                                                                +
                                                                                                                {changes.length -
                                                                                                                    6}{' '}
                                                                                                                more
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )
                                                                                            })()}
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>

                                {/* Pagination controls for closed modal */}
                                <div className='mt-4 flex items-center justify-between'>
                                    <div className='text-sm text-gray-600'>
                                        Showing {closedStartIndex + 1}–
                                        {closedEndIndex} of{' '}
                                        {closedJobsList.length}
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <button
                                            onClick={goToClosedPrev}
                                            disabled={closedPage === 1}
                                            className='px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
                                        >
                                            Previous
                                        </button>

                                        <div className='text-sm text-gray-700 px-2'>
                                            Page {closedPage} /{' '}
                                            {totalClosedPages}
                                        </div>

                                        <button
                                            onClick={goToClosedNext}
                                            disabled={
                                                closedPage === totalClosedPages
                                            }
                                            className='px-3 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* optional footer with a close action */}
                        <div className='mt-4 flex justify-end'>
                            <button
                                type='button'
                                onClick={closeClosedModal}
                                className='px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 active:bg-gray-300 focus:outline-none'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Job Modal */}
            {showEditModal && selectedJobForEdit && (
                <EditJobModal
                    jobData={selectedJobForEdit}
                    onClose={closeEditJobModal}
                    onSave={handleJobSave}
                />
            )}
        </div>
    )
}

export default ViewHistory
