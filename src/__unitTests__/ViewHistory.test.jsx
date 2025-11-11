/*
Unit tests for the View Changes (History) page

To run:
  -- npm test
*/

import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ViewHistory from '../components/ViewHistory'

// Mock AuthContext
vi.mock('../auth/AuthContext', () => ({
  UserAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    role: 'admin'
  })
}))

// spies we'll assert against
let updateSpy = vi.fn()
let eqSpy = vi.fn()

// Minimal, table-aware supabase mock that returns appropriate results for the component's queries
vi.mock('../api/supabaseClient', () => {
  // Mock data
  const historyRows = [
    {
      id: 100,
      job_id: '1',
      changed_by_user_id: 'user1',
      change_time: '2024-01-01T12:00:00',
      previous_state: null,
      new_state: '{"position":"Engineer","location":"Oakland"}',
      Users: {
        username: 'user1',
        first_name: 'User'
      }
    }
  ]

  const jobsClosedRows = [
    {
      id: 1,
      FillDate: '2024-01-01T00:00:00Z',
      shipName: 'Aurora',
      type: 'Cargo',
      crewRelieved: 3
    }
  ]

  // Factory to produce a chainable query object that is thenable (so `await query` works)
  function makeChain(tableName) {
    const chain = {
      _table: tableName,
      _selectArg: undefined,
      _filters: {},
      select(arg) {
        this._selectArg = arg
        return this
      },
      order() { return this },
      range() { return this },
      gte(_, v) { this._filters.gte = v; return this },
      lte(_, v) { this._filters.lte = v; return this },
      in(field, vals) { this._filters.in = { field, vals }; return this },
      eq(field, val) {
        if (!this._filters.eq) this._filters.eq = []
        this._filters.eq.push([field, val])
        return this
      },
      then(resolve) {
        // compute result based on table and filters
        let result = { data: [], error: null, count: 0 }

        if (this._table === 'JobsHistory') {
          if (this._selectArg && String(this._selectArg).includes('job_id')) {
            result = { data: historyRows.map(r => ({ job_id: r.job_id })), error: null }
          } else {
            result = { data: historyRows, error: null, count: historyRows.length }
          }

          if (this._filters.eq) {
            const eqs = Object.fromEntries(this._filters.eq.map(([k, v]) => [k, v]))
            if (eqs.job_id) {
              const rows = historyRows.filter(r => String(r.job_id) === String(eqs.job_id))
              result = { data: rows, error: null }
            }
          }
        } else if (this._table === 'Jobs') {
          result = { data: [], error: null }
          const inFilter = this._filters.in
          const eqs = (this._filters.eq || []).reduce((acc, [k, v]) => { acc[k] = v; return acc }, {})
          if (inFilter && inFilter.vals && inFilter.vals.includes('1')) {
            // Respond as closed jobs when open === false filter present
            if (eqs.open === false || String(eqs.open) === 'false') {
              result = { data: jobsClosedRows, error: null }
            } else {
              result = { data: jobsClosedRows, error: null }
            }
          }
        }

        return Promise.resolve(result).then(resolve)
      }
    }
    return chain
  }

  // Provide a real jobs chain but attach update spy handling
  const supabaseMock = {
    from: vi.fn((table) => {
      const chain = makeChain(table)
      if (table === 'Jobs') {
        // attach update which records the payload and returns an object with eq that records the id
        chain.update = vi.fn((payload) => {
          updateSpy(payload)
          return {
            eq: (field, value) => {
              eqSpy(field, value)
              // emulate supabase success response
              return Promise.resolve({ data: [{ id: value, ...payload }], error: null })
            }
          }
        })
      }
      return chain
    })
  }

  return { default: supabaseMock }
})

beforeEach(() => {
  // reset spies before each test
  updateSpy = vi.fn()
  eqSpy = vi.fn()
  vi.clearAllMocks()
})

