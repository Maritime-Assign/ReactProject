/*
Unit tests for the View Changes (History) page

To run:
  -- npm test
*/

import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import ViewHistory from '../components/ViewHistory'

// Mock supabase
vi.mock('../api/supabaseClient', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => Promise.resolve({
            data: [
              {
                id: 1,
                job_id: '123',
                changed_by_user_id: 'user1',
                change_time: '2024-01-01T12:00:00',
                previous_state: null,
                new_state: '{"position":"Engineer","location":"Oakland"}',
              },
              {
                id: 2,
                job_id: '124',
                changed_by_user_id: 'user2',
                change_time: '2024-01-02T12:00:00',
                previous_state: '{"position":"Engineer","location":"SF"}',
                new_state: '{"position":"Engineer","location":"Oakland"}',
              },
            ],
            count: 2,
            error: null
          }))
        })),
        gte: vi.fn(function() { return this }),
        lte: vi.fn(function() { return this }),
        eq: vi.fn(function() { return this })
      }))
    }))
  }
}))

describe('View Changes Page Tests', () => {
  test('renders the history page without errors', async () => {
    render(
      <MemoryRouter>
        <ViewHistory />
      </MemoryRouter>
    )

    // Check that the main header is present
    expect(screen.getByText(/Job Board History & Changes/i)).toBeInTheDocument()
  })

  test('displays summary cards', async () => {
    render(
      <MemoryRouter>
        <ViewHistory />
      </MemoryRouter>
    )

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Total History Records/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Jobs Created/i)).toBeInTheDocument()
    expect(screen.getByText(/Jobs Updated/i)).toBeInTheDocument()
  })

  test('shows the history table headers', async () => {
    render(
      <MemoryRouter>
        <ViewHistory />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Date & Time/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Job ID/i)).toBeInTheDocument()
    expect(screen.getByText(/Action/i)).toBeInTheDocument()
    expect(screen.getByText(/Changes Summary/i)).toBeInTheDocument()
  })

  test('renders filter button', () => {
    render(
      <MemoryRouter>
        <ViewHistory />
      </MemoryRouter>
    )

    // Filter button should be present
    const filterButtons = screen.getAllByTitle(/Toggle Filters/i)
    expect(filterButtons.length).toBeGreaterThan(0)
  })
})