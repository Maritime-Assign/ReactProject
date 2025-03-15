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
            className='flex flex-col bg-neutral-300 w-full min-h-[20rem] rounded-md transform 
                        transition-transform duration-300 hover:scale-102 hover:z-10'
        >
            <div className='bg-amber-300 w-full h-8 flex rounded-t-md'></div>
            {/* Two textboxes on the first line of each tile */}
            <div className='flex w-full gap-4 p-4'>
                <input
                    type='text'
                    placeholder='Ship Name'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                    type='text'
                    placeholder='Open/Closed'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
            </div>

            {/* Larger scrollable textbox */}
            <div className='p-4'>
                <textarea
                    placeholder='Requirements/notes'
                    className='w-full bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 overflow-y-auto'
                    rows="6"
                />
            </div>

            {/* Additional wide textbox */}
            <div className="flex flex-col gap-4 p-4">
                <input
                    type='text'
                    placeholder='Other Info'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                    type='text'
                    placeholder='Other Info'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
            </div>
        </div>
    )
}

export default Tile
