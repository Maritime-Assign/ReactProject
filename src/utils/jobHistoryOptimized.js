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

        console.log(
            'Clean job data being sent:',
            JSON.stringify(cleanJobData, null, 2)
        )

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
                .update({ archivedJob: false })
                .eq('id', jobId)
                .single()
            if (retiredError) {
                console.error('Error resetting retired flag:', retiredError)
                return {
                    success: false,
                    data: retiredFlag,
                    error: retiredError,
                }
            }
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

export async function resolveUserIdToUsername(userId) {
    if (!userId) return 'N/A'

    try {
        const { data, error } = await supabase
            .from('Users')
            .select('username')
            .eq('UUID', userId)
            .single()

        if (error) {
            console.error('Error resolving user ID:', error)
            return userId // Fallback to displaying the raw ID on error
        }

        return data?.username || 'Unknown User'
    } catch (err) {
        console.error('Exception resolving user ID:', err)
        return userId // Fallback
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
            second: '2-digit',
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

    const generateChangesSummary = (previousState, newState, action) => {
        if (action === 'Created') {
            return 'Job created'
        }

        if (action === 'Filled') {
            return 'Job status changed to Filled'
        }

        if (action === 'Archived') {
            return 'Job archived'
        }

        const changes = []
        const prev = previousState
        const current = newState

        if (
            typeof prev !== 'object' ||
            prev === null ||
            typeof current !== 'object' ||
            current === null
        ) {
            // Should not happen if formatState is robust, but kept for safety.
            return 'Detailed comparison skipped or failed.'
        }

        // Compare each field
        Object.keys(current).forEach((key) => {
            if (prev[key] !== current[key]) {
                changes.push(
                    `${key}: "${prev[key] || 'N/A'}" → "${
                        current[key] || 'N/A'
                    }"`
                )
            }
        })

        return changes.length > 0 ? changes.join(', ') : 'No changes detected'
    }

    const previousState = formatState(historyRecord.previous_state)
    const newState = formatState(historyRecord.new_state)

    const isNewJob = !previousState

    let actionType = 'Updated' // Default action for any general change

    if (isNewJob) {
        actionType = 'Created'
    } else if (newState && previousState) {
        const prevOpen = previousState.open
        const newOpen = newState.open

        // Check the separate boolean field for archiving
        const prevArchived = previousState.archivedJob || false // Default to false if missing
        const newArchived = newState.archivedJob || false // Default to false if missing

        // 1. Check for Archive Action (archivedJob changed from false to true)
        if (!prevArchived && newArchived) {
            actionType = 'Archived'
        }
        // 2. Check for Filled Action (open status changed to Filled, provided it wasn't just archived)
        else if (prevOpen !== newOpen) {
            if (newOpen === 'Filled' || newOpen === 'Filled by Company') {
                actionType = 'Filled'
            }
            // 3. Check for Reopened Action (archivedJob changed from true to false OR status changed back to Open)
            else if (
                (prevArchived && !newArchived) ||
                (newOpen === 'Open' &&
                    (prevOpen === 'Filled' ||
                        prevOpen === 'Archived' ||
                        prevOpen === 'Removed'))
            ) {
                actionType = 'Reopened'
            }
        }
        // If none of the above specific status changes occurred, it remains 'Updated'
    }

    const getUsername = (record) => {
        // Check if the record contains the nested object from the join
        if (
            record.changed_by_user_id &&
            typeof record.changed_by_user_id === 'object'
        ) {
            // Return the username, or 'Unknown User' if the join failed to find a name
            return record.changed_by_user_id.username || 'Unknown User'
        }
        // Fallback if the join failed entirely or only the raw ID was returned
        return record.changed_by_user_id || 'Unknown User'
    }

    return {
        ...historyRecord,
        formattedDate: formatDate(historyRecord.change_time),
        previousStateFormatted: previousState,
        newStateFormatted: newState,
        changesSummary: generateChangesSummary(
            previousState,
            newState,
            actionType
        ),
        username: getUsername(historyRecord),
        isNewJob: isNewJob,
        actionType: actionType,
    }
}

/**
 * Get detailed comparison between two job states
 * @param {Object|null} previousState - Previous job state
 * @param {Object} newState - New job state
 * @returns {Array} Array of field changes
 */
export async function getJobStateComparison(previousState, newState) {
    if (!previousState) {
        return Object.entries(newState).map(([key, value]) => ({
            field: key,
            oldValue: null,
            newValue: value,
            changeType: 'added',
        }))
    }

    const changes = []
    const allKeys = new Set([
        ...Object.keys(previousState),
        ...Object.keys(newState),
    ])

    // Define fields that hold a User ID and need resolution
    const USER_ID_FIELDS = new Set(['claimedBy', 'FillUser']) // Add any other user ID fields here
    const EXCLUDED_KEYS = new Set(['changed_by_user_id']) // Exclude the redundant log author ID

    for (const key of allKeys) {
        if (EXCLUDED_KEYS.has(key)) {
            continue
        }

        let oldValue = previousState[key]
        let newValue = newState[key]
        let resolveRequired = false

        // Check if resolution is needed
        if (USER_ID_FIELDS.has(key) && (oldValue || newValue)) {
            resolveRequired = true
        }

        if (resolveRequired) {
            // Resolve the UUIDs to usernames 👈
            if (oldValue) {
                oldValue = await resolveUserIdToUsername(oldValue)
            }
            if (newValue) {
                newValue = await resolveUserIdToUsername(newValue)
            }
        }

        if (oldValue !== newValue) {
            let changeType = 'modified'
            if (
                oldValue === undefined ||
                oldValue === null ||
                oldValue === 'N/A'
            ) {
                changeType = 'added'
            } else if (
                newValue === undefined ||
                newValue === null ||
                newValue === 'N/A'
            ) {
                changeType = 'removed'
            }

            changes.push({
                field: key,
                oldValue,
                newValue,
                changeType,
            })
        }
    }

    return changes
}
