// Need this to manage login and logout states
import React from 'react'
// mui containers
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
// display icons
import HomeIcon from '@mui/icons-material/Home'
import WorkIcon from '@mui/icons-material/Work'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
// mui avatar for login logout
import Avatar from '@mui/material/Avatar'
// pictures as objects
import logo from '../assets/maritimelogo5.png'
import tempAccountPic from '../assets/tom.jpg'
// styles file
import './OptionBar.css'
// import link to nav to internal pages
import { Link, useNavigate } from 'react-router-dom'
// import user auth context to manage login state
import { UserAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

// array for center nav options

const nav_Items = [
    {
        text: 'Home', // name
        icon: <HomeIcon className='navBarIcon' />, // icon and css assignment
        to: '/dashboard', // on click go to dash
    },
    {
        text: 'Job Board',
        icon: <WorkIcon className='navBarIcon' />,
        to: '/fsb', // on click go to job board
    },
]

/*structure of option bar:
        optionBar
            |
          / | \
        /   |   \
    lOGO NAVBAR LOGIN/OUT
            |
          /   \
    Button#1 Button#2
*/

// contains the core 3 components
const OptionBar = () => {
    const { user, signOut, role, loadingSession } = UserAuth()

    const isLoggedIn = !!user

    const handleLogout = async () => {
        if (!user) return
        try {
            await signOut()
            // Navigation handled by effect elsewhere; no immediate navigate
        } catch (err) {
            console.error('Error signing out:', err)
        }
    }

    if (loadingSession) return <LoadingSpinner />

    return (
        <nav className='navbar'>
            <Logo />
            {isLoggedIn && <NavBar items={nav_Items} />}
            <SessionManager
                isLoggedIn={isLoggedIn}
                handleLogout={handleLogout}
            />
        </nav>
    )
}

// logo component renders a container div with an image element
// both the container and the image have their own CSS linked with className
const Logo = () => (
    <div className='logoContainer'>
        <img src={logo} alt='Maritime Assign Logo' className='maritimeLogo' />
    </div>
)

// navbar component renders a button for each of the nav items.
// navbar has its own css
const NavBar = ({ items }) => (
    <Box className='navBarContainer'>
        {items.map((item, index) => (
            <NavButton key={index} item={item} />
        ))}
    </Box>
)

// button components that are rendered from NavBar
// renders a button with icon and text with its own css
const NavButton = ({ item }) => (
    <Button className='navButton'>
        <Link to={item.to} className='navLink'>
            {item.icon}
            <span className='navButtonText'>{item.text}</span>
        </Link>
    </Button>
)

// session manager component deals with the authentication login/logout ui
// isLoggedIn determines the current authentication state
const SessionManager = ({ isLoggedIn, handleLogout }) => (
    <div>
        {isLoggedIn ? (
            <div className='sessionContainer'>
                <Link to='/userprofile'>
                    <Avatar
                        alt={isLoggedIn ? 'User Avatar' : 'Guest Avatar'}
                        src={isLoggedIn ? tempAccountPic : ''}
                        className='userAvatar'
                        title='user settings'
                    />
                </Link>
                <Button onClick={handleLogout} className='navButton'>
                    <LogoutIcon className='navBarIcon' />
                    <span className='navButtonText'>Logout</span>
                </Button>
            </div>
        ) : (
            <div className='sessionContainer'>
                <Avatar
                    alt={isLoggedIn ? 'User Avatar' : 'Guest Avatar'}
                    src={isLoggedIn ? tempAccountPic : ''}
                    className='userAvatar'
                />
                <Link to='/login' className='navLink'>
                    <Button className='navButton'>
                        <LoginIcon className='navBarIcon' />
                        <span className='navButtonText'>Login</span>
                    </Button>
                </Link>
            </div>
        )}
    </div>
)

export default OptionBar
