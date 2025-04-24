import './PermissionsColors.css'
import Dropdown from './Dropdown/Dropdown.jsx'
import DropdownItem from './Dropdown/DropdownItem.jsx'

function ButtonInput({ User, LabelText, LastDiv }) {
    if (!LastDiv) {
        return (
            <div className='flex col-span-3 ml-3 mr-3 justify-between border border-black border-b-0 bg-white h-10'>
                <div className='self-center ml-2'>
                    { User }
                </div>
                <div className='self-center'>
                    { LabelText }
                </div>
                <div>
                    <Dropdown buttonText='Manage Roles'
                    content={
                        <DropdownItem>
                        <span>Option 1:</span><input id='option 1' type='checkbox' />
                        </DropdownItem>
                    }
                    />
                </div>
            </div>
        )
    }
    else {
        return(
            <div className='flex col-span-3 ml-3 mr-3 justify-between border border-black bg-white h-10'>
                <div className='self-center ml-2'>
                    ...
                </div>
                <div className='self-center'>
                    { LabelText }
                </div>
                <div>
                    <Dropdown buttonText='Manage Roles'
                    content={
                        <DropdownItem>
                        <span>Option 1:</span><input id='option 1' type='checkbox' />
                        </DropdownItem>
                    }
                    />
                </div>
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
            <form className='grid grid-cols-3 m-3 pb-10'>
                <ButtonInput User='User1' LabelText='Union Leader' LastDiv={false} /> 
                <ButtonInput User='User2' LabelText='Administrative Member' LastDiv={false} /> 
                <ButtonInput User='User3' LabelText='Union Member' LastDiv={false} /> 
                <ButtonInput User='User4' LabelText='Viewer' LastDiv={false} /> 
                <ButtonInput User='User5' LabelText='...' LastDiv={true} /> 
            </form>
        </div>
    );
}
