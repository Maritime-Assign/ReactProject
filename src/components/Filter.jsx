// Filter component is top bar of job board to filter/sort jobs or display list/tile view

import { IoGrid, IoList } from 'react-icons/io5'
import { MdAddBox } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const Filter = ({ setView, setFilterOpen }) => {
    const navigate = useNavigate()

    const handleAddJob = () => {
        navigate('/addJob')
    }

    return (
        <div className='w-full py-2'>
            <div className='grid grid-cols-5 gap-2 w-full bg-mebablue-dark rounded-md text-lg font-mont p-3 text-white font-medium shadow-xl'>
                {/* Tile layout button, select to switch the viewing mode to tile, does nothing if already in tile view */}
                <button
                    className='bg-mebablue-light rounded-md flex justify-center items-center text-xl
                                col-span-1 hover:bg-mebablue-hover'
                    onClick={() => setView('tile')}
                >
                    <IoGrid />
                </button>
                {/* List layout button, select to switch the viewing mode to tile, does nothing if already in list view */}
                <button
                    className='bg-mebablue-light rounded-md flex justify-center items-center text-2xl
                                col-span-1 hover:bg-mebablue-hover'
                    onClick={() => setView('list')}
                >
                    <IoList />
                </button>
                {/* Next two buttons filter jobs, to be implemented */}
                <button
                    className='bg-mebablue-light rounded-md py-1 hover:bg-mebablue-hover col-span-1'
                    onClick={() => setFilterOpen(false)}
                >
                    View All Jobs
                </button>
                <button
                    className='bg-mebablue-light rounded-md hover:bg-mebablue-hover col-span-1'
                    onClick={() => setFilterOpen(true)}
                >
                    View Open Jobs
                </button>

                <button
                    className='bg-mebablue-light rounded-md hover:bg-mebablue-hover flex flex-row items-center justify-center'
                    onClick={handleAddJob}
                >
                    <div className='text-2xl mr-2'>
                        <MdAddBox />
                    </div>
                    Add Job
                </button>
            </div>
        </div>
    )
}

export default Filter
