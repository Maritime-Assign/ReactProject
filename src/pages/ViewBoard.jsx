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
            <div className='w-full'>
                {view === 'tile' ? (
                    <div className='grid md:grid-cols-2 grid-cols-1 justify-start place-items-center gap-4'>
                        {(filterOpen ? jobs.filter((j) => j.open) : jobs).map(
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
                        {(filterOpen ? jobs.filter((j) => j.open) : jobs).map(
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
