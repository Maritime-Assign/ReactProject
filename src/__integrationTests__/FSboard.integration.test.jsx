import { render, screen, waitFor } from '@testing-library/react'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// Import mock data using MSW handlers
import { mockJobs } from '../mocks/handlers'

// Mock the components to isolate FSboard logic
vi.mock('../components/FSBheader', () => ({
    default: () => <div>FSB Header Mock</div>,
}))

vi.mock('../components/JobListing', () => ({
    default: (props) => (
        <div data-testid='job-listing'>
            <p>Job: {props.billet}</p>
            <p>Ship: {props.shipName}</p>
            <p>Loc: {props.location}</p>
            <p>Days: {props.days}</p>
        </div>
    ),
}))

// --- GLOBAL MOCK SETUP FOR jobDataAPI ---
const mockGetJobsArraySpy = vi.fn()

vi.mock('../components/jobDataAPI', async (importOriginal) => {
    const actual = await importOriginal()

    // Set the initial default behavior of the spy: call the original function, which hits MSW
    mockGetJobsArraySpy.mockImplementation(() => actual.default())

    return {
        ...actual,
        default: mockGetJobsArraySpy, // Inject the spy as the default export
    }
})

describe('FSboard Integration Test: Data Fetching', () => {
    beforeEach(() => {
        // Reset the implementation to its default (call the original/MSW) before each test
        // Use a function that imports the actual module to ensure freshness if needed
        mockGetJobsArraySpy.mockImplementation(() => {
            const actual = vi.importActual('../components/jobDataAPI')
            return actual.default()
        })
        mockGetJobsArraySpy.mockClear()
    })

    it('should display the loading message, then display all fetched jobs on success', async () => {
        const { default: FSboard } = await import('../pages/FSboard')

        render(<FSboard />)

        // 1. ASSERT initial loading state
        expect(screen.getByText(/Loading jobs.../i)).toBeInTheDocument()

        // 2. WAIT for data fetching and rendering
        await waitFor(
            () => {
                const jobListings = screen.getAllByTestId('job-listing')
                expect(jobListings).toHaveLength(mockJobs.length)

                // Assert specific mock data is displayed
                expect(
                    screen.getByText(/Able Seaman \(AB\)/i)
                ).toBeInTheDocument()
                expect(screen.getByText(/Ship: USNS Yuma/i)).toBeInTheDocument()
            },
            { timeout: 3000 }
        )

        // 3. ASSERT loading message is gone
        expect(screen.queryByText(/Loading jobs.../i)).not.toBeInTheDocument()
    })

    it('should display an error message when the job API call fails', async () => {
        const jobDataAPI = await import('../components/jobDataAPI')
        const { default: FSboard } = await import('../pages/FSboard')

        const FULL_SUPABASE_URL =
            'https://niwgwqnkqpfjhxvcwjdt.supabase.co/rest/v1/Jobs'
        server.use(
            http.get(FULL_SUPABASE_URL, () => {
                return HttpResponse.json({}, { status: 500 })
            })
        )

        jobDataAPI.default.mockImplementationOnce(() =>
            Promise.reject(new Error('Failed to load jobs'))
        )

        render(<FSboard />)

        // wait for the error state to render
        await waitFor(
            () => {
                // This assertion now matches the exact message thrown by mockImplementationOnce
                expect(
                    screen.getByText(/Error: Failed to load jobs/i)
                ).toBeInTheDocument()
            },
            { timeout: 3000 }
        )

        // 4. no jobs or loading message are present
        expect(screen.queryByText(/Loading jobs.../i)).not.toBeInTheDocument()
        expect(screen.queryByTestId('job-listing')).not.toBeInTheDocument()
    })
})
