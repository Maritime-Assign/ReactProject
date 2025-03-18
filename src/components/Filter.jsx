import { IoGrid, IoList } from 'react-icons/io5'

const Filter = ({ setView }) => {
    return (
        <div className='w-full py-4'>
            <div className='grid grid-cols-6 gap-2 w-full bg-mebablue-dark rounded-md text-lg p-3 text-white font-semibold shadow-xl'>
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
                <button className='bg-mebablue-light rounded-md py-1 hover:bg-mebablue-hover col-span-2'>
                    View All Jobs
                </button>
                <button className='bg-mebablue-light rounded-md hover:bg-mebablue-hover col-span-2'>
                    View Open Jobs
                </button>
            </div>
        </div>
    )
}

export default Filter
