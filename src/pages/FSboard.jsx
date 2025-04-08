import FSBheader from '../components/FSBheader'
import Filter from '../components/Filter'
import jobData from '../components/jobData'
import JobListing from '../components/JobListing'

const FSboard = () => {
    return (
        <div className='w-full h-screen flex flex-col py-2'>
            <FSBheader />
            {jobData.map((job, index) => (
                <JobListing
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
