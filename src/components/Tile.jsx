// Tile component - displays job information with edit functionality

import React, { useState } from 'react'
import EditJobModal from './EditJobModal'

const Tile = ({ job, onJobUpdate }) => {
    const [showModal, setShowModal] = useState(false)

    var statusColor = 'text-red-600'

    if (job.open == 'Open') {
        statusColor = 'text-green-600'
    }

    const handleJobSave = (updatedJob) => {
        if (onJobUpdate) {
            onJobUpdate(updatedJob)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        if (isNaN(date)) return ''
        return date.toLocaleDateString('en-US')
    }

    return (
        <>
            {/* Main card - fixed height */}
            <div className='bg-white rounded-lg border border-gray-300 overflow-hidden h-full flex flex-col'>
                {/* Header with edit button */}
                <div className='flex items-center justify-between px-4 py-3 border-b border-gray-300 bg-gray-50 shrink-0'>
                    <div className='flex items-start gap-4 grow'>
                        <div>
                            <span className='text-xs text-gray-500 font-medium block'>
                                Vessel
                            </span>
                            <h3 className='font-semibold text-gray-900 text-sm'>
                                {job.shipName}
                            </h3>
                        </div>
                        <div>
                            <span className='text-xs text-gray-500 font-medium block'>
                                Status
                            </span>
                            <div
                                className={`${statusColor} text-sm font-semibold`}
                            >
                                {job.open == 'Open' ? (
                                    job.open
                                ) : job.open == 'Filled' ? (
                                    <>
                                        <div>Filled</div>
                                        <div className='text-xs'>
                                            {formatDate(job.FillDate)}
                                        </div>
                                    </>
                                ) : job.open == 'Filled by Company' ? (
                                    <>
                                        <div>Filled by CO</div>
                                        <div className='text-xs'>
                                            {formatDate(job.FillDate)}
                                        </div>
                                    </>
                                ) : (
                                    job.open
                                )}
                            </div>
                        </div>
                        {/* Flags */}
                        <div className='flex gap-2 self-center'>
                            {job.Users?.abbreviation && (
                                <span className='bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium'>
                                    {job.Users.abbreviation}
                                </span>
                            )}
                            {job.passThru && (
                                <span className='bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium'>
                                    Pass-Thru
                                </span>
                            )}
                            {job.nightCardEarlyReturn && (
                                <span className='bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium'>
                                    Night Card
                                </span>
                            )}
                            {job.msc && (
                                <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium'>
                                    MSC
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className='text-sm px-3 py-1.5 text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded hover:bg-gray-200 transition-colors ml-4'
                    >
                        Edit
                    </button>
                </div>
                {/* Content - flex-grow to fill space */}
                <div className='p-4 space-y-3 flex-grow overflow-auto'>
                    {/* Key info badges with labels */}
                    <div className='flex flex-wrap gap-3'>
                        <div>
                            <span className='text-xs text-gray-500 font-medium block mb-1'>
                                Region
                            </span>
                            <span className='bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium'>
                                {job.region}
                            </span>
                        </div>
                        <div>
                            <span className='text-xs text-gray-500 font-medium block mb-1'>
                                Hall
                            </span>
                            <span className='bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium'>
                                {job.hall}
                            </span>
                        </div>
                    </div>

                    {/* Details grid */}
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                        <div className='text-gray-600'>
                            <span className='font-medium'>Location:</span>{' '}
                            {job.location}
                        </div>
                        <div className='text-gray-600'>
                            <span className='font-medium'>Days:</span>{' '}
                            {job.days}
                        </div>
                        <div className='text-gray-600'>
                            <span className='font-medium'>Called:</span>{' '}
                            {formatDate(job.dateCalled)}
                        </div>
                        <div className='text-gray-600'>
                            <span className='font-medium'>Joined:</span>{' '}
                            {formatDate(job.joinDate)}
                        </div>
                        <div className='text-gray-600'>
                            <span className='font-medium'>Company:</span>{' '}
                            {job.company}
                        </div>
                        <div className='text-gray-600'>
                            <span className='font-medium'>Billet:</span>{' '}
                            {job.billet}
                        </div>
                        <div className='text-gray-600'>
                            <span className='font-medium'>Type:</span>{' '}
                            {job.type}
                        </div>
                        <div className='text-gray-600'>
                            <span className='font-medium'>Crew Relieved:</span>{' '}
                            {job.crewRelieved}
                        </div>
                    </div>

                    {/* Notes - fixed height with overflow */}
                    {job.notes && (
                        <div className='bg-blue-50 border border-blue-200 rounded px-3 py-2 max-h-20 overflow-auto'>
                            <span className='text-xs text-gray-500 font-medium block mb-1'>
                                Notes
                            </span>
                            <p className='text-sm text-gray-700'>{job.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <EditJobModal
                    jobData={job}
                    onClose={() => setShowModal(false)}
                    onSave={handleJobSave}
                />
            )}
        </>
    )
}

export default Tile
