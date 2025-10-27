// Set up basic imports
import { vi } from 'vitest'
// https://testing-library.com/docs/react-testing-library/example-intro/
// Import needed react testing methods
import { render, screen, fireEvent } from '@testing-library/react'
// render() -> mounts component into virtual DOM for testing
// screen -> used for querying dom
// fireEvent -> simulates interactions
import ViewHistory from '../components/ViewHistory'
import { MemoryRouter, useNavigate } from 'react-router-dom'



// Mock the back end
vi.mock('../api/supabaseClient', () => {
  return {
    default: {
    // from() is generally the first backend call executed so replace it with mock function
    // Example query chain:
        // ...
        // .from('jobs')
        // .select('*')
        //.eq('id', 27)
        //.order('created_at', { ascending: false })
    // When any of these mock functions is called
    // it returns the same mock query object so that chained calls do not break

      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      }))
    }
  }
})

// Mock the router so navigation and location access do not depend on actual running browser
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        // Return empty so no navigation errors occur
        useNavigate: () => vi.fn(),
        // fake empty url query
        useLocation: () => ({search: ''})
    }
})

// Helper to mock the search bar placeholder text
const getSearchInput = () => {
  return screen.getByPlaceholderText(
    'Search (user:name, job:21, date:2025, date:2025-10-15)'
  )
}


// Positive tests
describe("ViewHistory Search Bar: Positive Test", () => {
    // Test search input rendering
    test("search input is rendered", () => {
        // Render the ViewHistory component inside Memory Router
        render(
            <MemoryRouter>
                <ViewHistory />
            </MemoryRouter>
        )

        // Expect that the placeholder text is there
        expect (
            screen.getByPlaceholderText(
                'Search (user:name, job:21, date:2025, date:2025-10-15)'
            )
        ).toBeInTheDocument()
    })

    // Test debounce
    test("typing called debounced search after 350ms", async () => {
        render(
            <MemoryRouter>
                <ViewHistory /> 
            </MemoryRouter>
        )
        // Use helper to get search input
        const input = getSearchInput()
        expect(input).toBeInTheDocument()

        // Without this, we would have to wait for a debounce for the test to finish
        vi.useFakeTimers()


        // Fire a search for job:27 which exists in the database
        fireEvent.change(input, {target: {value: 'job:27' } })
        // Followed by what your expecting
        expect(input.value).toBe('job:27')

        // Trigger debounce with advance timers - 350ms
        vi.advanceTimersByTime(350)

        // After debounce, check if target component tried to fetch data
        const supabase = await import('../api/supabaseClient')
        expect(supabase.default.from).toHaveBeenCalled()

        // Reset timers
        vi.useRealTimers()
    })
})