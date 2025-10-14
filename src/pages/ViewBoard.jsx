import { useState, useEffect } from 'react'
import Tile from '../components/Tile'
import Filter from '../components/Filter'
import fetchJobs from '../components/jobDataAPI' // Assume fetchJobs is an async function
import { IoArrowBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

function ViewBoard() {
    const [view, setView] = useState('tile')
    const [filterOpen, setFilterOpen] = useState(false)
    const [jobs, setJobs] = useState([]) // Initialize jobs as an empty array
    const [searchWord, setSearchWord] = useState('');
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
    }, [])

    const filteredJobs = jobs.filter((job) => {
        const term = searchWord.toLowerCase()
        if (!term) return true

        const vessel = (job.shipName || '').toLowerCase()
        const region = (job.region || '').toLowerCase()
        const hall = (job.hall || '').toLowerCase()
        const joinDate = (job.joinDate || '').toString().toLowerCase()

        return (
            vessel.includes(term) ||
            region.includes(term) ||
            hall.includes(term) ||
            joinDate.includes(term)
        )
    })

    // Update handler
    const handleJobUpdate = (updatedJob) => {
        setJobs((prevJobs) =>
            prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
        )
    }

    return (
        <div className='w-full pt-4 flex flex-col max-w-[1280px] mx-auto'>
            <div className='flex py-4 bg-mebablue-dark rounded-md w-full shadow-xl relative items-center'>
                <button
                    aria-label="back"
                    onClick={() => navigate(-1)} // navigate back one page
                    className='bg-mebagold shadow-md rounded-full p-2 absolute left-4 text-2xl text-center text-mebablue-dark'
                >
                    <svg
                        className='w-6 h-6 hover:w-6.5 hover:h-6.5 transition-all ease-in-out text-center items-center justify-center drop-shadow-md'
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='currentColor'
                    >
                        <IoArrowBack />
                    </svg>
                </button>

                <div className='flex justify-center py-4 bg-mebablue-dark rounded-md w-full shadow-xl'>
                    <span className='text-white text-2xl font-medium font-mont'>
                        Manage Jobs
                    </span>
                </div>
            </div>
            <Filter setView={setView} setFilterOpen={setFilterOpen} />
            <div className='flex justify-center py-4 rounded-md w-full mb-6'>
                <div className="w-full max-w-2xl px-4">
                    <input
                        type="text"
                        placeholder="Search vessel, region, hall, or join date…"
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                        className="w-full max-w-[700px] px-4 py-2 border border-gray-300 rounded text-center shadow-sm"
                    />
                </div>
            </div>
            <div className='w-full'>
                {view === 'tile' ? (
                    <div className='grid md:grid-cols-2 grid-cols-1 justify-start place-items-center gap-4'>
                        {(filterOpen ? filteredJobs.filter((j) => j.open) : filteredJobs).map(
                            (job) => (
                                <Tile
                                    key={job.id}
                                    job={job}
                                    onJobUpdate={handleJobUpdate} // 🔑 pass handler
                                />
                            )
                        )}
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {(filterOpen ? filteredJobs.filter((j) => j.open) : filteredJobs).map(
                            (job) => (
                                <Tile
                                    key={job.id}
                                    job={job}
                                    onJobUpdate={handleJobUpdate} // 🔑 pass handler
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ViewBoard
