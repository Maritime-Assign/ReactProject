import {
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
        getJobsArray.mockResolvedValueOnce([
            { id: 1, open: true, FillDate: null },

            { id: 2, open: false, FillDate: '2025-02-10' },
        ])

        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )

        await waitForElementToBeRemoved(() =>
            screen.queryByText('Loading jobs...')
        )

        expect(screen.getAllByText('Open')).toHaveLength(1)

        expect(
            screen.getByText(
                (content) =>
                    content.includes('Filled') && content.includes('02/09/25')
            )
        ).toBeInTheDocument()
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
        getJobsArray.mockResolvedValueOnce([{ id: 1, open: true }])

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
        getJobsArray.mockResolvedValueOnce([
            { id: 1, open: true, notes: 'Example job notes for testing' },
        ])
        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )
        await waitForElementToBeRemoved(() =>
            screen.queryByText('Loading jobs...')
        )

        const expandButton = await screen.findByRole('button', {
            name: /expand notes/i,
        })

        const notesContent = screen.getByTestId('notesContent')
        expect(notesContent).toHaveClass('line-clamp-2')

        await userEvent.click(expandButton)
        expect(notesContent).not.toHaveClass('line-clamp-2')

        await userEvent.click(expandButton)
        expect(notesContent).toHaveClass('line-clamp-2')
    })
})
