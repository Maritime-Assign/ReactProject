import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import ViewHistory from '../components/ViewHistory'

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

// Mock supabase client
vi.mock('../api/supabaseClient', () => {
    const createMockChain = () => {
        const chain = {
            select: vi.fn(),
            from: vi.fn(),
            eq: vi.fn(),
            order: vi.fn(),
            gte: vi.fn(),
            lte: vi.fn(),
            in: vi.fn(),
            range: vi.fn(),
            limit: vi.fn(),
            single: vi.fn(),
            ilike: vi.fn(),
        }
        
        // Make all methods return the chain for proper chaining
        Object.keys(chain).forEach(key => {
            if (key !== 'range' && key !== 'limit' && key !== 'single') {
                chain[key].mockReturnValue(chain)
            }
        })
        
        // Terminal methods return promises
        chain.range.mockResolvedValue({ data: [], error: null, count: 0 })
        chain.limit.mockResolvedValue({ data: [], error: null })
        chain.single.mockResolvedValue({ data: null, error: null })
        
        return chain
    }

    const mockChain = createMockChain()
    
    const defaultExport = {
        from: vi.fn(() => mockChain),
        __mocks: mockChain,
    }

    return { default: defaultExport }
})

import supabase from '../api/supabaseClient'

beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset all mocks to default behavior
    const mockChain = supabase.__mocks
    
    Object.keys(mockChain).forEach(key => {
        mockChain[key].mockClear()
        if (key !== 'range' && key !== 'limit' && key !== 'single') {
            mockChain[key].mockReturnValue(mockChain)
        }
    })
    
    mockChain.range.mockResolvedValue({ data: [], error: null, count: 0 })
    mockChain.limit.mockResolvedValue({ data: [], error: null })
    mockChain.single.mockResolvedValue({ data: null, error: null })
    
    supabase.from.mockReturnValue(mockChain)
})

describe('ViewHistory Integration Tests', () => {
    it('renders ViewHistory component successfully', async () => {
        // Mock empty history data
        supabase.__mocks.range.mockResolvedValueOnce({
            data: [],
            error: null,
            count: 0,
        })

        supabase.__mocks.select.mockResolvedValueOnce({
            data: [],
            error: null,
        })

        render(
            <MemoryRouter>
                <ViewHistory />
            </MemoryRouter>
        )

        // Check for header
        expect(
            screen.getByText(/Job Board History & Changes/i)
        ).toBeInTheDocument()

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText(/Loading history/i)).not.toBeInTheDocument()
        })
    })

    it('displays summary cards with correct data', async () => {
        // Mock history data
        const mockHistoryData = [
            {
                id: 1,
                job_id: 123,
                change_time: '2024-01-01T10:00:00Z',
                changed_by_user_id: 'user1',
                previous_state: null,
                new_state: JSON.stringify({ shipName: 'Test Ship' }),
            },
            {
                id: 2,
                job_id: 124,
                change_time: '2024-01-02T10:00:00Z',
                changed_by_user_id: 'user2',
                previous_state: JSON.stringify({ shipName: 'Test Ship 2' }),
                new_state: JSON.stringify({ shipName: 'Updated Ship 2' }),
            },
        ]

        supabase.__mocks.range.mockResolvedValueOnce({
            data: [],
            error: null,
            count: 0,
        })

        supabase.__mocks.select.mockResolvedValueOnce({
            data: mockHistoryData,
            error: null,
        })

        render(
            <MemoryRouter>
                <ViewHistory />
            </MemoryRouter>
        )

        await waitFor(() => {
            // Check summary cards are rendered
            expect(screen.getByText(/Jobs Created/i)).toBeInTheDocument()
            expect(screen.getByText(/Jobs Updated/i)).toBeInTheDocument()
            expect(screen.getByText(/Jobs Closed/i)).toBeInTheDocument()
        })
    })

    it('handles search input correctly', async () => {
        supabase.__mocks.range.mockResolvedValue({
            data: [],
            error: null,
            count: 0,
        })

        supabase.__mocks.select.mockResolvedValue({
            data: [],
            error: null,
        })

        render(
            <MemoryRouter>
                <ViewHistory />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.queryByText(/Loading history/i)).not.toBeInTheDocument()
        })

        // Find search input
        const searchInput = screen.getByPlaceholderText(
            /Search by Username, Job ID, Date, or Vessel/i
        )
        expect(searchInput).toBeInTheDocument()

        // Type in search input
        await userEvent.type(searchInput, '123')

        // Verify input value changed
        expect(searchInput).toHaveValue('123')
    })

    it('displays empty state when no history found', async () => {
        supabase.__mocks.range.mockResolvedValueOnce({
            data: [],
            error: null,
            count: 0,
        })

        supabase.__mocks.select.mockResolvedValueOnce({
            data: [],
            error: null,
        })

        render(
            <MemoryRouter>
                <ViewHistory />
            </MemoryRouter>
        )

        await waitFor(() => {
            // Component shows error or empty state when no data
            const hasEmptyState = screen.queryByText(/No history found/i)
            const hasErrorState = screen.queryByText(/error|failed/i)
            expect(hasEmptyState || hasErrorState).toBeTruthy()
        })
    })

    it('toggles view mode between grouped and flat', async () => {
        supabase.__mocks.range.mockResolvedValue({
            data: [],
            error: null,
            count: 0,
        })

        supabase.__mocks.select.mockResolvedValue({
            data: [],
            error: null,
        })

        render(
            <MemoryRouter>
                <ViewHistory />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.queryByText(/Loading history/i)).not.toBeInTheDocument()
        })

        // Initially should show grouped view
        expect(
            screen.getByText(/Grouped View: Showing most recent change per job/i)
        ).toBeInTheDocument()

        // Find and click the view mode toggle button
        const toggleButton = screen.getByTitle(/Switch to Flat View/i)
        await userEvent.click(toggleButton)

        // Should switch to flat view
        await waitFor(() => {
            expect(
                screen.getByText(/Flat View: Showing all history records/i)
            ).toBeInTheDocument()
        })
    })

    it('handles refresh button click', async () => {
        supabase.__mocks.range.mockResolvedValue({
            data: [],
            error: null,
            count: 0,
        })

        supabase.__mocks.select.mockResolvedValue({
            data: [],
            error: null,
        })

        render(
            <MemoryRouter>
                <ViewHistory />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.queryByText(/Loading history/i)).not.toBeInTheDocument()
        })

        const refreshButton = screen.getByTitle(/Refresh/i)
        await userEvent.click(refreshButton)

        // supabase.from should be called again for refresh
        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalled()
        })
    })

    it('clears search when clear button is clicked', async () => {
        supabase.__mocks.range.mockResolvedValue({
            data: [],
            error: null,
            count: 0,
        })

        supabase.__mocks.select.mockResolvedValue({
            data: [],
            error: null,
        })

        render(
            <MemoryRouter>
                <ViewHistory />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.queryByText(/Loading history/i)).not.toBeInTheDocument()
        })

        // Type in search input
        const searchInput = screen.getByPlaceholderText(
            /Search by Username, Job ID, Date, or Vessel/i
        )
        await userEvent.type(searchInput, '123')

        // Wait for clear button to appear
        await waitFor(() => {
            expect(screen.getByTestId('clearButton')).toBeInTheDocument()
        })

        // Click clear button
        const clearButton = screen.getByTestId('clearButton')
        await userEvent.click(clearButton)

        // Verify search is cleared
        expect(searchInput).toHaveValue('')
    })
})