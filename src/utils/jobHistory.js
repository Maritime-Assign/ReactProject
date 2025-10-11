import { supabase } from '../api/supabaseClient'

/**
 * Log job history when a job is created or updated
 * @param {string} jobId - The ID of the job
 * @param {string} userId - The ID of the user making the change
 * @param {Object|null} previousState - The previous state of the job (null for new jobs)
 * @param {Object} newState - The new state of the job
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function logJobHistory(jobId, userId, previousState, newState) {
    try {
        const { data, error } = await supabase
            .from('JobsHistory')
            .insert({
                job_id: jobId,
                changed_by_user_id: userId,
                previous_state: previousState ? JSON.stringify(previousState) : null,
                new_state: JSON.stringify(newState),
                change_time: new Date().toISOString()
            })

        if (error) {
            console.error('Error logging job history:', error)
            return { success: false, error }
        }

        return { success: true, error: null }
    } catch (err) {
        console.error('Exception logging job history:', err)
        return { success: false, error: err }
    }
}

/**
 * Fetch job history for a specific job
 * @param {string} jobId - The ID of the job
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function fetchJobHistory(jobId) {
    try {
        const { data, error } = await supabase
            .from('JobsHistory')
            .select(`*`)
            .eq('job_id', jobId)
            .order('change_time', { ascending: false })

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
 * Add a new job and log the history
 * @param {Object} jobData - The job data to add
 * @param {string} userId - The ID of the user creating the job
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function addJobWithHistory(jobData, userId) {
    try {
        // Start a transaction by inserting the job first
        const { data: newJob, error: jobError } = await supabase
            .from('Jobs')
            .insert(jobData)
            .select()
            .single()

        if (jobError) {
            console.error('Error adding job:', jobError)
            return { success: false, data: null, error: jobError }
        }

        // Log the history for the new job
        const historyResult = await logJobHistory(newJob.id, userId, null, newJob)
        
        if (!historyResult.success) {
            console.warn('Job was created but history logging failed:', historyResult.error)
        }

        return { success: true, data: newJob, error: null }
    } catch (err) {
        console.error('Exception adding job with history:', err)
        return { success: false, data: null, error: err }
    }
}

/**
 * Update a job and log the history
 * @param {string} jobId - The ID of the job to update
 * @param {Object} updatedData - The updated job data
 * @param {string} userId - The ID of the user making the update
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function updateJobWithHistory(jobId, updatedData, userId) {
    try {
        // First, get the current state of the job
        const { data: currentJob, error: fetchError } = await supabase
            .from('Jobs')
            .select('*')
            .eq('id', jobId)
            .single()

        if (fetchError) {
            console.error('Error fetching current job state:', fetchError)
            return { success: false, data: null, error: fetchError }
        }

        // Update the job
        const { data: updatedJob, error: updateError } = await supabase
            .from('Jobs')
            .update(updatedData)
            .eq('id', jobId)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating job:', updateError)
            return { success: false, data: null, error: updateError }
        }

        // Log the history
        const historyResult = await logJobHistory(jobId, userId, currentJob, updatedJob)
        
        if (!historyResult.success) {
            console.warn('Job was updated but history logging failed:', historyResult.error)
        }

        return { success: true, data: updatedJob, error: null }
    } catch (err) {
        console.error('Exception updating job with history:', err)
        return { success: false, data: null, error: err }
    }
}

/**
 * Format job history data for display
 * @param {Object} historyRecord - Raw history record from database
 * @returns {Object} Formatted history record
 */
export function formatJobHistoryRecord(historyRecord) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const formatState = (stateString) => {
        if (!stateString) return null
        try {
            return JSON.parse(stateString)
        } catch (err) {
            console.warn('Failed to parse state JSON:', err)
            return stateString
        }
    }

    const generateChangesSummary = (previousState, newState) => {
        if (!previousState) {
            return 'Job created'
        }

        const changes = []
        const prev = typeof previousState === 'string' ? JSON.parse(previousState) : previousState
        const current = typeof newState === 'string' ? JSON.parse(newState) : newState

        // Compare each field
        Object.keys(current).forEach(key => {
            if (prev[key] !== current[key]) {
                changes.push(`${key}: "${prev[key] || 'N/A'}" → "${current[key] || 'N/A'}"`)
            }
        })

        return changes.length > 0 ? changes.join(', ') : 'No changes detected'
    }

    const previousState = formatState(historyRecord.previous_state)
    const newState = formatState(historyRecord.new_state)

    return {
        ...historyRecord,
        formattedDate: formatDate(historyRecord.change_time),
        previousStateFormatted: previousState,
        newStateFormatted: newState,
        changesSummary: generateChangesSummary(previousState, newState),
        userEmail: historyRecord.changed_by_user_id || 'Unknown User',
        isNewJob: !previousState
    }
}

/**
 * Get detailed comparison between two job states
 * @param {Object|null} previousState - Previous job state
 * @param {Object} newState - New job state
 * @returns {Array} Array of field changes
 */
export function getJobStateComparison(previousState, newState) {
    if (!previousState) {
        return Object.entries(newState).map(([key, value]) => ({
            field: key,
            oldValue: null,
            newValue: value,
            changeType: 'added'
        }))
    }

    const changes = []
    const allKeys = new Set([...Object.keys(previousState), ...Object.keys(newState)])

    allKeys.forEach(key => {
        const oldValue = previousState[key]
        const newValue = newState[key]

        if (oldValue !== newValue) {
            let changeType = 'modified'
            if (oldValue === undefined || oldValue === null) {
                changeType = 'added'
            } else if (newValue === undefined || newValue === null) {
                changeType = 'removed'
            }

            changes.push({
                field: key,
                oldValue,
                newValue,
                changeType
            })
        }
    })

    return changes
}
