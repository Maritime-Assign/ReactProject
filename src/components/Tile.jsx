// tile component which takes in props as parameter (data)

import React, { useState } from 'react'
import EditJobModal from './EditJobModal'

const Tile = ({ job, onJobUpdate }) => {
    const [showModal, setShowModal] = useState(false)

    var statusColor = 'bg-red-600'

    if (job.open == 'Open') {
        statusColor = 'bg-green-600'
    }

    const boxStyle = () =>
        'bg-mebablue-light px-3 py-1 rounded-md font-medium text-white font-mont'

    const handleJobSave = (updatedJob) => {
        // Update the job in the parent component
        if (onJobUpdate) {
            onJobUpdate(updatedJob)
        }
    }

    return (
        <>
            <div className='flex flex-col bg-mebablue-hover w-full rounded-md'>
                {/* top bar */}
                <div className='bg-mebablue-dark w-full flex items-center justify-end gap-2 px-2 rounded-t-md'>
                    <button
                        onClick={() => setShowModal(true)}
                        className='bg-mebablue-light rounded-md text-sm px-3 py-1 text-white font-medium hover:bg-mebablue-hover font-mont'
                    >
                        Edit Job
                    </button>
                </div>

                {/* content */}
                <div className='flex flex-col w-full h-full px-2 py-2 justify-center'>
                    {/* Row 1 */}
                    <div className='grid grid-cols-4 gap-2 py-2 font-medium text-white font-mont items-center'>
                        <span className='bg-mebablue-light rounded-md px-2 py-1 text-center'>
                            {job.shipName}
                        </span>
                        <span className='bg-mebablue-light px-2 py-1 rounded-md text-center'>
                            {job.region}
                        </span>
                        <span className='bg-mebablue-light px-2 py-1 rounded-md text-center'>
                            {job.hall}
                        </span>
                        <span
                            className={`${statusColor} px-2 py-1 rounded-md text-white text-center`}
                        >
                            {(job.open == 'Open') ?  job.open : (job.open == 'Filled') ? `Filled ${job.fillDate || ''}` : 'Filled by CO'}
                        </span>
                    </div>

                    {/* Row 2: Notes */}
                    <div className='bg-mebablue-light rounded-md py-2 px-4 text-sm font-medium flex-col flex text-white'>
                        <span className='font-medium font-mont'>
                            Requirements/Notes:
                        </span>
                        <span className='font-mont'>- {job.notes}</span>
                    </div>

                    {/* Row 3: Details */}
                    <div className='grid grid-cols-4 gap-2 font-medium text-sm py-2'>
                        <div className={`${boxStyle()} col-span-2`}>
                            Location: {job.location}
                        </div>
                        <div className={`${boxStyle()} col-span-2`}>
                            Days: {job.days}
                        </div>

                        <div className={`${boxStyle()} col-span-2`}>
                            Date Called: {job.dateCalled}
                        </div>

                        <div className={`${boxStyle()} col-span-2`}>
                            Join Date: {job.joinDate}
                        </div>

                        <div className={`${boxStyle()} col-span-2`}>
                            Company: {job.company}
                        </div>

                        <div className={`${boxStyle()} col-span-1`}>
                            Billet: {job.billet}
                        </div>
                        <div className={`${boxStyle()} col-span-1`}>
                            Type: {job.type}
                        </div>
                        <div className={`${boxStyle()} col-span-4`}>
                            Crew Relieved: {job.crewRelieved}
                        </div>
                    </div>
                    {/* ✅ Job Flags: stacked, left-aligned checkboxes when editing */}
                    {/* Job Flags Display */}
                    <div className='gap-2 flex items-center justify-center'>
                        {job.passThru && (
                            <span className='bg-green-600 text-white px-2 py-0.5 rounded text-xs col-span-1 text-center'>
                                Pass-Thru
                            </span>
                        )}
                        {job.nightCardEarlyReturn && (
                            <span className='bg-yellow-500 text-white px-2 py-0.5 rounded text-xs col-span-1'>
                                Night Card Early Return
                            </span>
                        )}
                        {job.msc && (
                            <span className='bg-blue-600 text-white px-2 py-0.5 rounded text-xs col-span-1'>
                                MSC
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Job Modal */}
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
