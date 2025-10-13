/*
Method for Unit tests of the Dashboard components

If you want to replicate the tests you must first:
    -- npm install --save-dev @testing-library/react @testing-library/jest-dom
       - This package provides  matchers to test the state of the DOM and the components.
    
    -- Use [npm test] command to run the tests.
       - This runs all test files in src matching pattern *.test.{js,jsx,ts,tsx}
*/

import { render, screen, waitFor } from '@testing-library/react';
import ViewBoard from '../pages/ViewBoard';
import { MemoryRouter } from 'react-router-dom';
import fetchJobs from '../components/jobDataAPI';

// mock fetchJobs
vi.mock('../components/jobDataAPI', () => ({
    default: vi.fn(),
}));

// mock tile
vi.mock('../components/Tile', () => ({
    default: ({ job, onJobUpdate }) => (
        <div data-testid="job-tile">
            <p>{job.shipName}</p>
            <button onClick={() => onJobUpdate({ ...job, updated: true })}>
                Edit
            </button>
        </div>
  ),
}));

describe('ViewBoard', () => {
    // create a list of mock jobs for testing
    const mockJobs = [
        { id: 1, shipName: 'test1', region: 'atlantic', hall: 't1', joinDate: '1111-01-22', open: true },
        { id: 2, shipName: 'test2', region: 'aacific', hall: 't2', joinDate: '1111-02-22', open: false },
    ];

    // ensure that fetchjob runs with mock instead of real data
    beforeEach(() => {
        fetchJobs.mockResolvedValue(mockJobs);
    });

    test('renders the header', async () => {
        render(
            <MemoryRouter>
                <ViewBoard />
            </MemoryRouter>
        );

    expect(await screen.findByText('Manage Jobs')).toBeInTheDocument();
    });

    test('renders the back button', async () => {
        render(
            <MemoryRouter>
                <ViewBoard />
            </MemoryRouter>
        );

        const backButton = await screen.findByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
    });

    test('renders job tiles', async () => {
        render(
            <MemoryRouter>
                <ViewBoard />
            </MemoryRouter>
        );

        // Wait for job tiles to appear
        const tiles = await screen.findAllByTestId('job-tile');
        expect(tiles).toHaveLength(2);
        expect(screen.getByText('test1')).toBeInTheDocument();
        expect(screen.getByText('test2')).toBeInTheDocument();
    });

    test('renders edit buttons', async () => {
        render(
            <MemoryRouter>
                <ViewBoard />
            </MemoryRouter>
        );

        await waitFor(() => {
        expect(screen.getAllByText('Edit')).toHaveLength(2);
        });
    });

    test('edit buttons are clickable', async () => {
        render(
            <MemoryRouter>
                <ViewBoard />
            </MemoryRouter>
        );

        const editButtons = await screen.findAllByText('Edit');
        expect(editButtons.length).toBeGreaterThan(0);

        // simulate clicking the edit button
        editButtons[0].click();
        expect(editButtons[0]).toBeEnabled();
    });
});