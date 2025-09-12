import { supabase } from '../supabaseClient'

/**
 * Fetch audit logs with filtering and pagination
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of records to fetch
 * @param {number} options.offset - Number of records to skip
 * @param {string} options.action - Filter by action type
 * @param {string} options.dateFrom - Filter from date (ISO string)
 * @param {string} options.dateTo - Filter to date (ISO string)
 * @param {string} options.userId - Filter by user ID
 * @returns {Promise<{data: Array, error: any, count: number}>}
 */
export async function fetchAuditLogs({
    limit = 50,
    offset = 0,
    action = null,
    dateFrom = null,
    dateTo = null,
    userId = null
} = {}) {
    try {
        let query = supabase
            .from('audit_log')
            .select('*', { count: 'exact' })
            .order('timestamp', { ascending: false })

        // Apply filters
        if (action && action !== 'ALL') {
            query = query.eq('action', action)
        }

        if (dateFrom) {
            query = query.gte('timestamp', dateFrom)
        }

        if (dateTo) {
            query = query.lte('timestamp', dateTo)
        }

        if (userId) {
            query = query.eq('user_id', userId)
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1)

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching audit logs:', error)
            return { data: [], error, count: 0 }
        }

        return { data: data || [], error: null, count: count || 0 }
    } catch (err) {
        console.error('Exception fetching audit logs:', err)
        return { data: [], error: err, count: 0 }
    }
}

/**
 * Fetch audit logs for a specific job
 * @param {string} jobId - Job ID to get history for
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function fetchJobHistory(jobId) {
    try {
        const { data, error } = await supabase
            .from('audit_log')
            .select('*')
            .eq('table_name', 'Jobs')
            .eq('record_id', jobId)
            .order('timestamp', { ascending: false })

        if (error) {
            console.error('Error fetching job history:', error)
            return { data: [], error }
        }

        return { data: data || [], error: null }
    } catch (err) {
        console.error('Exception fetching job history:', err)
        return { data: [], error: err }
    }
}

/**
 * Get summary statistics for audit logs
 * @param {Object} options - Query options
 * @param {string} options.dateFrom - Filter from date
 * @param {string} options.dateTo - Filter to date
 * @returns {Promise<{data: Object, error: any}>}
 */
export async function fetchAuditSummary({ dateFrom = null, dateTo = null } = {}) {
    try {
        let query = supabase
            .from('audit_log')
            .select('action, user_email, timestamp')

        if (dateFrom) {
            query = query.gte('timestamp', dateFrom)
        }

        if (dateTo) {
            query = query.lte('timestamp', dateTo)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching audit summary:', error)
            return { data: {}, error }
        }

        // Process data to create summary
        const summary = {
            totalActions: data.length,
            actionCounts: {},
            userCounts: {},
            recentActivity: data.slice(0, 10)
        }

        // Count actions
        data.forEach(log => {
            summary.actionCounts[log.action] = (summary.actionCounts[log.action] || 0) + 1
            summary.userCounts[log.user_email] = (summary.userCounts[log.user_email] || 0) + 1
        })

        return { data: summary, error: null }
    } catch (err) {
        console.error('Exception fetching audit summary:', err)
        return { data: {}, error: err }
    }
}

/**
 * Manually log a job claim action
 * @param {string} jobId - Job ID that was claimed
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function logJobClaim(jobId) {
    try {
        const { data, error } = await supabase.rpc('log_job_claim', {
            job_id: jobId,
            claimed_by_user: (await supabase.auth.getUser()).data.user?.id
        })

        if (error) {
            console.error('Error logging job claim:', error)
            return { success: false, error }
        }

        return { success: true, error: null }
    } catch (err) {
        console.error('Exception logging job claim:', err)
        return { success: false, error: err }
    }
}

/**
 * Format audit log data for display
 * @param {Object} log - Raw audit log entry
 * @returns {Object} Formatted log entry
 */
export function formatAuditLog(log) {
    const actionMessages = {
        'INSERT': 'created a new job',
        'UPDATE': 'updated job',
        'DELETE': 'deleted job',
        'CLAIM': 'claimed job'
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getChangedFieldsText = (changedFields, oldData, newData) => {
        if (!changedFields || changedFields.length === 0) return ''
        
        const fieldChanges = changedFields.map(field => {
            const oldVal = oldData?.[field]
            const newVal = newData?.[field]
            return `${field}: "${oldVal}" → "${newVal}"`
        })
        
        return fieldChanges.join(', ')
    }

    return {
        ...log,
        actionText: actionMessages[log.action] || log.action,
        formattedDate: formatDate(log.timestamp),
        changedFieldsText: getChangedFieldsText(log.changed_fields, log.old_data, log.new_data),
        shipName: log.new_data?.shipName || log.old_data?.shipName || 'Unknown',
        jobLocation: log.new_data?.location || log.old_data?.location || 'Unknown'
    }
}

/**
 * Get user activity summary
 * @param {Object} options - Query options
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function fetchUserActivity({ 
    limit = 10,
    dateFrom = null,
    dateTo = null 
} = {}) {
    try {
        let query = supabase
            .from('audit_log')
            .select('user_email, action, timestamp, new_data')
            .not('user_email', 'is', null)
            .order('timestamp', { ascending: false })

        if (dateFrom) {
            query = query.gte('timestamp', dateFrom)
        }

        if (dateTo) {
            query = query.lte('timestamp', dateTo)
        }

        if (limit) {
            query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching user activity:', error)
            return { data: [], error }
        }

        return { data: data || [], error: null }
    } catch (err) {
        console.error('Exception fetching user activity:', err)
        return { data: [], error: err }
    }
}