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
  const tileDiv = labelEl.closest('div')
  return tileDiv?.querySelector('a')
}
// Tests for the Dashboard components
// Each test renders a different dashboard with a set of allowed tiles
// then checks that the expected tiles are present and that their links are correct
// and that tiles that should not be present are not in the document

// For the Dispatch dashboard
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
    '/board'
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