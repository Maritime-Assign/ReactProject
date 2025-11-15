import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'

describe('Dashboard navigation', () => {
    const stubRoutes = {
        '/manage-jobs': 'Manage Jobs',
        '/addjob': 'Add Job Listing',
        '/fsb': 'View Job Board',
        '/history': 'View Changes',
        '/users-roles': 'Manage Users',
        '/add-user': 'Add User',
    }

    const allowedTiles = Object.keys(stubRoutes).map((r) => {
        switch (r) {
            case '/manage-jobs':
                return 'manageJobs'
            case '/addjob':
                return 'addJobListing'
            case '/fsb':
                return 'viewJobBoard'
            case '/history':
                return 'viewChanges'
            case '/users-roles':
                return 'manageUsers'
            case '/add-user':
                return 'addUser'
            default:
                return ''
        }
    })

    test('renders all allowed tiles and routes correctly when clicked', async () => {
        const user = userEvent.setup()

        for (const [path, label] of Object.entries(stubRoutes)) {
            // fresh render each iteration
            render(
                <MemoryRouter initialEntries={['/']}>
                    <Routes>
                        <Route
                            path='/'
                            element={<Dashboard allowedTiles={allowedTiles} />}
                        />
                        <Route path={path} element={<h1>{label}</h1>} />
                    </Routes>
                </MemoryRouter>
            )

            // find and click tile
            const tile = screen.getByRole('link', {
                name: new RegExp(label, 'i'),
            })
            expect(tile).toBeInTheDocument()

            await user.click(tile)

            // confirm navigation
            expect(
                await screen.findByRole('heading', { level: 1, name: label })
            ).toBeInTheDocument()

            // cleanup between iterations
            cleanup()
        }
    })
})
