import React, { useState, useEffect } from 'react'
import './Tile.css'; 

const Tile = (props) => {
    const [status, setStatus] = useState(props.open)

    useEffect(() => {
        setStatus(props.open)
    }, [props.open])

    const statusColor = status == true ? 'bg-green-500' : 'bg-red-500'

    const boxStyle = () => {
        return 'bg-neutral-100 px-3 py-1 rounded-md font-semibold'
    }

    return (
        <div
            className='flex flex-col bg-[#4b86a7] w-full min-h-[20rem] rounded-md transform 
                        transition-transform duration-300 hover:scale-102 hover:z-10 shadow-xl'
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
                    src=''
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
        </div>
    )
}

export default Tile
