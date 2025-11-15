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
import DashboardDispatch from '../pages/DashboardDispatch'

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

// For the Dispatch dashboard
describe('Dispatch Positive Tests', () => {
    test('Dispatch dashboard renders all tiles and buttons work', () => {
        render(
            <MemoryRouter>
                <DashboardDispatch
                    allowedTiles={[
                        'manageJobs',
                        'addJobListing',
                        'viewChanges',
                        'viewJobBoard',
                    ]}
                />
            </MemoryRouter>
        )

        expect(screen.getByText(/Manage Jobs/i)).toBeInTheDocument()
        expect(screen.getByText(/Add Job Listing/i)).toBeInTheDocument()
        expect(screen.getByText(/View Changes/i)).toBeInTheDocument()
        expect(screen.getByText(/View Job Board/i)).toBeInTheDocument()

        expect(getLinkFromLabel(/Manage Jobs/i)).toHaveAttribute(
            'href',
            '/manage-jobs'
        )
        expect(getLinkFromLabel(/Add Job Listing/i)).toHaveAttribute(
            'href',
            '/addjob'
        )
        expect(getLinkFromLabel(/View Changes/i)).toHaveAttribute(
            'href',
            '/history'
        )
        expect(getLinkFromLabel(/View Job Board/i)).toHaveAttribute(
            'href',
            '/fsb'
        )
    })
})

// "Negative Tests": These are to test for unexpected behavior when interacting with the dashboard components
describe('Dispatch Dash Negative Tests', () => {
    test('Dispatch dashboard with no allowed tiles renders no tiles', () => {
        render(
            <MemoryRouter>
                <DashboardDispatch allowedTiles={[]} />
            </MemoryRouter>
        )
        expect(screen.queryByText(/Manage Jobs/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/Add Job Listing/i)).not.toBeInTheDocument()

        expect(screen.queryByText(/View Changes/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/View Job Board/i)).not.toBeInTheDocument()
    })

    // 'invalidTile' is included in allowedTiles to verify that the component
    // ignores unknown tiles and does not render anything unexpected.
    test('Dispatch dashboard does not render invalid tile', () => {
        render(
            <MemoryRouter>
                <DashboardDispatch
                    allowedTiles={[
                        'invalidTile',
                        'manageJobs',
                        'addJobListing',
                        'viewChanges',
                        'viewJobBoard',
                    ]}
                />
            </MemoryRouter>
        )
        // valid tiles renders
        expect(screen.getByText(/Manage Jobs/i)).toBeInTheDocument()
        expect(screen.getByText(/Add Job Listing/i)).toBeInTheDocument()
        expect(screen.getByText(/View Changes/i)).toBeInTheDocument()
        expect(screen.getByText(/View Job Board/i)).toBeInTheDocument()
        // invalid tile does not render
        expect(screen.queryByText(/invalidTile/i)).not.toBeInTheDocument()
        // Check other tiles are not rendered when they are not part of allowedTiles
        expect(screen.queryByText(/Manage Users/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/Add User/i)).not.toBeInTheDocument()
    })

    test('Dispatch Dashboard tiles have valid links', () => {
        render(
            <MemoryRouter>
                <DashboardDispatch
                    allowedTiles={[
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
    })
})
