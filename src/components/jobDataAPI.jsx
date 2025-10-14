import { supabase } from '../api/supabaseClient.js'

async function fetchJobs() {
  const { data, error } = await supabase.from('Jobs').select() // Fetch all jobs from the Jobs table

  if (error) {
    console.error('Error fetching jobs:', error)
    return [] // Return an empty array in case of an error
  }

  return data || []
}

async function getJobsArray() {
  const jobs = await fetchJobs()
  return jobs // Return the jobs array
}

export default getJobsArray
