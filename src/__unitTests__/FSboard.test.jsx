import {
    within,
    waitFor,
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import FSBoard from '../pages/FSboard'
import getJobsArray from '../components/jobDataAPI'
import { mockJobs } from '../mocks/handlers'

beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        get() {
            return 200
        },
    })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get() {
            return 100
        },
    })

    vi.setSystemTime(new Date('2025-01-01'))

    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    window.__vitest_environment__ = true
})

afterAll(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
})

vi.mock('../auth/AuthContext', () => ({
    UserAuth: () => ({
        user: { id: '1', email: 'test@example.com' },
        role: 'admin', // move outside user
    }),
}))

vi.mock('../components/jobDataAPI', () => ({
    default: vi.fn(),
}))

describe('FSBoard components', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders loading message before fetching data', () => {
        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )
        expect(screen.getByText('Loading jobs...')).toBeInTheDocument()
    })

    test('renders table headers after loading', async () => {
        getJobsArray.mockResolvedValueOnce([{ id: 1 }])
        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )

        await waitForElementToBeRemoved(() =>
            screen.queryByText('Loading jobs...')
        )

        const headers = [
            'Status',
            'Hall',
            'Date Called',
            'Vessel',
            'Join Date',
            'Billet',
            'Type',
            'Days',
            'Location',
            'Company',
            'Crew Relieved',
            'Notes',
        ]
        headers.forEach((header) => {
            expect(screen.getByText(header)).toBeInTheDocument()
        })
    })

    test('renders all possible job claim states', async () => {
        getJobsArray.mockResolvedValueOnce(mockJobs)

        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )

        await waitForElementToBeRemoved(() =>
            screen.queryByText('Loading jobs...')
        )

        // Custom matcher for the 'Filled' status (Job 3).
        // It matches content that starts with 'Filled' but does NOT contain 'by CO'.
        const filledStatusMatcher = (content, element) => {
            const normalizedContent = content.trim()
            return (
                normalizedContent.startsWith('Filled') &&
                !normalizedContent.includes('by CO')
            )
        }

        await waitFor(
            () => {
                // ASSERTION 2: Check for 'Filled by Company' job (Job 2 status text)
                // Using regex /Filled by CO/ to handle text split by <br/>
                expect(screen.getByText(/Filled by CO/)).toBeInTheDocument()

                // ASSERTION 3: Check for 'Filled' job (Job 3 status text)
                // Using the precise function matcher to exclude 'Filled by CO'
                expect(
                    screen.getByText(filledStatusMatcher)
                ).toBeInTheDocument()
            },
            { timeout: 1000 }
        )

        // ASSERTION 1: Only 1 Open Job (Job 1) should show the claim button
        const openButtons = screen.getAllByTestId('claim-button')
        expect(openButtons).toHaveLength(1)

        // Ensure the specific FillDates are rendered (10/20/25 and 11/05/25)
        // FIX: Using regex matchers for MM/DD/YY format
        expect(screen.getByText(/10\/20\/25/)).toBeInTheDocument()
        expect(screen.getByText(/12\/25\/25/)).toBeInTheDocument()

        // Extra check for Join Dates to ensure all 3 rows are present
        expect(screen.getByText('12/15/2025')).toBeInTheDocument() // Job 1 Join Date
        expect(screen.getByText('10/22/2025')).toBeInTheDocument() // Job 2 Join Date
    })

    test('shows error message when data fetch fails', async () => {
        getJobsArray.mockRejectedValueOnce(new Error('Fetch failed'))

        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )

        await waitForElementToBeRemoved(() =>
            screen.queryByText('Loading jobs...')
        )
        expect(screen.getByText(/error/i)).toBeInTheDocument()
    })

    test('shows fallback UI when no jobs are returned', async () => {
        getJobsArray.mockResolvedValueOnce([])

        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )

        await waitForElementToBeRemoved(() =>
            screen.queryByText('Loading jobs...')
        )
        expect(screen.getByText(/no jobs/i)).toBeInTheDocument()
    })

    test('removes loading message after successful load', async () => {
        getJobsArray.mockResolvedValueOnce([{ id: 1, open: 'Open' }])

        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )

        await waitForElementToBeRemoved(() =>
            screen.queryByText('Loading jobs...')
        )
        expect(screen.queryByText('Loading jobs...')).not.toBeInTheDocument()
    })

    test('expands and collapses the Notes section when button is clicked', async () => {
        getJobsArray.mockResolvedValueOnce(mockJobs)
        const user = userEvent.setup()

        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )
        await waitForElementToBeRemoved(() =>
            screen.queryByText('Loading jobs...')
        )

        // 1. Identify the unique element for the job row with long notes (Job 3: QMED (Electrician))
        const uniqueElementInRow = screen.getByText('QMED (Electrician)')

        // 2. Find the row container by traversing up.
        // The cell div is the first parentElement. The row div (grid) is the second parentElement.
        const jobRowContainer = uniqueElementInRow.parentElement.parentElement

        // Use findByRole (waits for element) and getByTestId (sync) scoped to the specific job row container.
        const expandButton = await within(jobRowContainer).findByRole(
            'button',
            {
                name: /expand notes/i,
            }
        )

        // Find the notes content scoped to this row
        const notesContent = within(jobRowContainer).getByTestId('notesContent')

        // Initial state
        expect(notesContent).toHaveClass('line-clamp-2')

        // Click 1: Expand
        await user.click(expandButton)
        expect(notesContent).not.toHaveClass('line-clamp-2')

        // Click 2: Collapse
        await user.click(expandButton)
        expect(notesContent).toHaveClass('line-clamp-2')
    })
})
