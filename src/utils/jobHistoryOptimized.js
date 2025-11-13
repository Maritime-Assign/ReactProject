import { fa } from '@faker-js/faker'
import supabase from '../api/supabaseClient'

/**
 * OPTIMIZED: Add a new job (history logging handled by database triggers)
 * @param {Object} jobData - The job data to add
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function addJob(jobData, userId) {
    if (!userId) {
        console.error(
            'Action aborted: User ID is missing. The user must be logged in to create a job.'
        )
        return {
            success: false,
            data: null,
            error: new Error('Authentication required.'),
        }
    }

    try {
        // Remove any auto-generated fields that shouldn't be sent
        const cleanJobData = { ...jobData }
        delete cleanJobData.id
        delete cleanJobData.created_at
        delete cleanJobData.FillDate
        delete cleanJobData.claimedBy
        delete cleanJobData.claimed_at

        cleanJobData.updated_by = userId

        console.log(
            'Clean job data being sent:',
            JSON.stringify(cleanJobData, null, 2)
        )

        const { data: newJob, error: jobError } = await supabase
            .from('Jobs')
            .insert(cleanJobData)
            .select('*')
            .single()

        if (jobError) {
            // Note: If this fails again, it will be because the database
            // trigger still failed, and you need to review Step 2.
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
export async function updateJob(jobId, updatedData, userId) {
    // 1. Initial Authentication Check
    if (!userId) {
        console.error(
            'Action aborted: User ID is missing. The user must be logged in to update a job.'
        )
        return {
            success: false,
            data: null,
            error: new Error('Authentication required.'),
        }
    }

    // 2. Prepare the Update Payload
    // Inject the userId for the database trigger to use and handle.
    // Also, if 'archivedJob' isn't explicitly set to true (i.e., this isn't an archive action),
    // ensure it is set to false to handle the second update's logic in one call.
    const updatesWithUserId = {
        ...updatedData,
        updated_by: userId,
        // ⭐️ MERGED OPTIMIZATION: If the incoming data doesn't explicitly set archivedJob to true,
        // we set it to false here to replace the unnecessary second update.
        archivedJob: updatedData.archivedJob === true ? true : false,
    }

    try {
        // 3. Execute the Single, Combined Update
        const { data: jobData, error: updateError } = await supabase
            .from('Jobs')
            .update(updatesWithUserId) // ⭐️ FIX: Use the correct variable name here!
            .eq('id', jobId)
            .select()
            .single()

        // 4. Handle Errors
        if (updateError) {
            console.error('Supabase updateJob error:', updateError)
            return { success: false, data: null, error: updateError }
        }

        // 5. Success
        // Database triggers automatically handle history logging.
        return { success: true, data: jobData, error: null }
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
        const dateObj = new Date(dateString)

        // Date format (e.g., Nov 12, 2025)
        const datePart = dateObj.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })

        // Time format (e.g., 2:45:29 PM)
        const timePart = dateObj.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })

        return {
            date: datePart,
            time: timePart,
        }
    }

    const formatState = (stateString) => {
        if (!stateString) return null

        // If it's already an object, return it
        if (typeof stateString === 'object') return stateString

        // If it's not a string, return null
        if (typeof stateString !== 'string') return null

        try {
            // Trim whitespace and check if it looks like JSON
            const trimmed = stateString.trim()
            if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
                console.warn(
                    'State string does not appear to be JSON:',
                    trimmed.substring(0, 50)
                )
                return null
            }
            return JSON.parse(trimmed)
        } catch (err) {
            console.warn('Failed to parse state JSON:', err.message)
            console.warn('Problematic string:', stateString.substring(0, 100))
            return null
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
        formattedDateTime: formatDate(historyRecord.change_time),
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
    const EXCLUDED_KEYS = new Set(['changed_by_user_id', 'updated_by']) // Add updated_by here // Exclude the redundant log author ID

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
