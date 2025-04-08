import { useState } from 'react'
import Tile from '../components/Tile'
import Filter from '../components/Filter'
import jobData from '../components/jobData'

function ViewBoard() {
    // Default view is set to tile and view all jobs , state is changed with filter buttons to change view
    const [view, setView] = useState('tile')
    const [filterOpen, setFilterOpen] = useState(false)

    return (
        <>
            <div className='flex flex-col items-center mb-4 min-h-screen flex-grow max-w-[1280px] mx-auto'>
                <div className='w-full pt-4'>
                    <div className='flex justify-center py-4 bg-mebablue-dark rounded-md w-full shadow-xl'>
                        <span className='text-white text-2xl font-semibold'>
                            MEBA Open Board Jobs
                        </span>
                    </div>
                </div>
                <Filter setView={setView} setFilterOpen={setFilterOpen} />
                <div className='w-full'>
                    {/* This logic switch between list and tile view depending on which button is pressed */}
                    {view == 'tile' ? (
                        <div className='grid md:grid-cols-2 grid-cols-1 justify-start place-items-center gap-4'>
                            {!filterOpen
                                ? jobData.map((job) => (
                                      <Tile
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
                                : jobData
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
                                ? jobData.map((job) => (
                                      <Tile
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
                                : jobData
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
