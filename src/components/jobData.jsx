import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

// Fetch jobs and export them
export let jobs = []

async function fetchJobs() {
  const { data, error } = await supabase.from('Jobs').select()

  if (error) {
    console.error('Error fetching jobs:', error)
    jobs = []
  } else {
    jobs = data || []
  }
}

fetchJobs()

function Page() {
  const [localJobs, setLocalJobs] = useState([])

  useEffect(() => {
    setLocalJobs(jobs)
  }, [])

  return (
    <div>
      {localJobs.map((job) => (
        <li key={job.id}>{job.id}</li>
      ))}
    </div>
  )
}

export default Page
