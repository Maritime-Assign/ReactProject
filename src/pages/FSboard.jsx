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
            } catch (err) {
                console.error('Error fetching jobs:', err)
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
        <div className='w-full h-screen flex flex-col py-2'>
            <FSBheader />
            {jobs.map((job, index) => (
                <JobListing
                    key={job.id} // Add a unique key for each job
                    id={job.id}
                    branch1={job.branch1}
                    branch2={job.branch2}
                    open={job.open}
                    fillDate={job.fillDate}
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
