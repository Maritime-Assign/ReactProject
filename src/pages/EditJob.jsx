import { useLocation, useNavigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserAuth } from '../auth/AuthContext'
import { updateJob } from '../utils/jobHistoryOptimized'

const EditJob = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = UserAuth()
    const { jobData } = location.state || {} // Access the job data

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
        nightCardEarlyReturn: jobData.nightCardEarlyReturn || false,
        msc: jobData?.msc || false,
    })

    const [status, setStatus] = useState('')
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('') // 'success' or 'error'
    const [window, setWindow] = useState(false)
    const [saving, setSaving] = useState(false)

    // Update form data when jobData changes
    useEffect(() => {
        if (jobData) {
            setFormData({
                shipName: jobData.shipName || '',
                region: jobData.region || '',
                hall: jobData.hall || '',
                open: jobData.open || '',
                notes: jobData.notes || '',
                location: jobData.location || '',
                days: jobData.days || '',
                dateCalled: jobData.dateCalled || '',
                joinDate: jobData.joinDate || '',
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
    }

    const save = async () => {
        if (!user) {
            setMessage('You must be logged in to edit jobs.')
            setMessageType('error')
            setWindow(true)
            return
        }

        if (!jobData?.id) {
            setMessage('Invalid job data. Cannot save changes.')
            setMessageType('error')
            setWindow(true)
            return
        }

        setSaving(true)

        try {
            // Prepare the updated data (history logging handled automatically by database triggers)
            const updatedData = {
                ...formData,
            }

            // Update the job
            const result = await updateJob(jobData.id, updatedData)

            if (result.success) {
                setMessage('Job updated successfully!')
                setMessageType('success')
                setWindow(true)

                // Optionally navigate back after a delay
                setTimeout(() => {
                    navigate('/board')
                }, 2000)
            } else {
                console.error('Failed to update job:', result.error)
                setMessage('Failed to update job. Please try again.')
                setMessageType('error')
                setWindow(true)
            }
        } catch (error) {
            console.error('Error updating job:', error)
            setMessage('An error occurred while updating the job.')
            setMessageType('error')
            setWindow(true)
        } finally {
            setSaving(false)
        }
    }

    const closeWindow = () => {
        setWindow(false)
    }

    // status color green if state is true, red if false (open vs filled)
    const statusColor = (formData.open == 'Open') ? 'bg-green-600' : 'bg-red-600'

    return (
        <div className='flex flex-col bg-mebablue-hover max-w-[1280px] mx-auto h-fit rounded-md mt-4'>
            <div className='flex justify-center py-4 bg-mebablue-dark rounded-t-md w-full shadow-xl'>
                <span className='text-white text-2xl font-semibold'>
                    Edit Job
                </span>
            </div>
            {/* Tile Content container*/}
            <div className='flex flex-col w-full h-full px-2 mx-auto'>
                {/* Row 1: Ship Name, regions, Halls, Status 3 Col Grid*/}
                <div className='grid grid-cols-3 gap-2 py-2 font-semibold text-white'>
                    <input
                        type='text'
                        value={formData.shipName}
                        onChange={(e) =>
                            handleInputChange('shipName', e.target.value)
                        }
                        placeholder='Ship Name'
                        className='bg-mebablue-light px-2 py-1 rounded-md text-center text-white placeholder-gray-300'
                    />
                    <div className='grid grid-cols-2 gap-1'>
                        <input
                            type='text'
                            value={formData.region}
                            onChange={(e) =>
                                handleInputChange('region', e.target.value)
                            }
                            placeholder='Region'
                            className='bg-mebablue-light px-2 py-1 rounded-md text-center text-white placeholder-gray-300 text-sm'
                        />
                        <input
                            type='text'
                            value={formData.hall}
                            onChange={(e) =>
                                handleInputChange('hall', e.target.value)
                            }
                            placeholder='Hall'
                            className='bg-mebablue-light px-2 py-1 rounded-md text-center text-white placeholder-gray-300 text-sm'
                        />
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
                        <option value='Filled by Company'>Filled by CO</option>
                    </select>
                </div>
                {/* Row 2: Notes */}
                <div className='bg-mebablue-light rounded-md py-2 px-4 text-sm font-medium flex-col flex text-white items-center w-full mx-auto'>
                    <span className='font-semibold'>Requirements/Notes:</span>
                    <textarea
                        value={formData.notes}
                        onChange={(e) =>
                            handleInputChange('notes', e.target.value)
                        }
                        placeholder='Enter notes/requirements'
                        rows={2}
                        className='bg-mebablue-light py-1 rounded-md text-white outline-none w-full mx-auto placeholder-gray-300'
                    />
                </div>
                {/* Row 3: Details 4 col Grid */}
                <div className='grid grid-cols-4 gap-2 font-medium text-sm py-2 w-full mx-auto'>
                    <input
                        type='text'
                        value={formData.location}
                        onChange={(e) =>
                            handleInputChange('location', e.target.value)
                        }
                        placeholder='Location'
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2 placeholder-gray-300'
                    />
                    <input
                        type='text'
                        value={formData.days}
                        onChange={(e) =>
                            handleInputChange('days', e.target.value)
                        }
                        placeholder='Days'
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2 placeholder-gray-300'
                    />
                    <input
                        type='date'
                        value={formData.dateCalled}
                        onChange={(e) =>
                            handleInputChange('dateCalled', e.target.value)
                        }
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type='date'
                        value={formData.joinDate}
                        onChange={(e) =>
                            handleInputChange('joinDate', e.target.value)
                        }
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type='text'
                        value={formData.company}
                        onChange={(e) =>
                            handleInputChange('company', e.target.value)
                        }
                        placeholder='Company'
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2 placeholder-gray-300'
                    />
                    <input
                        type='text'
                        value={formData.billet}
                        onChange={(e) =>
                            handleInputChange('billet', e.target.value)
                        }
                        placeholder='Billet'
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2 placeholder-gray-300'
                    />
                    <input
                        type='text'
                        value={formData.type}
                        onChange={(e) =>
                            handleInputChange('type', e.target.value)
                        }
                        placeholder='Type'
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2 placeholder-gray-300'
                    />
                    <input
                        type='text'
                        value={formData.crewRelieved}
                        onChange={(e) =>
                            handleInputChange('crewRelieved', e.target.value)
                        }
                        placeholder='Crew Relieved'
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2 placeholder-gray-300'
                    />
                    {/* ✅ Job Flags (stacked, left-aligned) */}
                    <div className='flex flex-col w-full mt-2 space-y-2 col-span-2'>
                        <label className='flex items-center space-x-2'>
                            <input
                                type='checkbox'
                                checked={formData.passThru}
                                onChange={(e) =>
                                    handleInputChange('passThru', e.target.checked)
                                }
                                className='h-4 w-4 accent-mebablue-dark'
                            />
                            <span className='text-white font-medium'>Pass-Thru</span>
                        </label>

                        <label className='flex items-center space-x-2'>
                            <input
                                type='checkbox'
                                checked={formData.nightCardEarlyReturn}
                                onChange={(e) =>
                                    handleInputChange('nightCardEarlyReturn', e.target.checked)
                                }
                                className='h-4 w-4 accent-mebablue-dark'
                            />
                            <span className='text-white font-medium'>Night Card Early Return</span>
                        </label>

                        <label className='flex items-center space-x-2'>
                            <input
                                type='checkbox'
                                checked={formData.msc}
                                onChange={(e) =>
                                    handleInputChange('msc', e.target.checked)
                                }
                                className='h-4 w-4 accent-mebablue-dark'
                            />
                            <span className='text-white font-medium'>MSC</span>
                        </label>
                    </div>

                </div>
            </div>

            {/* Exit and Save Button, Exit redirect to Job board, Save result in a status message */}
            <div className='flex justify-center gap-4 p-4'>
                <Link to='/board'>
                    {/* Exit button is linked directly to the job board */}
                    <button className='bg-red-500 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-600'>
                        Exit
                    </button>
                </Link>
                {/* Save button will pop up a status message window */}
                <button
                    className={`py-2 px-4 rounded-md focus:outline-none focus:ring-2 text-white ${saving || !user
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                        }`}
                    onClick={save}
                    disabled={saving || !user}
                    title={!user ? 'You must be logged in to edit jobs' : ''}
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {/* Message Popup */}
            {window && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                    <div
                        className={`p-6 rounded-md shadow-lg max-w-sm w-full border ${messageType === 'success'
                                ? 'bg-green-100 border-green-300'
                                : 'bg-red-100 border-red-300'
                            }`}
                    >
                        <h2
                            className={`text-xl font-semibold ${messageType === 'success'
                                    ? 'text-green-800'
                                    : 'text-red-800'
                                }`}
                        >
                            {messageType === 'success' ? 'Success!' : 'Error'}
                        </h2>
                        <p
                            className={`mt-2 ${messageType === 'success'
                                    ? 'text-green-700'
                                    : 'text-red-700'
                                }`}
                        >
                            {message}
                        </p>
                        <div className='mt-6 flex justify-center w-full'>
                            <button
                                onClick={closeWindow}
                                className={`py-2 px-4 rounded-md text-white ${messageType === 'success'
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
        </div>
    )
}

export default EditJob
