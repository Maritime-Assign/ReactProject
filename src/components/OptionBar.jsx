// Need this to manage login and logout states
import React, { useEffect, useState } from 'react'
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
import { Link } from 'react-router-dom'

// import supabase from '../supabaseClient' // for auth when implemented
import supabase from '../supabaseClient'

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
    /*add more here*/
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

//This function is to toggle dashboard on and off depending on log-in status
const CheckLogStatus = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true

    // initial session check
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(data.session?.user ?? null)
    }).catch((err) => {
      console.error('getSession error', err)
    })

    // subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (user) {
    
    return <NavBar items={nav_Items} />
  } else {
    //no one is logged in
  }
}

// contains the core 3 components
const OptionBar = () => {
    return (
        <nav className='navbar'>
            <Logo />

            <CheckLogStatus />
            <SessionManager />

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

// Uses supabase auth session instead of isLoggedIn state to determine login status
const SessionManager = () => {
    const [user, setUser] = useState(null)

    useEffect(() => {
        // Get current session on mount
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null)
        })

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    return (
        <div className='sessionContainer'>
            <Avatar
                alt={user ? 'User Avatar' : 'Guest Avatar'}
                src={user ? tempAccountPic : ''}
                className='userAvatar'
            />
            {user ? (
                <Link to='/dashboard' className='navLink'>
                    <Button onClick={handleLogout} className='navButton'>
                        <LogoutIcon className='navBarIcon' />
                        <span className='navButtonText'>Logout</span>
                    </Button>
                </Link>
            ) : (
                <Link to='/login' className='navLink'>
                    <Button className='navButton'>
                        <LoginIcon className='navBarIcon' />
                        <span className='navButtonText'>Login</span>
                    </Button>
                </Link>
            )}
        </div>
    )
}

export default OptionBar
