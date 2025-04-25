import { useState, useEffect } from 'react'
import Tile from '../components/Tile'
import Filter from '../components/Filter'
import fetchJobs from '../components/jobDataAPI' // Assume fetchJobs is an async function

function ViewBoard() {
    const [view, setView] = useState('tile')
    const [filterOpen, setFilterOpen] = useState(false)
    const [jobs, setJobs] = useState([]) // Initialize jobs as an empty array

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

    return (
        <>
            <div className='flex flex-col items-center mb-4 min-h-screen flex-grow max-w-[1280px] mx-auto'>
                <div className='w-full pt-4'>
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
                            {!filterOpen
                                ? jobs.map((job) => (
                                      <Tile
                                          key={job.id}
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
                                      />
                                  ))
                                : jobs
                                      .filter((job) => job.open)
                                      .map((job) => (
                                          <Tile
                                              key={job.id}
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
                                          />
                                      ))}
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {!filterOpen
                                ? jobs.map((job) => (
                                      <Tile
                                          key={job.id}
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
                                      />
                                  ))
                                : jobs
                                      .filter((job) => job.open)
                                      .map((job) => (
                                          <Tile
                                              key={job.id}
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
                                          />
                                      ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ViewBoard
