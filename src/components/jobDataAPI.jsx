import supabase from '../api/supabaseClient'

async function fetchJobs() {
  // Fetch all non-archived jobs from the Jobs table
  const { data, error } = await supabase
    .from('Jobs')
    .select()
    .or('archivedJob.is.null,archivedJob.eq.false') // Exclude archived jobs

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