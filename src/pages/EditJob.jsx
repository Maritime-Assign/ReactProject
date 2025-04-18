import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const EditJob = () => {
    const location = useLocation();
    const { jobData } = location.state || {};  // Access the job data

    const [status, setStatus] = useState(jobData.open)
    // make sure the status matches incoming prop
    useEffect(() => {
        setStatus(jobData.open)
    }, [jobData.open])
    // status color green if state is true, red if false (open vs filled)
    const statusColor = status == true ? 'bg-green-600' : 'bg-red-600'
    // repeated style fn for details grid
    const boxStyle = () => {
        return 'bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white'
    }

    const [message, setMessage] = useState('');
    const [window, setWindow] = useState(false);
    const save = () => {
        setMessage('Status Message');
        setWindow(true);
    };

    const closeWindow = () => {
        setWindow(false);
    }

    return (
        <div className='flex flex-col bg-mebablue-hover max-w-[1280px] mx-auto h-fit rounded-md mt-4'>
            <div className='flex justify-center py-4 bg-mebablue-dark rounded-t-md w-full shadow-xl'>
                <span className='text-white text-2xl font-semibold'>
                    Edit Job
                </span>
            </div>
            {/* Tile Content container*/}
            <div className='flex flex-col w-full h-full px-2 mx-auto'>  
                {/* Row 1: Ship Name, Branches, Status 3 Col Grid*/}
                <div className='grid grid-cols-3 gap-2 py-2 font-semibold text-white'>
                    <input
                        type="text"
                        placeholder={`${jobData.shipName}`}
                        className='bg-mebablue-light px-2 py-1 rounded-md text-center'
                    />
                    <input
                        type="text"
                        placeholder={`${jobData.branch1} | ${jobData.branch2}`}
                        className='bg-mebablue-light px-2 py-1 rounded-md text-center'
                    />
                    {/* if job is open render box green and display 'Open' if filled render red and display 'Filled + date' */}
                    <select
                        value={status ? 'Open' : 'Filled'}
                        onChange={(e) => {
                            const isOpen = e.target.value === 'Open';
                            setStatus(isOpen);
                        }}
                        className={`${statusColor} px-2 py-1 rounded-md text-white text-center`}
                    >
                        <option value="Open">Open</option>
                        <option value="Filled">Filled</option>
                    </select>
                </div>
                {/* Row 2: Notes */}
                <div className='bg-mebablue-light rounded-md py-2 px-4 text-sm font-medium flex-col flex text-white items-center w-full mx-auto'>
                    <span className='font-semibold'>Requirements/Notes:</span>
                    <textarea
                        placeholder={`${jobData.notes}`}
                        rows={2}
                        className="bg-mebablue-light py-1 rounded-md text-white outline-none w-full mx-auto"
                    />
                </div>
                {/* Row 3: Details 4 col Grid */}
                <div className='grid grid-cols-4 gap-2 font-medium text-sm py-2 w-full mx-auto'>
                    <input
                        type="text"
                        placeholder={`${jobData.location}`}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        placeholder={`${jobData.days}`}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        placeholder={`${jobData.dateCalled}`}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        placeholder={`${jobData.joinDate}`}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        placeholder={`${jobData.company}`}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        placeholder={`${jobData.billet}`}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        placeholder={`${jobData.type}`}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        placeholder={`${jobData.crewRelieved}`}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                </div>
            </div>

            {/* Exit and Save Button, Exit redirect to Job board, Save result in a status message */}
            <div className="flex justify-center gap-4 p-4">
                <Link to='/board'> 
                {/* Exit button is linked directly to the job board */}
                    <button className='bg-red-500 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-600'>
                        Exit
                    </button>
                </Link>
                {/* Save button will pop up a status message window, current message is a placeholder */}
                <button 
                    className='bg-green-500 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 hover:bg-green-600'
                    onClick={save}
                >
                    Save
                </button>
            </div>

            {/* Message Popup */}
            {window && (
                <div className='fixed inset-0 flex items-center justify-center'>
                    <div className='bg-gray-300 p-6 rounded-md shadow-lg max-w-sm w-full border border-black-300'>
                        <h2 className='text-xl font-semibold'>{message}</h2>
                        <div className="mt-7 flex justify-center w-full">
                            <button
                                onClick={closeWindow}
                                className='bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditJob;