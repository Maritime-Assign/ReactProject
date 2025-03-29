import './PermissionsColors.css'

function ButtonInput({ LabelText, LastDiv }) {
        if (!LastDiv) {
            return (
            <div className='flex ml-3 mr-3 justify-between border border-black border-b-0 bg-white h-10'>
                <div className='self-center ml-2'>
                    Users
                </div>
                <div className='self-center'>
                    { LabelText }
                </div>
                <button
                    className='Button w-32 h-7 self-center text-white mr-2 rounded-full'           
                >
                    Manage Roles
                </button>
            </div>
            )
        }
        else {
            return(
            <div className='flex ml-3 mr-3 justify-between border border-black bg-white h-10'>
                <div className='self-center ml-2'>
                    ...
                </div>
                <div className='self-center'>
                    { LabelText }
                </div>
                <button
                    className='Button w-32 h-7 self-center text-white mr-2 rounded-full'           
                >
                    Manage Roles
                </button>
            </div>
            );
        }
}

export default function UserPermissions() {
    return (
        <div className='Body w-3/5'>
            {/* header css class is used to specify a specific color */}
            <div className='Header flex w-full h-15 text-center'>
                <span className='px-6 self-center text-4xl text-white font-semibold'>
                    User Permissions
                </span>
            </div>
            {/* div containing navigational elements under header */}
            <div className='flex h-10 mt-5 mb-3 justify-center'>
                <div className='flex-1 self-center p-2 m-6 bg-white border-black border-1 rounded-md'>
                    <input
                        className='ml-5'
                        type='text'
                        placeholder='Search for a specific user'
                    />
                </div>
            </div>
            {/* form containing all checkbox inputs */}
            <form className='grid grid-flow-row justify-stretch m-3 pb-10'>
                <ButtonInput LabelText='Roles' LastDiv={false} /> 
                <ButtonInput LabelText='Union Leader' LastDiv={false} /> 
                <ButtonInput LabelText='Administrative Member' LastDiv={false} /> 
                <ButtonInput LabelText='Union Member' LastDiv={false} /> 
                <ButtonInput LabelText='Viewer' LastDiv={false} /> 
                <ButtonInput LabelText='...' LastDiv={true} /> 
            </form>
        </div>
    );
}
