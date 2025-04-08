import { useState } from 'react'
import JobEntry from '../components/JobEntry'

const AddJob = () => {
    return (
        <div className='w-full pt-4 flex flex-col items-center max-w-[1280px] mx-auto'>
            <div className='flex justify-center py-4 bg-mebablue-dark rounded-t-md w-full shadow-xl'>
                <span className='text-white text-2xl font-semibold'>
                    Add New Job
                </span>
            </div>
            <div className='flex justify-center py-4 bg-mebablue-dark rounded-b-md w-full shadow-xl'>
                <JobEntry />
            </div>
        </div>
    )
}

export default AddJob
