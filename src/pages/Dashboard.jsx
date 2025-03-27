import React from 'react'
import { Link } from 'react-router-dom'
import '../pages/Dashboard.css'

// Import the PNG file
//import jobBoardIcon from '../assets/jobBoard.png'
//import userPermissionsIcon from '../assets/user_permissions.png'
//import devToolsIcon from '../assets/dev_tools.png';

const Dashboard = () => {
    return (
        <div>
            <h3>Marine Engineers Beneficial Association (MEBA)</h3>
            <div className='container'>
                <div className='options'>
                    <div className='option'>
                        <Link to='/login'>
                            <span>Login</span>
                        </Link>
                    </div>
                    <div className='option'>
                        <Link to='/board'>
                            <img src={jobBoardIcon} alt='Job Board' />
                        </Link>
                    </div>
                    <div className='option'>
                        <Link to='/developer-tools'>
                            <img src={devToolsIcon} alt='Dev Tools' />
                        </Link>
                    </div>
                    <div className='option'>
                        <Link to='/user-permissions'>
                            <img
                                src={userPermissionsIcon}
                                alt='User Permissions'
                            />
                        </Link>
                    </div>
                    <div className='option'>
                        <Link to='/user-listings'>
                            <span>User Listings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
