// Set up basic imports
import { describe, expect, vi } from 'vitest'
import React, { useState, useEffect } from 'react'
// https://testing-library.com/docs/react-testing-library/example-intro/
// Import needed react testing methods
import { render, screen, fireEvent, act } from '@testing-library/react'
// render() -> mounts component into virtual DOM for testing
// screen -> used for querying dom
// fireEvent -> simulates interactions
import ViewHistory from '../components/ViewHistory'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { debounce } from '@mui/material'

// Note:
// Use real timers when testing UI interactions with debounced events 
// where actual time passage matters. Use fake timers for long or complex timer logic 
// where speed and determinism are needed, and you can manually advance the clock.


// Mock AuthContext
vi.mock('../auth/AuthContext', () => ({
  UserAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    role: 'admin'
  })
}))



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
    'Search by Username, Job ID, Date, or Vessel'
  )
}

// Helper to establish render()
const setRender = () => {
    render(
        <MemoryRouter>
            <ViewHistory />
        </MemoryRouter>
    )
}

const advanceTime = (time) => act(() => vi.advanceTimersByTime(time))

// Debounce input for testing
const DebouncedInput = ({onSearch}) => {
    const[value, setValue] = useState('')
    const[debounced, setDebounced] = useState(value)

    useEffect(() => { 
        // Set debounce value
        const timeout = setTimeout(() => setDebounced(value), 1000)
        return () => clearTimeout(timeout)
    }, [value])

    useEffect(() => {
        if(debounced) {
            onSearch(debounced)
        }
    }, [debounced, onSearch])

    return <input placeholder="Search..." value={value} onChange={e => setValue(e.target.value)} />
}


// Positive tests
describe("ViewHistory Search Bar: Positive Tests", () => {
    // Test search input rendering
    test("search bar placeholder text is rendered", () => {
        // Render the ViewHistory component inside Memory Router
        setRender()

        expect(getSearchInput()).toBeInTheDocument()
    })

    // Test debounce - callback fires only after user stops typing
    test('debounced input triggers api only after user stops typing for 1000ms', () => {
        // Simulate search callback
        const onSearch = vi.fn()

        vi.useFakeTimers()

        render(<DebouncedInput onSearch={onSearch} />)
        const input = screen.getByPlaceholderText('Search...')
        fireEvent.change(input, {target: {value: 'test'}})
        fireEvent.change(input, {target: {value: 'testing'}})

        // Debounce time has not elapsed - no call back should have been made
        expect(onSearch).not.toHaveBeenCalled()

        // Advance timer
        advanceTime(1000)
        // Debounce has occured - call back should have been made

        expect(onSearch).toHaveBeenCalled(1)
        expect(onSearch).toHaveBeenCalledWith('testing')
        vi.useRealTimers()
    })

    // API should be called for typed queries and also fetch all data when input is cleared
    test("clearing the search input triggers backend call to fetch all data",  async () => {
        
        setRender()
        // Get search input
        const input = getSearchInput()
        const supabase = await import('../api/supabaseClient')
        supabase.default.from.mockClear()

        vi.useRealTimers()

        // Simulate text
        fireEvent.change(input, {target: {value: 'VesselA'}})
        // Wait for debounce to finish
        await new Promise(r => setTimeout(r, 1100))
        
        // Clear the input
        fireEvent.change(input, {target: {value: ''}})
        await new Promise(r => setTimeout(r, 1100))

        // Simulate text
        fireEvent.change(input, {target: {value: 'VesselB'}})
        // Wait for debounce to finish
        await new Promise(r => setTimeout(r, 1100))

        // Button is clickable now
        const clearButton = await screen.findByTestId('clearButton')
        fireEvent.click(clearButton)
        await new Promise(r => setTimeout(r, 1100))

        // Expect 4 total api fetches
        expect(supabase.default.from).toHaveBeenCalledTimes(4)

    })

    // Test older api calls are canceled or ignored if user types again before debounce is triggered
    test('cancels previous api calls if a new query is entered before debounce', () => {

        // Mock onSearch callback to track calls and arguments
        const onSearch = vi.fn()

        vi.useFakeTimers()

        // Render debounced component 
        render(<DebouncedInput onSearch={onSearch} />)
        const input = screen.getByPlaceholderText('Search...')

        // Users start typing the first query
        fireEvent.change(input, { target: { value: 'job:1' } })
        // Debounce not triggered, still typing - time has passed, but not 1000ms
        advanceTime(500)
        // User finally finished typing the new query - this should cancel the first pending callback
        fireEvent.change(input, { target: { value: 'job:12' } })

        // Trigger debounce
        advanceTime(1000)

        // Expect the callback fired once and only for the finish typed query
        expect(onSearch).toHaveBeenCalledTimes(1)
        expect(onSearch).toHaveBeenCalledWith('job:12')

        vi.useRealTimers()
    })

    // Test clearing the input resets the results to the unfiltered state and that the clear button functional does the same
    test('clearing the input or pressing the clear button resets results to unfiltered state', async () => {
        
        const supabase = await import('../api/supabaseClient')
        supabase.default.from.mockClear()

        vi.useRealTimers()

        setRender()
        const input = getSearchInput()

        // Note: clear button only appears when there is text to clear
        // Add something into the searchQuery
        fireEvent.change(input, {target:{value: '27'}})
        await new Promise(r => setTimeout(r, 1200))

        // Target clear button and fire
        const clearButton = await screen.findByTestId('clearButton')
        fireEvent.click(clearButton)
        // Trigger debounce
        await new Promise(r => setTimeout(r, 1200))

        // Expect call for unfiltered results
        expect(supabase.default.from).toHaveBeenCalled(1)
        
    })
})

// Negative tests
describe("ViewHistory Search bar: Negative Tests", () => {

    // Test invalid input - incorrect filter does not make back end calls and renders empty state
    test("invalid input does not trigger back end calls", async () => {

        setRender()

        const supabase = await import('../api/supabaseClient')
        // Clear any calls
        supabase.default.from.mockClear()

        const input = getSearchInput()
        expect(input).toBeInTheDocument()

        vi.useFakeTimers()
        fireEvent.change(input, { target: { value: '|||||'}})
        advanceTime(1000)

        // Expect no back end calls
        expect(supabase.default.from).toHaveBeenCalled(0)
        vi.useRealTimers()

    })
})