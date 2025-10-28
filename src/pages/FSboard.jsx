import { useState, useEffect } from 'react'
import FSBheader from '../components/FSBheader'
import getJobsArray from '../components/jobDataAPI'
import JobListing from '../components/JobListing'
import { ArrowDown } from 'lucide-react'

const FSboard = () => {
    const [jobs, setJobs] = useState([]) // State to store the fetched jobs
    const [loading, setLoading] = useState(true) // State to track loading status
    const [error, setError] = useState(null) // State to track errors

    const handleClaimJob = async () => {
        setLoading(true)
        try {
            const updatedJobs = await getJobsArray()
            setJobs(updatedJobs)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let isMounted = true

        async function fetchJobs() {
            try {
                const fetchedJobs = await getJobsArray()
                if (!isMounted) return
                setJobs(fetchedJobs)
                setError(null)
            } catch (error) {
                if (!isMounted) return
                console.error('Error fetching jobs:', error)
                setError('Failed to load jobs')
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchJobs()

        const intervalId = setInterval(() => {
            fetchJobs()
        }, 60000)

        return () => {
            isMounted = false
            clearInterval(intervalId)
        }
    }, [])

    if (loading) {
        return <div>Loading jobs...</div> // Show a loading message while fetching
    }

    if (error) {
        return <div>Error: {error}</div> // Show an error message if fetching fails
    }

    const regularJobs = jobs.filter((j) => !j.passThru)
    const passThruJobs = jobs.filter((j) => j.passThru)

    return (
        <div className='w-full flex flex-col my-4 shadow-[0_0_5px_5px_rgba(0,0,0,0.05)] rounded-md'>
            <FSBheader />

            {jobs.length === 0 ? (
                <div className='text-center py-4 text-gray-500'>
                    No jobs available
                </div>
            ) : (
                <>
                    {regularJobs.map((job, index) => (
                        <JobListing
                            key={job.id}
                            id={job.id}
                            {...job}
                            handleClaimJob={handleClaimJob}
                            region={job.region}
                            hall={job.hall}
                            open={job.open}
                            fillDate={job.FillDate}
                            dateCalled={job.dateCalled}
                            shipName={job.shipName}
                            joinDate={job.joinDate}
                            billet={job.billet}
                            type={job.type}
                            days={job.days}
                            location={job.location}
                            crewRelieved={job.crewRelieved}
                            notes={job.notes}
                            company={job.company}
                            rowIndex={index}
                            nightCard={job.nightCardEarlyReturn}
                            msc={job.msc}
                            passThru={job.passThru}
                        />
                    ))}

                    {passThruJobs.length > 0 && (
                        <div className='flex items-center bg-red-200 p-3 text-[13px] justify-center font-mont font-semibold border-b border-slate-300'>
                            Pass Thru{' '}
                            <ArrowDown size={16} className='mx-4 text-black' />
                        </div>
                    )}

                    {passThruJobs.map((job, index) => (
                        <JobListing
                            key={job.id}
                            id={job.id}
                            {...job}
                            handleClaimJob={handleClaimJob}
                            region={job.region}
                            hall={job.hall}
                            open={job.open}
                            fillDate={job.FillDate}
                            dateCalled={job.dateCalled}
                            shipName={job.shipName}
                            joinDate={job.joinDate}
                            billet={job.billet}
                            type={job.type}
                            days={job.days}
                            location={job.location}
                            crewRelieved={job.crewRelieved}
                            notes={job.notes}
                            company={job.company}
                            rowIndex={index}
                            nightCard={job.nightCardEarlyReturn}
                            msc={job.msc}
                            passThru={job.passThru}
                        />
                    ))}
                </>
            )}
        </div>
    )
}

export default FSboard
