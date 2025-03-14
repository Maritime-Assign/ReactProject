import React, { useState, useEffect } from 'react'

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
        <div className='flex flex-col bg-neutral-300 w-full min-h-[20rem] rounded-md transform transition-transform duration-300 hover:scale-102 hover:z-10'>
            <div className='bg-amber-300 w-full h-8 flex rounded-t-md'></div>
            {/* Content */}
            <div className='flex flex-col w-full h-full px-2'>
                {/* Row 1: Ship Name, Branches, Status */}
                <div className='grid grid-cols-3 gap-2 py-2 font-semibold'>
                    <span className='bg-blue-300 rounded-md px-2 py-1'>
                        {props.shipName}
                    </span>
                    <span className='bg-purple-400 px-2 py-1 rounded-md'>
                        {props.branch1} | {props.branch2}
                    </span>
                    <span className={`${statusColor} px-2 py-1 rounded-md`}>
                        {props.status}
                    </span>
                </div>
                {/* Row 2: Notes */}
                <div className='bg-amber-100 rounded-md py-2 px-4 text-sm font-medium flex-col flex'>
                    <span className='font-semibold'>Requirements/Notes:</span>
                    <span>- {props.notes}</span>
                </div>
                {/* Row 3: Details Grid */}
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
                        Join date: {props.joinDate}
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
