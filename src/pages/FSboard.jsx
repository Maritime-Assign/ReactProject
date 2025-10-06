import { useState, useEffect } from 'react'
import FSBheader from '../components/FSBheader'
import getJobsArray from '../components/jobDataAPI'
import JobListing from '../components/JobListing'

const FSboard = () => {
    const [jobs, setJobs] = useState([]) // State to store the fetched jobs
    const [loading, setLoading] = useState(true) // State to track loading status
    const [error, setError] = useState(null) // State to track errors

    useEffect(() => {
        async function fetchJobs() {
            try {
                const fetchedJobs = await getJobsArray() // Call the jobDataAPI function
                setJobs(fetchedJobs) // Update the jobs state with the fetched data
                setError(null) // Clear any previous errors
            } catch (error) {
                console.error('Error fetching jobs:', error)
                setError('Failed to load jobs') // Set an error message
            } finally {
                setLoading(false) // Set loading to false after fetching
            }
        }

        fetchJobs() // Initial fetch

        const intervalId = setInterval(fetchJobs, 60000) // Fetch jobs every 60 seconds

        return () => clearInterval(intervalId) // Cleanup interval on component unmount
    }, []) // Empty dependency array ensures this runs only once

    if (loading) {
        return <div>Loading jobs...</div> // Show a loading message while fetching
    }

    if (error) {
        return <div>Error: {error}</div> // Show an error message if fetching fails
    }

    return (
        <div className='w-full max-h-screen flex flex-col my-2 shadow-[0_0_5px_5px_rgba(0,0,0,0.05)] rounded-md'>
            <FSBheader />
            {jobs.map((job, index) => (
                <JobListing
                    key={job.id} // the primary key for each job
                    id={job.id}

                    {...job}
                    handleClaimJob={() => {
                        // need to refresh jobs after claiming'
                        setLoading(true);
                        getJobsArray().then(setJobs).finally(() => setLoading(false));
                    }} 

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
                />
            ))}
        </div>
    )
}

export default FSboard
