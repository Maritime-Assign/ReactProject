import { useState, useEffect } from 'react'
import FSBheader from '../components/FSBheader'
import getJobsArray from '../components/jobDataAPI'
import JobListing from '../components/JobListing'
import { ArrowDown } from 'lucide-react'
import supabase from '../api/supabaseClient'

const FSboard = () => {
    const [jobs, setJobs] = useState([]) // State to store the fetched jobs
    const [loading, setLoading] = useState(true) // State to track loading status
    const [error, setError] = useState(null) // State to track errors

    const refreshJobs = async () => {
        try {
            setLoading(true)
            const updatedJobs = await getJobsArray()
            setJobs(updatedJobs)
        } catch (err) {
            console.error("Error refreshing jobs:", err)
            setError("Failed to refresh jobs")
        }finally {
            setLoading(false)
        }
    }

    const handleClaimJob = async () => {
        refreshJobs()
    }

    useEffect(() => {
    let isMounted = true
    const fetchedOnce = { current: false }

    async function init() {
        // Ensure auth first
        try {
            const { data } = await supabase.auth.getSession()
            const accessToken = data?.session?.access_token
            if (accessToken) {
                await supabase.realtime.setAuth(accessToken)
            } else {
                console.warn("No access token; realtime private channel may fail.")
            }
        } catch (e) {
            console.error("Failed to get session:", e)
        }

        // Initial fetch
        if (!fetchedOnce.current) {
            fetchedOnce.current = true
            try {
                const fetchedJobs = await getJobsArray()
                if (isMounted) {
                    setJobs(fetchedJobs)
                    setError(null)
                }
            } catch (err) {
                console.error("Error fetching jobs:", err)
                if (isMounted) setError("Failed to load jobs")
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        // Create channel with longer join timeout
        const channel = supabase.channel("topic:jobs", {
            config: {
                private: true,
                timeout: 20000, // a bit longer
                broadcast: { ack: false }
            }
        })

        // Incremental updates
        let isSubscribed = false
        const onStatus = (status) => {
            console.log('Channel status:', status)
            isSubscribed = (status === 'SUBSCRIBED')
        }

        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'Jobs' },
          async (payload) => {
            if (!isSubscribed) return
            const { eventType, new: newRow, old: oldRow } = payload

            if (eventType === 'UPDATE') {
                const becameArchived =
                    (oldRow?.archivedJob === false || oldRow?.archivedJob == null) &&
                    newRow?.archivedJob === true
                if (becameArchived) {
                    await refreshJobs()
                    return
                }
            }

            setJobs((prev) => {
                switch (eventType) {
                    case 'INSERT': {
                        const exists = prev.some(j => j.id === newRow.id)
                        return exists ? prev : [...prev, newRow]
                    }
                    case 'UPDATE': {
                        return prev.map(j => j.id === newRow.id ? { ...j, ...newRow } : j)
                    }
                    case 'DELETE': {
                        const idToRemove = oldRow?.id ?? newRow?.id
                        return prev.filter(j => j.id !== idToRemove)
                    }
                    default:
                        return prev
                }
            })
          }
        )

        // Resilient subscribe: wait for visibility + online, backoff on failures
        let attempts = 0
        const maxAttempts = 5
        let retryTimer = null

        const canConnect = () =>
            document.visibilityState === 'visible' && navigator.onLine

        const scheduleRetry = (reason) => {
            if (!isMounted) return
            if (!canConnect()) return // hold retries while offline/hidden
            if (attempts >= maxAttempts) {
                console.error("Max subscribe retry attempts reached.")
                return
            }
            attempts += 1
            const delay = Math.min(30000, 1000 * Math.pow(2, attempts))
            console.warn(`Realtime ${reason}. Retrying subscribe in ${delay}ms (attempt ${attempts}/${maxAttempts})`)
            clearTimeout(retryTimer)
            retryTimer = setTimeout(() => {
                if (isMounted && canConnect()) {
                    try { channel.subscribe(onStatus) } catch (e) { console.error("Retry subscribe error:", e) }
                }
            }, delay)
        }

        const subscribeSafely = () => {
            if (!isMounted) return
            if (!canConnect()) return
            // small delay to avoid “closed before established” when tab just became visible
            setTimeout(() => {
                if (!isMounted || !canConnect()) return
                attempts = 0
                try {
                    channel.subscribe((status) => {
                        onStatus(status)
                        if (status === 'SUBSCRIBED') {
                            attempts = 0
                        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
                            scheduleRetry(status)
                        }
                    })
                } catch (e) {
                    console.error("Initial subscribe error:", e)
                    scheduleRetry("ERROR")
                }
            }, 250) // small debounce
        }

        // React to visibility/network changes
        const onVisible = () => subscribeSafely()
        const onOnline = () => subscribeSafely()
        document.addEventListener('visibilitychange', onVisible)
        window.addEventListener('online', onOnline)

        // Kick off initial subscribe
        subscribeSafely()

        // Polling fallback (10 min)
        const intervalId = setInterval(() => {
            if (isMounted) refreshJobs()
        }, 60000 * 10)

        // Cleanup
        return () => {
            isMounted = false
            clearInterval(intervalId)
            clearTimeout(retryTimer)
            document.removeEventListener('visibilitychange', onVisible)
            window.removeEventListener('online', onOnline)
            try { channel.unsubscribe() } catch (_) {}
            try { supabase.removeChannel(channel) } catch (_) {}
        }
    }

    const cleanupPromise = init()
    return () => cleanupPromise.then((cleanup) => cleanup && cleanup())
    }, [])


    if (loading) {
        return <div>Loading jobs...</div> // Show a loading message while fetching
    }

    if (error) {
        return <div>Error: {error}</div> // Show an error message if fetching fails
    }
    
    // sort fetched jobs by oldest to newest before display
    // applies to regular and passThru
    jobs.sort((a, b) => new Date(a.joinDate) - new Date(b.joinDate));

    const regularJobs = jobs.filter((j) => j.passThru === false)
    const passThruJobs = jobs.filter((j) => j.passThru === true)

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
                            abbrev={job.Users?.abbreviation}
                        />
                    ))}

                    {passThruJobs.length > 0 && (
                        <div className='flex items-center bg-amber-100 p-2 text-[13px] justify-center font-mont font-semibold border-b border-slate-300'>
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