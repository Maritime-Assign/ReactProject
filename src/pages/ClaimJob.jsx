import ClaimJobEntry from "../components/ClaimJobEntry"

const ClaimJob = () => {
    return (
        <div className= 'flex flex-col'>
            
            <div className='justify-self-start pt-4 w-40'>
                <div className='px-4 py-4 text-center bg-mebablue-dark rounded-md shadow-lg'>
                    <span className='text-white text-2xl font-semibold'>
                        Claim Job
                    </span>
                </div>
            </div>
            
            {/*Front end representtation of search bar NOT FULLY IMPLEMENTED*/}
            <div className='flex py-3 px-3 gap-3 rounded-md'> 
                <div className = '-mt-2 -ml-3'>
                <input type = "text-search"
                        placeholder='Search job' 
                        className='bg-white border rounded-md focus:ring-2 focus:ring-blue-500'/>
                </div>
                <button className = 'w-40 bg-mebablue-light rounded-md text-white hover:bg-mebablue-hover'>
                    Search
                </button>
            </div>

            {/*Dummy data representation of job list of open jobs for the claim job page*/}
            <div className = 'p-2 bg-mebablue-dark text-white font-semibold w-full'>
                    Open Jobs
                </div>
            <div className= 'flex grid grid-cols-12 p-2 bg-neutral-200 border-b font-semibold'>
                <div>
                    Job ID
                </div>
                <div>
                    Branch 1
                </div>
                <div>
                    Branch 2
                </div>
                <div>
                    Date Called
                </div>
                <div>
                    Ship Name
                </div>
                <div>
                    Join Date
                </div>
                <div>
                    Billet
                </div>
                <div>
                    Type
                </div>
                <div>
                    Days
                </div>
                <div>
                    Location
                </div>
                <div>
                    Company
                </div>
                <div>
                    Crew Relieved
                </div>
            </div>
            <ClaimJobEntry/>
            <ClaimJobEntry/>
            <ClaimJobEntry/>
            <ClaimJobEntry/>
            <div className= 'flex grid grid-cols-12 p-2 bg-neutral-200 border-b'>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
                <div>
                    ...
                </div>
            </div>

            {/*Area of claim job page that allows for an admin user to assign to an employeee 
            based on ID. Currently does nothing as this is a frontend mockup only*/}
            <div className ='pt-4'>
                <div className='px-4 py-4 text-center bg-mebablue-dark w-54'>
                    <span className='text-white font-semibold'>
                        Assign Job to Employee
                    </span>
                </div>
                <div className = 'bg-neutral-200 w-120 border-1'>
                    <div className='flex py-3 gap-3 border-b-1'> 
                        <div className='ml-2 w-35 py-3'>
                            <span className='text-semibold'>
                                Enter Employee ID:
                            </span>
                        </div>
                        {/*Area for user to enter in an Employee ID*/}
                        <div className = '-mt-2'>
                            <input type = 'text'
                                placeholder='Enter Employee ID'
                                className='justify-item-start bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                    <div className='flex py-3 gap-3'> 
                        <div className='ml-2 w-35 py-3'>
                            <span className='text-semibold'>
                                Enter Job ID:
                            </span>
                        </div>

                        {/*Area for user to enter in a job ID*/}
                        <div className = '-mt-2'>
                            <input type = 'text'
                                placeholder='Enter Job ID'
                                className='justify-item-start bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>
                </div>
                <div className = 'pt-4'>
                    {/*Button to confirm the assigning of a job to an employee*/}
                    <button className = 'w-50 h-12 bg-mebablue-light rounded-md text-white hover:bg-mebablue-hover'>
                                Assign Job to Employee
                        </button>
                </div>
            </div>
        </div>
    )
}

export default ClaimJob