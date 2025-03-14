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
        <div
            className='flex flex-col bg-neutral-300 w-full min-h-[20rem] rounded-md transform 
                        transition-transform duration-300 hover:scale-102 hover:z-10'
        >
            <div className='bg-amber-300 w-full h-8 flex rounded-t-md'></div>
        </div>
    )
}

export default Tile
