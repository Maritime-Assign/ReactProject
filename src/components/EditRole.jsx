import './PermissionsColors.css'

function CheckBoxInput({ LabelText, LastDiv }) {
        if (!LastDiv) {
            return (
            <div className='flex justify-between border border-black border-b-0 bg-white h-10 w-60'>
                <label className='self-center ml-2'>
                    { LabelText }
                </label>
                <input 
                    className='mr-2'           
                    type='checkbox'
                />
            </div>
            )
        }
        else {
            return(
            <div className='flex justify-between border border-black bg-white h-10 w-60'>
                <label className='self-center ml-2'>
                    { LabelText }
                </label>
                <input 
                    className='mr-2'           
                    type='checkbox'
                />
            </div>
            );
        }
}

export default function EditRole() {
    return (
        <div className='Body w-1/2'>
            {/* header css class is used to specify a specific color */}
            <div className='Header flex w-full h-15 text-center'>
                <span className='px-6 self-center text-4xl text-white font-semibold'>
                    Edit Role/New Role
                </span>
            </div>
            {/* div containing navigational elements under the header */}
            <div className='flex h-10 mt-5 mb-3 justify-center'>
                <div className='self-center p-2 w-30 mr-6 bg-white text-center border-black border-1'>
                    <span className='mt-10'>
                        Role Name
                    </span>
                </div>
                <div className='self-center p-2 bg-white border-black border-1 rounded-md'>
                    <input
                        className='ml-5'
                        type='text'
                        placeholder='Role Name Here'
                    />
                </div>
            </div>

            {/* form containing all checkbox inputs */}
            <form className='grid place-content-center m-3 pb-10'>
                <CheckBoxInput LabelText='Permissions' LastDiv={false}/>
                <CheckBoxInput LabelText='Edit User Permissions' LastDiv={false}/>
                <CheckBoxInput LabelText='Edit Account Info' LastDiv={false}/>
                <CheckBoxInput LabelText='Generate Reports' LastDiv={false}/>
                <CheckBoxInput LabelText='Manage Job Postings' LastDiv={false}/>
                <CheckBoxInput LabelText='Submit Applications' LastDive={false}/>
                <CheckBoxInput LabelText='Track Application Status' LastDiv={false}/>
                <CheckBoxInput LabelText='Verify Submissions' LastDiv={false}/>
                <CheckBoxInput LabelText='View Archive' LastDiv={false}/>
                <CheckBoxInput LabelText='View Job Claims Analytics' LastDiv={false}/>
                <CheckBoxInput LabelText='...' LastDiv={true}/>
            </form>
        </div>
    );
}
