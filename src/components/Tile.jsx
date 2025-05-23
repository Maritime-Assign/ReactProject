// tile component which takes in props as parameter (data)

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
        return 'bg-mebablue-light px-3 py-1 rounded-md font-medium text-white font-mont'
    }

    const navigate = useNavigate()

    const handleEdit = () => {
        navigate('/editjob', {
            state: { jobData: props }, // Pass the specific job data
        })
    }

    return (
        // main tile container
        <div className='flex flex-col bg-mebablue-hover w-full h-full rounded-md'>
            {/* top window bar */}
            <div className='bg-mebablue-dark w-full h-8 flex rounded-t-md justify-end'>
                <button
                    onClick={handleEdit}
                    className='bg-mebablue-light rounded-md text-sm my-auto px-2 text-white font-medium mr-2 hover:bg-mebablue-hover font-mont'
                >
                    Edit
                </button>
            </div>
            {/* Tile Content container*/}
            <div className='flex flex-col w-full h-full px-2 justify-center'>
                {/* Row 1: Ship Name, Branches, Status 3 Col Grid*/}
                <div className='grid grid-cols-3 gap-2 py-2 font-medium text-white font-mont'>
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
                    <span className='font-medium font-mont'>
                        Requirements/Notes:
                    </span>
                    <span className='font-mont'>- {props.notes}</span>
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