describe('View Changes Page Tests', () => {
  test('renders the history page without errors', () => {
    render(
      <MemoryRouter>
        <ViewHistory />
      </MemoryRouter>
    )

    // Check that the main header is present
    expect(screen.getByText(/Job Board History & Changes/i)).toBeInTheDocument()
  })

  test('displays summary cards', () => {
    render(
      <MemoryRouter>
        <ViewHistory />
      </MemoryRouter>
    )

    // Check for summary card labels
    expect(screen.getByText(/Jobs Created/i)).toBeInTheDocument()
    expect(screen.getByText(/Jobs Updated/i)).toBeInTheDocument()
  })

  test('shows view mode indicator', () => {
    render(
      <MemoryRouter>
        <ViewHistory />
      </MemoryRouter>
    )

    // Check that grouped view indicator is present
    expect(screen.getByText(/Grouped View/i)).toBeInTheDocument()
  })

  // --- New tests: Closed Jobs button + modal display ---

  test('renders the Closed Jobs button (summary card) with a count', async () => {
    render(
      <MemoryRouter>
        <ViewHistory />
      </MemoryRouter>
    )

    // Find the Jobs Closed summary button (it is a button with aria-label "Jobs Closed")
    const closedButton = await screen.findByRole('button', { name: /Jobs Closed/i })
    expect(closedButton).toBeInTheDocument()

    // The summary button displays the label "Jobs Closed" and a numeric count (mock returns one closed job)
    expect(within(closedButton).getByText(/Jobs Closed/i)).toBeInTheDocument()
    // look for the number 1 inside the button
    expect(within(closedButton).getByText('1')).toBeInTheDocument()
  })

  test('clicking Closed Jobs opens modal and displays closed job info', async () => {
    render(
      <MemoryRouter>
        <ViewHistory />
      </MemoryRouter>
    )

    const user = userEvent.setup()

    // Open the modal via the Jobs Closed button
    const closedButton = await screen.findByRole('button', { name: /Jobs Closed/i })
    await user.click(closedButton)

    // Modal title should appear
    expect(await screen.findByText(/Closed Jobs/i)).toBeInTheDocument()

    // The closed job item (id 1) should be listed as "Job #1"
    expect(await screen.findByText(/Job #1/)).toBeInTheDocument()

    // Check for details from our mock: shipName 'Aurora' and Type 'Cargo' and crew relieved number
    expect(screen.getByText(/Aurora/)).toBeInTheDocument()
    expect(screen.getByText(/Type: Cargo/)).toBeInTheDocument()
    expect(screen.getByText(/Crew Relieved: 3/)).toBeInTheDocument()

    // Expand the closed job to show its history (button within job's block)
    const jobToggleButton = screen.getByRole('button', { name: /Job #1/i })
    await user.click(jobToggleButton)

    // The history entry username from our mocked historyRows should appear
    // Note: Username now comes from separate Users query, not direct field
    expect(await screen.findByText(/Unknown User|john_doe/)).toBeInTheDocument()
  })

  // --- Final test: ensure clicking Open? then Confirm triggers supabase update ---
  test('clicking Open? then Confirm reopens job (calls supabase.update with open: true)', async () => {
    render(
      <MemoryRouter>
        <ViewHistory />
      </MemoryRouter>
    )

    const user = userEvent.setup()

    // Open the Closed Jobs modal
    const closedButton = await screen.findByRole('button', { name: /Jobs Closed/i })
    await user.click(closedButton)

    // Find the Open button for job id 1
    const openBtn = await screen.findByRole('button', { name: /Open job 1/i })
    // First click -> should show Confirm?
    await user.click(openBtn)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Open job 1/i })).toHaveTextContent(/Confirm\?/i)
    })

    // Second click -> triggers update
    await user.click(screen.getByRole('button', { name: /Open job 1/i }))

    // Wait and assert our spies were called with expected values
    await waitFor(() => {
      // update should have been called with { open: true }
      expect(updateSpy).toHaveBeenCalled()
      const calledWithOpenTrue = updateSpy.mock.calls.some(call => call[0] && call[0].open === true)
      expect(calledWithOpenTrue).toBeTruthy()

      // eq should be called with ('id', 1)
      expect(eqSpy).toHaveBeenCalled()
      const eqCalledWithId1 = eqSpy.mock.calls.some(call => call[0] === 'id' && (call[1] === 1 || call[1] === '1'))
      expect(eqCalledWithId1).toBeTruthy()
    })
  })

  // Feature replaced with search bar - Target test is commented out below
  // Replacement test for search bar will be in its own test file 
  //
  //test('renders filter button', () => {
  //  render(
  //    <MemoryRouter>
  //      <ViewHistory />
  //    </MemoryRouter>
  //  )
  //  const filterButtons = screen.getAllByTitle(/Toggle Filters/i)
  //  expect(filterButtons.length).toBeGreaterThan(0)
  //})
})
