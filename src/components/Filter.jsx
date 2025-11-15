import { MdAddBox } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const Filter = ({ setView, setFilterOpen }) => {
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState('all')

    const handleAddJob = () => {
        navigate('/addJob')
    }

    const handleFilterChange = (filter) => {
        setActiveFilter(filter)
        if (filter === 'all') {
            setFilterOpen(false)
        } else if (filter === 'open') {
            setFilterOpen(true)
        } else if (filter === 'filled') {
            // You'll need to pass a new prop or extend setFilterOpen
            // Option 1: Use setFilterOpen with a string value instead of boolean
            setFilterOpen('filled')
        }
    }
    return (
        <div className='w-full py-2'>
            <div className='flex items-center justify-between bg-white border border-gray-300 rounded-lg p-3 shadow-sm'>
                {/* Toggle filter buttons */}
                <div className='flex gap-1 bg-gray-100 rounded-lg p-1'>
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeFilter === 'all'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Jobs
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeFilter === 'open'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => handleFilterChange('open')}
                    >
                        Open
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeFilter === 'filled'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => handleFilterChange('filled')}
                    >
                        Filled
                    </button>
                </div>

                {/* Add Job button */}
                <button
                    className='bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium text-sm border border-gray-300'
                    onClick={handleAddJob}
                >
                    <MdAddBox className='text-xl text-mebablue-dark' />
                    Add Job
                </button>
            </div>
        </div>
    )
}

export default Filter
