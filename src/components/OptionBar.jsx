// Import the needed stuff to make things look nice
import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import HomeIcon from '@mui/icons-material/Home'
import WorkIcon from '@mui/icons-material/Work'
import LinkIcon from '@mui/icons-material/Link'
import ContactsIcon from '@mui/icons-material/Contacts'
import './OptionBar.css'
import logo from '../assets/maritimelogo4.png'
import { Link } from 'react-router-dom'

// header functional component
export default function OptionBar() {
    // center menu items with actions
    const centerMenuItems = [
        {
            text: 'Home',
            icon: <HomeIcon className='navBarIcon' fontSize='medium' />,
            onClick: () => {},
        },
        {
            text: 'Job Board',
            icon: <WorkIcon className='navBarIcon' fontSize='medium' />,
            onClick: () => {
                /* navigation logic */
            },
        },
        {
            text: 'M.E.B.A. Union',
            icon: <LinkIcon className='navBarIcon' fontSize='medium' />,
            onClick: () => {
                window.open('https://www.mebaunion.org/')
            },
        },
        {
            text: 'Contact',
            icon: <ContactsIcon className='navBarIcon' fontSize='medium' />,
            onClick: () => {
                window.open('https://www.mebaunion.org/contact/')
            },
        },
    ]

    /* 
    We are working with Mui components which offer a lot of flexibility and responsiveness built it to make the nav header for the web app.
    We can use sx to define properties of MUI components, however for the sake of simplistic code the majority of the stylings are in the Header.css file to avoid inline css.

        - AppBar: 
                container for the top navigation bar of the application
                position="static" -> AppBar will stay at the top of the page and will not scroll. Other options: fixed, absolute, sticky

        
        - Toolbar:
                 child of the AppBar used to hold and arrange the contents of the AppBar

        - Box:
                like a preset "div" container for other elements

    To modify or add  parameters such as spacing, padding etc., reference the Header.css file
    
    */

    // now we can actually render the header component
    return (
        // AppBar is the top navigation bar
        <AppBar position='static' elevation={0}>
            {/* Toolbar holds the objects in the appbar */}
            <Toolbar className='toolbar'>
                {/* MEBA LOGO */}
                <img
                    src={logo}
                    alt='Maritime Assign Logo'
                    className='maritimeLogo'
                />

                {/* Center menu buttons */}
                <Box className='navBarContainer'>
                    {centerMenuItems.map((item, index) => (
                        // loop to create center menu buttons
                        <Button
                            key={index}
                            color='inherit'
                            onClick={item.onClick}
                            className='navButton'
                        >
                            {/* the corresponding icon image from those we imported is rendered */}
                            {item.icon}
                            {/* spacing between icon and text */}
                            <span className='navButtonText'>{item.text}</span>
                        </Button>
                    ))}
                </Box>
            </Toolbar>
        </AppBar>
    )
}
