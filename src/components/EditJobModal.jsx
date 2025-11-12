import React, { useState, useEffect } from 'react'
import { UserAuth } from '../auth/AuthContext'
import { updateJob } from '../utils/jobHistoryOptimized'
import supabase from '../api/supabaseClient'

const EditJobModal = ({ jobData, onClose, onSave }) => {
    const { user } = UserAuth()

    const [regionOptions, setRegionOptions] = useState([])
    const [regionLoading, setRegionLoading] = useState(true)
    const [hallOptions, setHallOptions] = useState([])
    const [hallLoading, setHallLoading] = useState(true)
    const [billetOptions, setBilletOptions] = useState([])
    const [billetLoading, setBilletLoading] = useState(true)
    const [typeOptions, setTypeOptions] = useState([])
    const [typeLoading, setTypeLoading] = useState(true)

    function visible(items = []) {
        return items
            .filter((i) => i?.is_active && !i?.deleted_at)
            .sort(
                (a, b) =>
                    (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
                    String(a.label).localeCompare(String(b.label))
            )
            .map((i) => String(i.label))
    }

    async function loadRegionOptions() {
        try {
            const { data, error } = await supabase
                .from('job_dropdown_options')
                .select('region')
                .maybeSingle()

            if (error) {
                console.error('Load region options error:', error)
                setRegionOptions([])
            } else {
                const items = Array.isArray(data?.region) ? data.region : []
                setRegionOptions(visible(items))
            }
        } finally {
            setRegionLoading(false)
        }
    }

    async function loadHallOptions() {
        try {
            const { data, error } = await supabase
                .from('job_dropdown_options')
                .select('hall')
                .maybeSingle()

            if (error) {
                console.error('Load hall options error:', error)
                setHallOptions([])
            } else {
                const items = Array.isArray(data?.hall) ? data.hall : []
                setHallOptions(visible(items))
            }
        } finally {
            setHallLoading(false)
        }
    }

    async function loadBilletOptions() {
        try {
            const { data, error } = await supabase
                .from('job_dropdown_options')
                .select('billet')
                .maybeSingle()

            if (error) {
                console.error('Load billet options error:', error)
                setBilletOptions([])
            } else {
                const items = Array.isArray(data?.billet) ? data.billet : []
                setBilletOptions(visible(items))
            }
        } finally {
            setBilletLoading(false)
        }
    }

    async function loadTypeOptions() {
        try {
            const { data, error } = await supabase
                .from('job_dropdown_options')
                .select('type')
                .maybeSingle()

            if (error) {
                console.error('Load type options error:', error)
                setTypeOptions([])
            } else {
                const items = Array.isArray(data?.type) ? data.type : []
                setTypeOptions(visible(items))
            }
        } finally {
            setTypeLoading(false)
        }
    }

    useEffect(() => {
        loadRegionOptions()
        loadHallOptions()
        loadBilletOptions()
        loadTypeOptions()
    }, [])
    // Form state for all editable fields
    const [formData, setFormData] = useState({
        shipName: jobData?.shipName || '',
        region: jobData?.region || '',
        hall: jobData?.hall || '',
        open: jobData?.open || '',
        notes: jobData?.notes || '',
        location: jobData?.location || '',
        days: jobData?.days || '',
        dateCalled: jobData?.dateCalled || '',
        joinDate: jobData?.joinDate || '',
        company: jobData?.company || '',
        billet: jobData?.billet || '',
        type: jobData?.type || '',
        crewRelieved: jobData?.crewRelieved || '',
        passThru: jobData?.passThru || false,
        nightCardEarlyReturn: jobData?.nightCardEarlyReturn || false,
        msc: jobData?.msc || false,
    })

    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('') // 'success' or 'error'
    const [saving, setSaving] = useState(false)
    const [showConfirmArchive, setShowConfirmArchive] = useState(false)
    const [archiving, setArchiving] = useState(false)
    const [errors, setErrors] = useState({})

    // Update form data when jobData changes
    useEffect(() => {
        if (jobData) {
            const formatDate = (value) => {
                if (!value) return ''
                const d = new Date(value)
                if (isNaN(d)) return ''
                return d.toISOString().split('T')[0] // yyyy-MM-dd
            }

            setFormData({
                shipName: jobData.shipName || '',
                region: jobData.region || '',
                hall: jobData.hall || '',
                open: jobData.open || '',
                notes: jobData.notes || '',
                location: jobData.location || '',
                days: jobData.days ?? '',
                dateCalled: formatDate(jobData.dateCalled),
                joinDate: formatDate(jobData.joinDate),
                company: jobData.company || '',
                billet: jobData.billet || '',
                type: jobData.type || '',
                crewRelieved: jobData.crewRelieved || '',
                passThru: jobData.passThru || false,
                nightCardEarlyReturn: jobData.nightCardEarlyReturn || false,
                msc: jobData.msc || false,
            })
        }
    }, [jobData])

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }))
        }
    }

    const validateForm = () => {
        let newErrors = {}

        // Ship name required and cannot exceed 50 characters
        if (!formData.shipName.trim()) {
            newErrors.shipName = 'Ship name is required.'
        } else if (formData.shipName.length > 50) {
            newErrors.shipName = 'Ship name cannot exceed 50 characters.'
        }

        // Location required and can't exceed 50 chars
        if (!formData.location) {
            newErrors.location = 'Location is required.'
        } else if (formData.location && formData.location.length > 50) {
            newErrors.location = 'Location cannot exceed 50 characters.'
        }

        // Days required and must be non-negative & numeric
        if (
            formData.days === '' ||
            formData.days === null ||
            formData.days === undefined
        ) {
            newErrors.days = 'Number of days required.'
        } else if (formData.days && isNaN(formData.days)) {
            newErrors.days = 'Please enter a number'
        } else if (formData.days < 0) {
            newErrors.days = 'No negative input allowed'
        }

        // dateCalled and joinDate required
        if (!formData.dateCalled) {
            newErrors.dateCalled = 'Date called is required.'
        }

        if (!formData.joinDate) {
            newErrors.joinDate = 'Join Date is required'
        }

        // Company required and cannot exceed 50 chars
        if (!formData.company) {
            newErrors.company = 'Company is required'
        } else if (formData.company && formData.company.length > 50) {
            newErrors.company = 'Company cannot exceed 50 characters.'
        }

        // Crew relieved cannot exceed 100 chars
        if (formData.crewRelieved && formData.crewRelieved.length > 100) {
            newErrors.crewRelieved =
                'Crew Relieved cannot exceed 100 characters.'
        }

        // Billet is required
        if (!formData.billet) {
            newErrors.billet = 'Please select a billet'
        }

        // Type required
        if (!formData.type) {
            newErrors.type = 'Please select type.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const save = async () => {
        if (!user) {
            setMessage('You must be logged in to edit jobs.')
            setMessageType('error')
            return
        }

        if (!jobData?.id) {
            setMessage('Invalid job data. Cannot save changes.')
            setMessageType('error')
            return
        }

        if (!validateForm()) {
            setMessage('Please fix the validation errors before saving.')
            setMessageType('error')
            return
        }

        setSaving(true)

        try {
            // Update the job
            const result = await updateJob(
                jobData.id,
                formData, // Contains all fields to update
                user.id // <-- This must be a non-null/non-undefined UUID!
            )

            if (result.success) {
                setMessage('Job updated successfully!')
                setMessageType('success')

                // Call onSave callback with updated data
                if (onSave) {
                    onSave(result.data)
                }

                // Close modal after a brief delay
                setTimeout(() => {
                    onClose()
                }, 1500)
            } else {
                console.error('Failed to update job:', result.error)
                setMessage('Failed to update job. Please try again.')
                setMessageType('error')
            }
        } catch (error) {
            console.error('Error updating job:', error)
            setMessage('An error occurred while updating the job.')
            setMessageType('error')
        } finally {
            setSaving(false)
        }
    }

    const handleArchiveJob = async () => {
        if (!user) {
            setMessage('You must be logged in to archive jobs.')
            setMessageType('error')
            return
        }

        if (!jobData?.id) {
            setMessage('Invalid job data. Cannot archive.')
            setMessageType('error')
            return
        }

        setArchiving(true)

        try {
            // Update job to set archivedJob to true
            const { data, error } = await supabase
                .from('Jobs')
                .update({ archivedJob: true, open: 'Filled' })
                .eq('id', jobData.id)
                .select()
                .single()

            if (error) {
                console.error('Error archiving job:', error)
                setMessage('Failed to archive job. Please try again.')
                setMessageType('error')
            } else {
                setMessage('Job archived successfully!')
                setMessageType('success')

                // Call onSave callback with updated data
                if (onSave) {
                    onSave(data)
                }

                // Close modal after a brief delay
                setTimeout(() => {
                    onClose()
                }, 1500)
            }
        } catch (error) {
            console.error('Exception archiving job:', error)
            setMessage('An error occurred while archiving the job.')
            setMessageType('error')
        } finally {
            setArchiving(false)
            setShowConfirmArchive(false)
        }
    }

    // Status color green if state is true, red if false (open vs filled)
    //const statusColor = (formData.open = 'Open') ? 'bg-green-600' : 'bg-red-600'
    var statusColor = 'bg-red-600'

    if (formData.open == 'Open') {
        statusColor = 'bg-green-600'
    }

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4'>
            <div className='bg-mebablue-hover max-w-[900px] w-full max-h-[90vh] overflow-y-auto rounded-md shadow-2xl'>
                <div className='flex justify-center py-4 bg-mebablue-dark rounded-t-md w-full shadow-xl sticky top-0 z-10'>
                    <span className='text-white text-2xl font-semibold'>
                        Edit Job
                    </span>
                </div>

                {/* Tile Content container*/}
                <div className='flex flex-col w-full h-full px-4 mx-auto py-4'>
                    {/* Row 1: Ship Name, regions, Halls, Status 3 Col Grid*/}
                    <div className='grid grid-cols-3 gap-2 py-2 font-semibold text-white'>
                        <div>
                            <input
                                type='text'
                                value={formData.shipName}
                                onChange={(e) =>
                                    handleInputChange(
                                        'shipName',
                                        e.target.value
                                    )
                                }
                                placeholder='Ship Name'
                                className='bg-mebablue-light px-2 py-1 rounded-md text-center text-white placeholder-gray-300 w-full'
                            />
                            {errors.shipName && (
                                <span className='text-red-400 text-xs block mt-1'>
                                    {errors.shipName}
                                </span>
                            )}
                        </div>
                        <div className='grid grid-cols-2 gap-1'>
                            <select
                                value={formData.region}
                                onChange={(e) =>
                                    handleInputChange('region', e.target.value)
                                }
                                className='bg-mebablue-light px-2 py-1 rounded-md text-center text-white text-sm'
                            >
                                <option value='' disabled>
                                    Select Region
                                </option>
                                {regionOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={formData.hall}
                                onChange={(e) =>
                                    handleInputChange('hall', e.target.value)
                                }
                                className='bg-mebablue-light px-2 py-1 rounded-md text-center text-white text-sm'
                            >
                                <option value='' disabled>
                                    Select Hall
                                </option>
                                {hallOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* if job is open render box green and display 'Open' if filled render red and display 'Filled + date' */}
                        <select
                            value={formData.open}
                            onChange={(e) => {
                                handleInputChange('open', e.target.value)
                            }}
                            className={`${statusColor} px-2 py-1 rounded-md text-white text-center`}
                        >
                            <option value='Open'>Open</option>
                            <option value='Filled'>Filled</option>
                            <option value='Filled by Company'>
                                Filled by Company
                            </option>
                        </select>
                    </div>

                    {/* Row 2: Notes */}
                    <div className='bg-mebablue-light rounded-md py-2 px-4 text-sm font-medium flex-col flex text-white items-center w-full mx-auto'>
                        <span className='font-semibold'>
                            Requirements/Notes:
                        </span>
                        <textarea
                            value={formData.notes}
                            onChange={(e) =>
                                handleInputChange('notes', e.target.value)
                            }
                            placeholder='Enter notes/requirements'
                            maxLength={250}
                            rows={2}
                            className='bg-mebablue-light py-1 rounded-md text-white outline-none w-full mx-auto placeholder-gray-300'
                        />
                    </div>

                    {/* Row 3: Details 4 col Grid */}
                    <div className='grid grid-cols-4 gap-2 font-medium text-sm py-2 w-full mx-auto'>
                        <div className='col-span-2'>
                            <input
                                type='text'
                                value={formData.location}
                                onChange={(e) =>
                                    handleInputChange(
                                        'location',
                                        e.target.value
                                    )
                                }
                                placeholder='Location'
                                className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white placeholder-gray-300 w-full'
                            />
                            {errors.location && (
                                <span className='text-red-400 text-xs block mt-1'>
                                    {errors.location}
                                </span>
                            )}
                        </div>
                        <div className='col-span-2'>
                            <input
                                type='number'
                                value={formData.days}
                                onChange={(e) =>
                                    handleInputChange('days', e.target.value)
                                }
                                placeholder='Days'
                                min='0'
                                className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white placeholder-gray-300 w-full'
                            />
                            {errors.days && (
                                <span className='text-red-400 text-xs block mt-1'>
                                    {errors.days}
                                </span>
                            )}
                        </div>
                        <div className='col-span-2'>
                            <input
                                type='date'
                                value={formData.dateCalled}
                                onChange={(e) =>
                                    handleInputChange(
                                        'dateCalled',
                                        e.target.value
                                    )
                                }
                                className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white w-full'
                            />
                            {errors.dateCalled && (
                                <span className='text-red-400 text-xs block mt-1'>
                                    {errors.dateCalled}
                                </span>
                            )}
                        </div>
                        <div className='col-span-2'>
                            <input
                                type='date'
                                value={formData.joinDate}
                                onChange={(e) =>
                                    handleInputChange(
                                        'joinDate',
                                        e.target.value
                                    )
                                }
                                className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white w-full'
                            />
                            {errors.joinDate && (
                                <span className='text-red-400 text-xs block mt-1'>
                                    {errors.joinDate}
                                </span>
                            )}
                        </div>
                        <div className='col-span-2'>
                            <input
                                type='text'
                                value={formData.company}
                                onChange={(e) =>
                                    handleInputChange('company', e.target.value)
                                }
                                placeholder='Company'
                                className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white placeholder-gray-300 w-full'
                            />
                            {errors.company && (
                                <span className='text-red-400 text-xs block mt-1'>
                                    {errors.company}
                                </span>
                            )}
                        </div>
                        <div className='col-span-1'>
                            <select
                                value={formData.billet}
                                onChange={(e) =>
                                    handleInputChange('billet', e.target.value)
                                }
                                className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white w-full'
                            >
                                <option value='' disabled>
                                    Select Billet
                                </option>
                                {billetOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                            {errors.billet && (
                                <span className='text-red-400 text-xs block mt-1'>
                                    {errors.billet}
                                </span>
                            )}
                        </div>
                        <div className='col-span-1'>
                            <select
                                value={formData.type}
                                onChange={(e) =>
                                    handleInputChange('type', e.target.value)
                                }
                                className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white w-full'
                            >
                                <option value='' disabled>
                                    Select Type
                                </option>
                                {typeOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                            {errors.type && (
                                <span className='text-red-400 text-xs block mt-1'>
                                    {errors.type}
                                </span>
                            )}
                        </div>
                        <input
                            type='text'
                            value={formData.crewRelieved}
                            onChange={(e) =>
                                handleInputChange(
                                    'crewRelieved',
                                    e.target.value
                                )
                            }
                            placeholder='Crew Relieved'
                            maxLength={100}
                            className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-4 placeholder-gray-300'
                        />
                    </div>
                </div>

                {/* Job Flags (inline and scoped to their checkboxes) */}
                <div className='flex flex-wrap items-center gap-6 mt-3 px-4 text-white text-sm font-medium'>
                    {[
                        { name: 'passThru', label: 'Pass-Thru' },
                        {
                            name: 'nightCardEarlyReturn',
                            label: 'Night Card Early Return',
                        },
                        { name: 'msc', label: 'MSC' },
                    ].map(({ name, label }) => (
                        <label
                            key={name}
                            className='flex items-center space-x-2 bg-mebablue-light/30 hover:bg-mebablue-light/50 px-3 py-1 rounded-md transition-all cursor-pointer'
                            aria-label={label}
                        >
                            <input
                                type='checkbox'
                                checked={formData[name]}
                                onChange={(e) =>
                                    handleInputChange(name, e.target.checked)
                                }
                                className='h-4 w-4 accent-mebablue-dark'
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className='flex justify-between gap-4 p-4 bg-mebablue-hover sticky bottom-0'>
                    <button
                        className='bg-red-500 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-600'
                        onClick={() => setShowConfirmArchive(true)}
                        disabled={archiving || saving}
                    >
                        Remove Job
                    </button>
                    <div className='flex gap-4'>
                        <button
                            className='bg-gray-500 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 hover:bg-gray-600'
                            onClick={onClose}
                            disabled={saving || archiving}
                        >
                            Cancel
                        </button>
                        <button
                            className={`py-2 px-4 rounded-md focus:outline-none focus:ring-2 text-white ${
                                saving || !user
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                            }`}
                            onClick={save}
                            disabled={saving || !user || archiving}
                            title={
                                !user
                                    ? 'You must be logged in to edit jobs'
                                    : ''
                            }
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Message Popup */}
                {message && (
                    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                        <div
                            className={`p-6 rounded-md shadow-lg max-w-sm w-full border ${
                                messageType === 'success'
                                    ? 'bg-green-100 border-green-300'
                                    : 'bg-red-100 border-red-300'
                            }`}
                        >
                            <h2
                                className={`text-xl font-semibold ${
                                    messageType === 'success'
                                        ? 'text-green-800'
                                        : 'text-red-800'
                                }`}
                            >
                                {messageType === 'success'
                                    ? 'Success!'
                                    : 'Error'}
                            </h2>
                            <p
                                className={`mt-2 ${
                                    messageType === 'success'
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                }`}
                            >
                                {message}
                            </p>
                            <div className='mt-6 flex justify-center w-full'>
                                <button
                                    onClick={() => setMessage('')}
                                    className={`py-2 px-4 rounded-md text-white ${
                                        messageType === 'success'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Archive Dialog */}
                {showConfirmArchive && (
                    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                        <div className='bg-white p-6 rounded-md shadow-lg max-w-sm w-full border border-orange-300'>
                            <h2 className='text-xl font-semibold text-orange-800'>
                                Confirm Archive
                            </h2>
                            <p className='mt-2 text-gray-700'>
                                Are you sure you want to archive this job? It
                                will be hidden from the FSBoard and Manage Jobs
                                pages, but will remain visible in Job History.
                            </p>
                            <div className='mt-6 flex justify-end gap-4'>
                                <button
                                    onClick={() => setShowConfirmArchive(false)}
                                    className='bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600'
                                    disabled={archiving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleArchiveJob}
                                    className='bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600'
                                    disabled={archiving}
                                >
                                    {archiving ? 'Archiving...' : 'Archive Job'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EditJobModal
