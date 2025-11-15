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
                const fetchedJobs = await fetchJobs()
                setJobs(fetchedJobs || [])
            } catch (error) {
                console.error('Failed to fetch jobs:', error)
                setJobs([])
            } finally {
                setLoading(false)
            }
        }
        loadJobs()
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
                    aria-label='Back'
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
            </div>
            <Filter
                setView={setView}
                setFilterOpen={setFilterOpen}
                searchWord={searchWord}
                setSearchWord={setSearchWord}
                loading={loading}
            />
            <div className='w-full'>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-4'>
                    {(filterOpen === true
                        ? filteredJobs.filter((j) => j.open == 'Open')
                        : filterOpen === 'filled'
                        ? filteredJobs.filter((j) => j.open.includes('Filled'))
                        : filteredJobs.sort((a, b) => {
                              // Sort by dateCalled (oldest first)
                              return (
                                  new Date(a.dateCalled) -
                                  new Date(b.dateCalled)
                              )
                          })
                    ).map((job) => (
                        <Tile
                            key={job.id}
                            job={job}
                            onJobUpdate={handleJobUpdate}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ManageJobs
