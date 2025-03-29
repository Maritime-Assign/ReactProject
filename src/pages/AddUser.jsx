import './AddUser.css'
import UserEntry from '../components/UserEntry'

const AddUser = () => {
    return (
        <div className= 'flex flex-col'>
            {/*Title of Page*/}
            <div className='justify-self-start pt-4 w-50'>
                <div className='px-4 py-4 text-center bg-mebablue-dark rounded-md shadow-lg'>
                    <span className='text-white text-2xl font-semibold'>
                        Add New User
                    </span>
                </div>
            </div>

            {/*Front end mockup for search bar*/}
            <div className='flex py-3 px-3 gap-3 rounded-md'> 
                <div className = '-mt-2 -ml-3'>
                <input type = "text-search"
                        placeholder='Search User by ID, Name, Email, or Role' 
                        className='bg-white border rounded-md focus:ring-2 focus:ring-blue-500'/>
                </div>
                <button className = 'w-40 bg-mebablue-light rounded-md text-white hover:bg-mebablue-hover'>
                    Search
                </button>
            </div>

            {/*Front end mockup of user list*/}
            <div className = 'divide-y'>
                {/*Header for user list*/}
                <div className = 'p-2 bg-mebablue-dark text-white font-semibold'>
                    User list
                </div>
                <div className= 'flex grid grid-cols-5 p-2 gap-4 bg-neutral-200 border-b font-semibold '>
                    <div className = 'basis-1/5'>
                        Employee ID
                    </div>
                    <div className = 'basis-1/5'>
                        First Name
                    </div>
                    <div className = 'basis-1/5'>
                            Last Name
                    </div>
                    <div className = 'basis-1/5'>
                            Email Address
                    </div>
                    <div className = 'basis-1/5'>
                            User role(s)
                    </div>
                </div>

                {/*Section of user list that has placeholder data*/}
                <UserEntry/>
                <UserEntry/>
                <UserEntry/>
                <UserEntry/>

                {/*Section of user list that represents additional users*/}
                <div className= 'flex grid grid-cols-5 p-2 gap-4 bg-neutral-200'>
                    <div className = 'w-full'>
                        ...
                    </div>
                    <div className = 'w-full'>
                        ...
                    </div>
                    <div className = 'w-full'>
                        ...
                    </div>
                    <div className = 'w-full'>
                        ...
                    </div>
                    <div className = 'w-full'>
                        ...
                    </div>
                </div>
            </div>
            
            {/*Front end mockup of adding a new user to the userbase*/}
            <div className = 'pt-4 pb-4 grid grid-cols-2'>
                {/*New user info section*/}
                <div> 
                    <div className='px-4 py-4 text-center bg-mebablue-dark w-36'>
                        <span className='text-white font-semibold'>
                            New User Info
                        </span>
                    </div>
                    <div className = 'bg-neutral-200 w-125 border-1'>
                        <div className='flex py-3 gap-3 border-b-1'> 
                            <div className='w-40 text-center py-3 rounded-md'>
                                <span className='text-semibold'>
                                    Enter Employee ID:
                                </span>
                            </div>
                            <div className = '-mt-2'>
                                <input type = 'text'
                                    placeholder='Enter New User Employee ID'
                                    className='justify-item-start bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                        </div>
                        <div className='flex py-3 gap-3 border-b-1'> 
                            <div className='w-40 text-center py-3'>
                                <span className='text-semibold'>
                                    Enter First Name:
                                </span>
                            </div>
                            <div className = '-mt-2'>
                                <input type = 'text'
                                    placeholder='Enter New User First Name'
                                    className='justify-item-start bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                        </div>
                        <div className='flex py-3 gap-3 border-b-1'> 
                            <div className='w-40 text-center py-3'>
                                <span className='text-semibold'>
                                    Enter Last Name:
                                </span>
                            </div>
                            <div className = '-mt-2'>
                                <input type = 'text'
                                    placeholder='Enter New User Last Name'
                                    className='justify-item-start bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                        </div>
                        <div className='flex py-3 gap-3 border-b-1'> 
                            <div className='w-40 text-center py-3'>
                                <span className='text-semibold'>
                                    Enter Email:
                                </span>
                            </div>
                            <div className = '-mt-2'>
                                <input type = 'text'
                                    placeholder='Enter New User Email'
                                    className='justify-item-start bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                        </div>
                        <div className='flex py-3 gap-3'> 
                            <div className='w-40 text-center py-3 rounded-md'>
                                <span className='text-semibold'>
                                    Enter Password:
                                </span>
                            </div>
                            <div className = '-mt-2'>
                                <input type = 'text'
                                    placeholder='Enter New User Password'
                                    className='justify-item-start bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/*New user role selection section*/}
                <div> 
                    <div className='px-4 py-4 text-center bg-mebablue-dark w-42'>
                            <span className='text-white font-semibold'>
                                New User Role(s)
                            </span>
                    </div>
                    <div className= 'bg-neutral-200 w-70 border-1'>
                        <div className='h-[75px] flex py-3 gap-3 border-b-1'> 
                            <div className=' w-50 text-center py-3'>
                                <span className='text-semibold'>
                                    Union Leader
                                </span>
                            </div>
                            <div className = '-mt-1'>
                                <input type="checkbox" name="myCheckbox"/>
                            </div>
                        </div>
                        <div className='h-[75px] flex py-3 gap-3 border-b-1'> 
                            <div className='w-50 text-center py-3'>
                                <span className='text-semibold'>
                                    Administrative Member
                                </span>
                            </div>
                            <div className = '-mt-1'>
                                <input type="checkbox" name="myCheckbox"/>
                            </div>
                        </div>
                        <div className='h-[75px] flex py-3 gap-3 border-b-1'> 
                            <div className='w-50 text-center py-3'>
                                <span className='text-semibold'>
                                    Union Member
                                </span>
                            </div>
                            <div className = '-mt-1'>
                                <input type="checkbox" name="myCheckbox"/>
                            </div>
                        </div>
                        <div className='h-[75px] flex py-3 gap-3'> 
                            <div className='w-50 text-center py-3'>
                                <span className='text-semibold'>
                                    Viewer
                                </span>
                            </div>
                            <div className = '-mt-1'>
                                <input type="checkbox" name="myCheckbox"/>
                            </div>
                        </div>
                    </div>

                    {/*Front end mockup of button to submit info for new user*/}
                    <div className = 'pt-[26px]'>
                        <button className = 'w-40 h-12 bg-mebablue-light rounded-md text-white hover:bg-mebablue-hover'>
                                Add New User
                        </button>
                    </div>
                </div>
            </div> 
        </div>
    )
}
export default AddUser