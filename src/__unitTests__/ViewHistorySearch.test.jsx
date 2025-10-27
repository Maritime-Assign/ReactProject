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

// Component for debounced input
const DebouncedInput = ({ onSearch }) => {
    // Store current input value
    const [value, setValue] = useState('')
    // State for debounced value - only updated after delay
    const [debouncedValue, setDebouncedValue] = useState(value)

    // Effect for debounce handling
    // Every change on value sets a timeout update to debouncedValue after 350ms
    // If value changes again before timeout, clear previous timeout
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), 350)
        return () => clearTimeout(handler)
    }, [value])

    // Effect to call onsearch callback when the debouncedValue changes
    useEffect(() => {
        if (debouncedValue) onSearch(debouncedValue)
    }, [debouncedValue, onSearch])

    // Render the input element
    return (
        <input
        placeholder="Search..."
        value={value}
        onChange={e => setValue(e.target.value)}
        />
    )
}

// Helper to mock the search bar placeholder text
const getSearchInput = () => {
  return screen.getByPlaceholderText(
    'Search (user:name, job:21, date:2025, date:2025-10-15)'
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

// Helper to flush React state and advance timer
const stateFlush_timerIncrement = (time) => {
    act(() => {
        vi.advanceTimersByTime(time)
    })
}



// Positive tests
describe("ViewHistory Search Bar: Positive Test", () => {
    // Test search input rendering
    test("Search bar placeholder text is rendered", () => {
        // Render the ViewHistory component inside Memory Router
        setRender()

        // Expect that the placeholder text is there
        expect (
            screen.getByPlaceholderText(
                'Search (user:name, job:21, date:2025, date:2025-10-15)'
            )
        ).toBeInTheDocument()
    })

    // Test debounce - callback fires only after user stops typing
    test('debounced input triggers api only after user stops typing for 350ms', () => {
        // Simulate search callback
        const onSearch = vi.fn()

        vi.useFakeTimers()

        // Render DebouncedInput component with mock onSearch function
        render(<DebouncedInput onSearch={onSearch} />)
        const input = screen.getByPlaceholderText('Search...')

        // Simulate typing
        fireEvent.change(input, { target: { value: 'job:39' } })
        fireEvent.change(input, { target: { value: 'job:39x' } })

        // User not done typing (timer not advanced) so callbacks should not have been fired
        expect(onSearch).not.toHaveBeenCalled()


        // act is used to flush the react state updates while advancing the timers
        stateFlush_timerIncrement(350)

        // Now that the delay has passed we should expect 1 callback for the final value
        expect(onSearch).toHaveBeenCalledTimes(1)
        expect(onSearch).toHaveBeenCalledWith('job:39x')

        vi.useRealTimers()
    })

    // Empty search should not call the api - Same conceptual workflow as positive test
    test("empty search input triggers backend call to fetch all data",  async () => {
        
        setRender()
        // Get search input
        const input = getSearchInput()
        expect(input).toBeInTheDocument()

        vi.useFakeTimers()
        // Simulate empty string inputted
        fireEvent.change(input, {target: {value: ''}})
        // Trigger debounce
        stateFlush_timerIncrement(350)

        
        const supabase = await import('../api/supabaseClient')
        // Expect back end call on an empty search - display everything
        expect(supabase.default.from).toHaveBeenCalled()
        // reset timer
        vi.useRealTimers()
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
        // Debounce not triggered, still typing - time has passed, but not 350ms
        stateFlush_timerIncrement(200)
        // User finally finished typing the new query - this should cancel the first pending callback
        fireEvent.change(input, { target: { value: 'job:12' } })

        // Trigger debounce
        stateFlush_timerIncrement(350)

        // Expect the callback fired once and only for the finish typed query
        expect(onSearch).toHaveBeenCalledTimes(1)
        expect(onSearch).toHaveBeenCalledWith('job:12')

        vi.useRealTimers()
    })

    // Test clearing the input resets the results to the unfiltered state and that the clear button functional does the same
    test('clearing the input resets results to unfiltered state', async () => {
        
        const supabase = await import('../api/supabaseClient')
        supabase.default.from.mockClear()

        vi.useFakeTimers()

        setRender()
        const input = getSearchInput()

        // Simulate a valid filtered search
        fireEvent.change(input, { target: { value: 'job:27' } })
        // Trigger debounce
        stateFlush_timerIncrement(350)

        // Input is cleared
        fireEvent.change(input, { target: { value: '' } })
        // Debounce triggered again
        stateFlush_timerIncrement(350)

        // Expect back end call to fetch all entries
        expect(supabase.default.from).toHaveBeenCalled()

        // Try the same for the clear button
        // Note: clear button only appears when there is text to clear

        // Add something into the searchQuery
        fireEvent.change(input, {target:{value: 'job:27'}})

        // Trigger debounce
        stateFlush_timerIncrement(350)

        // Target clear button and fire
        const clearButton = screen.getByTestId('clearButton')
        fireEvent.click(clearButton)
        // Trigger debounce
        stateFlush_timerIncrement(350)

        // Expect another call to back end, total 2
        expect(supabase.default.from).toHaveBeenCalled(2)
        
        
        vi.useRealTimers()
    })
})

// Negative tests
describe("ViewHistory Search bar: Negative tests", () => {

    // Test invalid input - incorrect filter does not make back end calls and renders empty state
    test("invalid input does not trigger back end calls", async () => {

        setRender()

        const supabase = await import('../api/supabaseClient')
        // Clear any calls
        supabase.default.from.mockClear()

        const input = getSearchInput()
        expect(input).toBeInTheDocument()

        vi.useFakeTimers()
        fireEvent.change(input, { target: { value: 'invalid:|||'}})
        stateFlush_timerIncrement(350)

        // Expect no back end calls
        expect(supabase.default.from).not.toHaveBeenCalled()
        vi.useRealTimers()

    })
})