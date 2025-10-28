import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, beforeEach } from 'vitest'

// Mock supabase
vi.mock('../api/supabaseClient', () => {
    // Create a mock closed job to test
    let rows = [
        {
        id: 1,
        job_id: '123',
        changed_by_user_id: 'user1',
        change_time: '2024-01-01T12:00:00',
        previous_state: null,
        new_state: JSON.stringify({ position: 'Engineer', location: 'Oakland', open: false }),
        },
    ]

    const calls = { updates: [] }

    // Builder used for JobsHistory reads (flat mode uses .range())
    const jobsHistoryQuery = {
        select: vi.fn(function () { return this }),
        order:  vi.fn(function () { return this }),
        gte:    vi.fn(function () { return this }),
        lte:    vi.fn(function () { return this }),
        in:     vi.fn(function () { return this }),
        eq:     vi.fn(function () { return this }),
        limit:  vi.fn(function () { return this }),
        range:  vi.fn(async function () {
        return { data: rows, count: rows.length, error: null }
        }),
    }

    // Builder used for Jobs update
    const jobsUpdateQuery = {
        update: vi.fn(function () { return this }),
        eq: vi.fn(async function (_col, jobId) {
        calls.updates.push({ jobId: String(jobId) })
        // emulate a success update in the DB
        rows = rows.map(r =>
            r.job_id === String(jobId)
            ? { ...r, new_state: JSON.stringify({ ...JSON.parse(r.new_state), open: true }) }
            : r
        )
        return { data: [{ id: jobId }], error: null }
        }),
    }

    const from = vi.fn((table) => {
        if (table === 'JobsHistory') return { ...jobsHistoryQuery }
        if (table === 'Jobs')        return { ...jobsUpdateQuery }
        return { ...jobsHistoryQuery }
    })

    // Helper to reset mock data before each tests
    const resetMock = () => {
        rows = [
        {
            id: 1,
            job_id: '123',
            changed_by_user_id: 'user1',
            change_time: '2024-01-01T12:00:00',
            previous_state: null,
            new_state: JSON.stringify({ position: 'Engineer', location: 'Oakland', open: false }),
        },
        ]
        calls.updates.length = 0
    }

    // default export for app code
    return { default: { from }, calls, resetMock }
})

// Import after the mock so the component uses it
import ViewHistory from '../components/ViewHistory'
import { calls, resetMock } from '../api/supabaseClient'

// Helper to render and switch to Flat view
const renderInFlatView = async () => {
    render(
        <MemoryRouter>
        <ViewHistory />
        </MemoryRouter>
    )
    const toggle = await screen.findByTitle('Switch to Flat View')
    fireEvent.click(toggle)
}

// Reset mock before each test to ensure independence
beforeEach(() => {
    resetMock()
})

describe('Reopen Job buttons', () => {
    // Test check if there is a button titled Reopen job for the mock data, which is closed
    test('Closed job rows show a "Reopen job" button', async () => {
        await renderInFlatView()
        const btn = await screen.findByTitle('Reopen job')
        expect(btn).toBeInTheDocument()
    })

    // Test ensures that clicking on the Reopen job button calls an update to job with matching ID
    test('Clicking "Reopen job" triggers update with the correct jobId', async () => {
        await renderInFlatView()
        const btn = await screen.findByTitle('Reopen job')
        fireEvent.click(btn)

        await waitFor(() => {
        expect(calls.updates.length).toBeGreaterThan(0)
        expect(calls.updates[0].jobId).toBe('123')
        })
    })

    // Test check to make sure that the button exist before the click and disappear after the click
    test('After successful update, the UI reflects reopened status (button disappears)', async () => {
        await renderInFlatView()

        const btn = await screen.findByTitle('Reopen job')
        expect(btn).toBeInTheDocument()

        fireEvent.click(btn)

        await waitFor(() => {
        expect(screen.queryByTitle('Reopen job')).not.toBeInTheDocument()
        })
    })
})