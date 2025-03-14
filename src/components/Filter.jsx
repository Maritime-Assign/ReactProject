import { IoGrid, IoList } from 'react-icons/io5'

const Filter = () => {
    return (
        <div className='w-full py-4'>
            <div className='grid grid-cols-6 gap-2 w-full bg-neutral-300 rounded-md text-lg p-2 text-black'>
                <button
                    className='bg-neutral-200 rounded-md flex justify-center items-center text-2xl
                                col-span-1 hover:bg-neutral-100'
                >
                    <IoGrid />
                </button>
                <button
                    className='bg-neutral-200 rounded-md flex justify-center items-center text-2xl
                                col-span-1 hover:bg-neutral-100'
                >
                    <IoList />
                </button>
                <button className='bg-neutral-200 rounded-md py-1 hover:bg-neutral-100 col-span-2'>
                    View All Jobs
                </button>
                <button className='bg-neutral-200 rounded-md hover:bg-neutral-100 col-span-2'>
                    View Open Jobs
                </button>
            </div>
        </div>
    )
}

export default Filter
