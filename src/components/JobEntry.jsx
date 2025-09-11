import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const JobEntry = () => {

    const [message, setMessage] = useState('');
    const [window, setWindow] = useState(false);

    {/* Functions to open and close status windows depend on actions*/}
    const save = () => {
        setMessage('Status Message');
        setWindow(true);
    };

    const closeWindow = () => {
        setWindow(false);
    }

    return (
        <div
            className='flex flex-col bg-[#4b86a7] w-full min-h-[20rem] rounded-md transform 
                        transition-transform duration-300 hover:z-10 shadow-xl'
        >
            {/* Post heading */}
            <div className='bg-[#003b5c] w-full h-12 flex rounded-t-md'>
                <h1 className='text-amber-300 px-4 py-3 font-semibold'>
                    Post Author (#777)
                </h1>
            </div>

            {/* Post dropdown and image button*/}
            <div className='flex gap-4 p-4 pb-0'>
                <select
                    className='flex-1 bg-white border border-gray-300 px-3 py-1 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'    
                >
                    <option value='open'>Open</option>
                    <option value='closed'>Closed</option>
                </select>
                <img
                    src={''}
                    className='w-20 h-15 bg-white border border-gray-300 px-1 py-1 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'    
                />
            </div>

            {/* Two textboxes on the first line of each tile */}
            <div className='flex w-full gap-4 p-4'>
                <input
                    type='text'
                    placeholder='Job Title'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                    type='text'
                    placeholder='Payout'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
            </div>
            

            {/* Larger scrollable textbox */}
            <div className='p-4'>
                <textarea
                    placeholder='Job Description'
                    className='w-full bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 overflow-y-auto'
                    rows="6"
                />
            </div>

            {/* Additional wide textbox */}
            <div className="flex flex-col gap-4 p-4">
                <input
                    type='text'
                    placeholder='Related Equipment'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                    type='text'
                    placeholder='Tags'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
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
    )
}

export default JobEntry