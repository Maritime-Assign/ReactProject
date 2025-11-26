import { MdAddBox } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { IoClose } from 'react-icons/io5'

const Filter = ({ setFilterOpen, searchWord, setSearchWord, loading }) => {
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
            <div className='flex items-center justify-between gap-4 bg-white border border-gray-300 rounded-lg p-3 shadow-sm'>
                {/* Toggle filter buttons */}
                <div className='flex gap-1 bg-gray-100 rounded-lg p-1'>
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                            activeFilter === 'all'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Jobs
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                            activeFilter === 'open'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => handleFilterChange('open')}
                    >
                        Open
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                            activeFilter === 'filled'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => handleFilterChange('filled')}
                    >
                        Filled
                    </button>
                </div>

                {/* Search bar - grows to fill space */}
                <div className='relative flex-grow'>
                    <input
                        type='text'
                        placeholder='Search vessel, region, hall, or join date…'
                        className='w-full py-2 pl-4 pr-10 rounded-lg text-sm text-gray-900 border border-gray-300 bg-white focus:outline-none focus:border-mebagold'
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                    />
                    <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center'>
                        {loading ? (
                            <div className='animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full w-4 h-4'></div>
                        ) : searchWord ? (
                            <button
                                onClick={() => setSearchWord('')}
                                className='text-gray-400 hover:text-gray-600 bg-white rounded-full p-1'
                            >
                                <IoClose className='w-4 h-4' />
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Add Job button */}
                <button
                    className='bg-gray-100 text-mebablue-dark px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium text-sm border border-gray-300 cursor-pointer'
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
