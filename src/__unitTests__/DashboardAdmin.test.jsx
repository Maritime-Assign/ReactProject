/*
Method for Unit tests of the Dashboard components

If you want to replicate the tests you must first:
    -- npm install --save-dev @testing-library/react @testing-library/jest-dom
       - This package provides  matchers to test the state of the DOM and the components.
    
    -- Use [npm test] command to run the tests.
       - This runs all test files in src matching pattern *.test.{js,jsx,ts,tsx}
*/

// mock routing library
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

import DashboardAdmin from '../pages/Dashboard'
import { describe } from 'vitest'

// Helper to find the <a> link from a tile label
// First find the label element, then go up to the closest div (the tile container)
// then find the <a> link inside that div
const getLinkFromLabel = (labelText) => {
    const labelEl = screen.getByText(labelText)
    return labelEl ? labelEl.closest('a') : null
}
// Tests for the Dashboard components
// Each test renders a different dashboard with a set of allowed tiles
// then checks that the expected tiles are present and that their links are correct
// and that tiles that should not be present are not in the document

// For the Admin dashboard
describe('Admin Dash Positive Tests', () => {
    test('Admin dashboard renders all tiles and buttons work', () => {
        render(
            <MemoryRouter>
                <DashboardAdmin
                    allowedTiles={[
                        'manageUsers',
                        'addUser',
                        'viewChanges',
                        'viewJobBoard',
                        'manageJobs',
                        'addJobListing',
                    ]}
                />
            </MemoryRouter>
        )
        // Check that all expected tiles are present
        expect(screen.getByText(/Manage Users/i)).toBeInTheDocument()
        expect(screen.getByText(/Add User/i)).toBeInTheDocument()
        expect(screen.getByText(/View Changes/i)).toBeInTheDocument()
        expect(screen.getByText(/View Job Board/i)).toBeInTheDocument()
        expect(screen.getByText(/Manage Jobs/i)).toBeInTheDocument()
        expect(screen.getByText(/Add Job Listing/i)).toBeInTheDocument()

        // Check that the links for each tile are correct
        expect(getLinkFromLabel(/Manage Users/i)).toHaveAttribute(
            'href',
            '/users-roles'
        )
        expect(getLinkFromLabel(/Add User/i)).toHaveAttribute(
            'href',
            '/add-user'
        )
        expect(getLinkFromLabel(/View Changes/i)).toHaveAttribute(
            'href',
            '/history'
        )
        expect(getLinkFromLabel(/View Job Board/i)).toHaveAttribute(
            'href',
            '/fsb'
        )
        expect(getLinkFromLabel(/Manage Jobs/i)).toHaveAttribute(
            'href',
            '/manage-jobs'
        )
        expect(getLinkFromLabel(/Add Job Listing/i)).toHaveAttribute(
            'href',
            '/addjob'
        )
    })

    test('Admin Dashboard tiles have valid links', () => {
        render(
            <MemoryRouter>
                <DashboardAdmin
                    allowedTiles={[
                        'manageUsers',
                        'addUser',
                        'viewChanges',
                        'viewJobBoard',
                        'addJobListing',
                        'manageJobs',
                    ]}
                />
            </MemoryRouter>
        )
        expect(getLinkFromLabel(/Manage Jobs/i)).toHaveAttribute(
            'href',
            '/manage-jobs'
        )
        expect(getLinkFromLabel(/Add Job Listing/i)).toHaveAttribute(
            'href',
            '/addjob'
        )
        expect(getLinkFromLabel(/View Job Board/i)).toHaveAttribute(
            'href',
            '/fsb'
        )
        expect(getLinkFromLabel(/View Changes/i)).toHaveAttribute(
            'href',
            '/history'
        )
        expect(getLinkFromLabel(/Manage Users/i)).toHaveAttribute(
            'href',
            '/users-roles'
        )
        expect(getLinkFromLabel(/Add User/i)).toHaveAttribute(
            'href',
            '/add-user'
        )
    })
})

// "Negative Tests": These are to test for unexpected behavior when interacting with the dashboard components
describe('Admin Dash Negative Tests', () => {
    test('Admin dashboard with no allowed tiles renders no tiles', () => {
        render(
            <MemoryRouter>
                <DashboardAdmin allowedTiles={[]} />
            </MemoryRouter>
        )
        expect(screen.queryByText(/Manage Jobs/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/Add Job Listing/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/View Job Board/i)).not.toBeInTheDocument()

        expect(screen.queryByText(/View Changes/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/Manage Users/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/Add User/i)).not.toBeInTheDocument()
    })
})
