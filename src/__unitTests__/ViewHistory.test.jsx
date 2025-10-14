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
vi.mock('../api/supabaseClient', () => {
  const mockQuery = {
    select: vi.fn(function() { return this }),
    order: vi.fn(function() { return this }),
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
      ],
      count: 1,
      error: null
    })),
    gte: vi.fn(function() { return this }),
    lte: vi.fn(function() { return this }),
    eq: vi.fn(function() { return this }),
    limit: vi.fn(function() { return this }),
  }

  return {
    default: {
      from: vi.fn(() => mockQuery)
    }
  }
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