import { IoGrid, IoList } from 'react-icons/io5'
import { Routes, Route, Link } from 'react-router-dom'

const Filter = ({ setView }) => {
    return (
        <div className='w-full py-4'>
            <div className='flex gap-2 w-full bg-mebablue-dark rounded-md text-lg p-3 text-white font-semibold shadow-xl'>
                {/* Tile layout button, select to switch the viewing mode to tile, does nothing if already in tile view */}
                <button
                    className='bg-mebablue-light rounded-md py-1 px-4 hover:bg-mebablue-hover flex-1'
                    onClick={() => setView('tile')}
                >
                    <IoGrid />
                </button>
                {/* List layout button, select to switch the viewing mode to tile, does nothing if already in list view */}
                <button
                    className='bg-mebablue-light rounded-md py-1 px-4 hover:bg-mebablue-hover flex-1'
                    onClick={() => setView('list')}
                >
                    <IoList />
                </button>
                {/* Next two buttons filter jobs, to be implemented */}
                <button className='bg-mebablue-light rounded-md py-1 px-4 hover:bg-mebablue-hover flex-1'>
                    View All Jobs
                </button>
                <button className='bg-mebablue-light rounded-md py-1 px-4 hover:bg-mebablue-hover flex-1'>
                    View Open Jobs
                </button>
                <Link to='/addJob'> 
                {/* This button opens up a new page to add job */}
                    <button className='bg-mebablue-light rounded-md py-1 px-4 hover:bg-mebablue-hover flex-1'>
                        Add New Job
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default Filter
