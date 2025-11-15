import { useState, useEffect } from 'react'
import Tile from '../components/Tile'
import Filter from '../components/Filter'
import fetchJobs from '../components/jobDataAPI' // Assume fetchJobs is an async function
import { IoArrowBack, IoClose } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

const ManageJobs = () => {
    const [view, setView] = useState('tile')
    const [filterOpen, setFilterOpen] = useState(false)
    const [jobs, setJobs] = useState([]) // Initialize jobs as an empty array
    const [searchWord, setSearchWord] = useState('')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function loadJobs() {
            try {
                const fetchedJobs = await fetchJobs() // Fetch jobs asynchronously
                setJobs(fetchedJobs || []) // Ensure jobs is always an array
            } catch (error) {
                console.error('Failed to fetch jobs:', error)
                setJobs([]) // Set jobs to an empty array in case of an error
            }
        }
        loadJobs()
        setLoading(false)
    }, [])

    const filteredJobs = jobs.filter((job) => {
        const term = searchWord.toLowerCase()
        if (!term && job.archivedJob) return false

        const vessel = (job.shipName || '').toLowerCase()
        const region = (job.region || '').toLowerCase()
        const hall = (job.hall || '').toLowerCase()
        const joinDate = (job.joinDate || '').toString().toLowerCase()
        const passThru = job.passThru ? 'passthru pass' : ''
        const nightCard = job.nightCardEarlyReturn
            ? 'night card nightcard early return'
            : ''
        const msc = job.msc ? 'msc' : ''

        return (
            vessel.includes(term) ||
            region.includes(term) ||
            hall.includes(term) ||
            joinDate.includes(term) ||
            passThru.includes(term) ||
            nightCard.includes(term) ||
            msc.includes(term)
        )
    })
    // Update handler
    const handleJobUpdate = (updatedJob) => {
        setJobs((prevJobs) =>
            prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
        )
    }

    return (
        <div className='w-full pt-4 flex flex-col max-w-[1280px] mx-auto font-mont'>
            <div className='flex py-4 bg-mebablue-dark rounded-md w-full shadow-xl relative items-center'>
                <button
                    onClick={() => navigate(-1)}
                    className='bg-mebagold shadow-md rounded-full p-2 absolute left-4 text-2xl text-center text-mebablue-dark hover:bg-yellow-300'
                >
                    <IoArrowBack className='w-6 h-6' />
                </button>

                {/*Title text*/}
                <div className='grow text-center'>
                    <span className='text-white text-2xl font-medium'>
                        Manage Jobs
                    </span>
                </div>
                {/* Search Bar */}
                <div className='grow mx-4 relative overflow-visible'>
                    <input
                        type='text'
                        placeholder='Search vessel, region, hall, or join date…'
                        className='w-full py-2 pl-4 pr-10 rounded-lg text-sm text-gray-700 bg-white focus:outline-none border-2 border-mebablue-dark focus:border-mebagold'
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                    />
                    {/* Spinner | Clear button */}
                    <div className='absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center'>
                        {loading ? (
                            <div className='animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full w-4 h-4'></div>
                        ) : searchWord ? (
                            <button
                                data-testid='clearButton'
                                onClick={() => {
                                    setSearchWord('')
                                }}
                                className='text-gray-400 hover:text-gray-600 bg-white rounded-full p-1'
                            >
                                <IoClose className='w-4 h-4' />
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
            <Filter setView={setView} setFilterOpen={setFilterOpen} />
            <div className='w-full'>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-4'>
                    {(filterOpen === true
                        ? filteredJobs.filter((j) => j.open == 'Open')
                        : filterOpen === 'filled'
                        ? filteredJobs.filter((j) => j.open.includes('Filled'))
                        : filteredJobs
                    ).map((job) => (
                        <Tile
                            key={job.id}
                            job={job}
                            onJobUpdate={handleJobUpdate} // 🔑 pass handler
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ManageJobs
