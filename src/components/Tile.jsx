// tile component which takes in props as parameter (data)

import React, { useState, useEffect } from 'react'

const Tile = (props) => {
    const [status, setStatus] = useState(props.open)
    // make sure the status matches incoming prop
    useEffect(() => {
        setStatus(props.open)
    }, [props.open])
    // status color green if state is true, red if false (open vs filled)
    const statusColor = status == true ? 'bg-green-600' : 'bg-red-600'
    // repeated style fn for details grid
    const boxStyle = () => {
        return 'bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white'
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
                    className='flex-1 bg-white border border-gray-300 px-3 py-1 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 non-interactive'    
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
                    disabled
                />
                <input
                    type='text'
                    placeholder='Payout'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    disabled
                />
            </div>
            

            {/* Larger scrollable textbox */}
            <div className='p-4'>
                <textarea
                    placeholder='Job Description'
                    className='w-full bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 overflow-y-auto'
                    rows="6"
                    readOnly
                />
            </div>

            {/* Additional wide textbox */}
            <div className="flex flex-col gap-4 p-4">
                <input
                    type='text'
                    placeholder='Related Equipment'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    disabled
                />
                <input
                    type='text'
                    placeholder='Tags'
                    className='flex-1 bg-white border border-gray-300 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    disabled
                />
        // main tile container
        <div className='flex flex-col bg-mebablue-hover w-full h-fit rounded-md'>
            {/* top window bar */}
            <div className='bg-mebablue-dark w-full h-8 flex rounded-t-md justify-end'>
                <button className='bg-mebablue-light rounded-md text-sm my-auto px-2 text-white font-medium mr-2 hover:bg-mebablue-hover'>
                    Edit
                </button>
            </div>
            {/* Tile Content container*/}
            <div className='flex flex-col w-full h-full px-2'>
                {/* Row 1: Ship Name, Branches, Status 3 Col Grid*/}
                <div className='grid grid-cols-3 gap-2 py-2 font-semibold text-white'>
                    <span className='bg-mebablue-light rounded-md px-2 py-1 text-center'>
                        {props.shipName}
                    </span>
                    <span className='bg-mebablue-light px-2 py-1 rounded-md text-center'>
                        {props.branch1} | {props.branch2}
                    </span>
                    {/* if job is open render box green and display 'Open' if filled render red and display 'Filled + date' */}
                    <span
                        className={`${statusColor} px-2 py-1 rounded-md text-white text-center`}
                    >
                        {props.open
                            ? 'Open'
                            : `Filled ${props.fillDate ? props.fillDate : ''}`}
                    </span>
                </div>
                {/* Row 2: Notes */}
                <div className='bg-mebablue-light rounded-md py-2 px-4 text-sm font-medium flex-col flex text-white'>
                    <span className='font-semibold'>Requirements/Notes:</span>
                    <span>- {props.notes}</span>
                </div>
                {/* Row 3: Details 4 col Grid */}
                <div className='grid grid-cols-4 gap-2 font-medium text-sm py-2'>
                    <div className={`${boxStyle()} col-span-2`}>
                        Location: {props.location}
                    </div>
                    <div className={`${boxStyle()} col-span-2`}>
                        Days: {props.days}
                    </div>
                    <div className={`${boxStyle()} col-span-2`}>
                        Date Called: {props.dateCalled}
                    </div>
                    <div className={`${boxStyle()} col-span-2`}>
                        Join Date: {props.joinDate}
                    </div>
                    <div className={`${boxStyle()} col-span-2`}>
                        Company: {props.company}
                    </div>
                    <div className={`${boxStyle()} col-span-1`}>
                        Billet: {props.billet}
                    </div>
                    <div className={`${boxStyle()} col-span-1`}>
                        Type: {props.type}
                    </div>
                    <div className={`${boxStyle()} col-span-4`}>
                        Crew Relieved: {props.crewRelieved}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Tile
