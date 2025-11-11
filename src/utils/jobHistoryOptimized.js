import { fa } from '@faker-js/faker'
import supabase from '../api/supabaseClient'

/**
 * OPTIMIZED: Add a new job (history logging handled by database triggers)
 * @param {Object} jobData - The job data to add
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function addJob(jobData) {
    try {
        // Remove any auto-generated fields that shouldn't be sent
        const cleanJobData = { ...jobData }
        delete cleanJobData.id
        delete cleanJobData.created_at
        delete cleanJobData.FillDate
        delete cleanJobData.claimedBy
        delete cleanJobData.claimed_at
        
        console.log('Clean job data being sent:', JSON.stringify(cleanJobData, null, 2))
        
        const { data: newJob, error: jobError } = await supabase
            .from('Jobs')
            .insert(cleanJobData)
            .select()
            .single()

        if (jobError) {
            console.error('Error adding job:', jobError)
            return { success: false, data: null, error: jobError }
        }

        // No manual history logging - database triggers handle this automatically
        return { success: true, data: newJob, error: null }
    } catch (err) {
        console.error('Exception adding job:', err)
        return { success: false, data: null, error: err }
    }
}

/**
 * OPTIMIZED: Update a job (history logging handled by database triggers)
 * @param {string} jobId - The ID of the job to update
 * @param {Object} updatedData - The updated job data
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function updateJob(jobId, updatedData) {
    try {
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
        try {
            const { data: retiredFlag, error: retiredError } = await supabase
                .from('Jobs')
                .update({ retired: false })
                .eq('id', jobId)
                .single()
        } catch (err) {
            console.error('Exception updating job:', err)
            return { success: false, data: null, error: err }
        }

        // No manual history logging - database triggers handle this automatically
        return { success: true, data: updatedJob, error: null }
    } catch (err) {
        console.error('Exception updating job:', err)
        return { success: false, data: null, error: err }
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
