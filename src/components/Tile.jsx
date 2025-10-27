// tile component which takes in props as parameter (data)

import React, { useState } from 'react'
import EditJobModal from './EditJobModal'

const Tile = ({ job, onJobUpdate }) => {
    const [showModal, setShowModal] = useState(false)

    const statusColor = job.open ? 'bg-green-600' : 'bg-red-600'

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
            <div className="flex flex-col bg-mebablue-hover w-full h-full rounded-md">
                {/* top bar */}
                <div className="bg-mebablue-dark w-full h-8 flex rounded-t-md justify-end gap-2 px-2">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-mebablue-light rounded-md text-sm my-auto px-2 text-white font-medium hover:bg-mebablue-hover font-mont"
                    >
                        Edit Job
                    </button>
                </div>

                {/* content */}
                <div className="flex flex-col w-full h-full px-2 justify-center">
                    {/* Row 1 */}
                    <div className="grid grid-cols-4 gap-2 py-2 font-medium text-white font-mont">
                        <span className="bg-mebablue-light rounded-md px-2 py-1 text-center">
                            {job.shipName}
                        </span>
                        <span className="bg-mebablue-light px-2 py-1 rounded-md text-center">
                            {job.region}
                        </span>
                        <span className="bg-mebablue-light px-2 py-1 rounded-md text-center">
                            {job.hall}
                        </span>
                        <span
                            className={`${statusColor} px-2 py-1 rounded-md text-white text-center`}
                        >
                            {job.open ? 'Open' : `Filled ${job.fillDate || ''}`}
                        </span>
                    </div>

                    {/* Row 2: Notes */}
                    <div className="bg-mebablue-light rounded-md py-2 px-4 text-sm font-medium flex-col flex text-white">
                        <span className="font-medium font-mont">Requirements/Notes:</span>
                        <span className="font-mont">- {job.notes}</span>
                    </div>

                    {/* Row 3: Details */}
                    <div className="grid grid-cols-4 gap-2 font-medium text-sm py-2">
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
