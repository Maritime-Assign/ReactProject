import React from 'react'
import { useEffect, useState } from 'react'

const JobListing = ({ rowIndex, ...props }) => {
    const [status, setStatus] = useState(props.open)
    // make sure the status matches incoming prop
    useEffect(() => {
        setStatus(props.open)
    }, [props.open])

    const rowClass = rowIndex % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'

    const cellStyle = 'px-1 py-1 items-center justify-center flex'
    const statusColor = status == true ? 'bg-green-300' : 'bg-red-300'

    return (
        <div className='grid grid-cols-20 w-full text-sm font-mont font-semibold h-fit'>
            <div
                className={`col-span-1 px-1 py-2 ${rowClass} items-center justify-center flex`}
            >
                <span
                    className={`${statusColor} px-3 py-1 rounded-md font-semibold`}
                >
                    {props.open
                        ? 'Open'
                        : `Filled ${props.fillDate ? props.fillDate : ''}`}
                </span>
            </div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}>
                <span>{props.branch1}</span>
            </div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}>
                <span>{props.branch2}</span>
            </div>

            <div className={`col-span-2  ${cellStyle} ${rowClass}`}>
                <span>{props.dateCalled}</span>
            </div>
            <div className={`col-span-2  ${cellStyle} ${rowClass}`}>
                <span>{props.shipName}</span>
            </div>
            <div className={`col-span-2  ${cellStyle} ${rowClass}`}>
                <span>{props.joinDate}</span>
            </div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}>
                <span>{props.billet}</span>
            </div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}>
                <span>{props.type}</span>
            </div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}>
                <span>{props.days}</span>
            </div>
            <div className={`col-span-2  ${cellStyle} ${rowClass}`}>
                <span>{props.location}</span>
            </div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}>
                <span>{props.company}</span>
            </div>
            <div className={`col-span-2  ${cellStyle} ${rowClass}`}>
                <span>{props.crewRelieved}</span>
            </div>
            <div className={`col-span-3 text-left ${cellStyle} ${rowClass}`}>
                <span>{props.notes}</span>
            </div>
        </div>
    )
}

export default JobListing
