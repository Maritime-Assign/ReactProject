import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import ViewBoard from '../pages/ViewBoard'

const mockGetJobsArray = vi.hoisted(() => vi.fn())

vi.mock('../components/jobDataAPI', () => ({
  __esModule: true,
  default: mockGetJobsArray,
}))

vi.mock('../components/Tile', () => ({
  __esModule: true,
  default: ({ job }) => <div data-testid="job-tile">{job.shipName}</div>,
}))

vi.mock('../components/Filter', () => ({
  __esModule: true,
  default: ({ setView, setFilterOpen }) => (
    <div>
      <button onClick={() => setView('list')}>Switch to list</button>
      <button onClick={() => setFilterOpen(true)}>Show Open Only</button>
    </div>
  ),
}))

describe('ViewBoard integration', () => {
  const jobs = [
    {
      id: '1',
      shipName: 'Voyager',
      region: 'Pacific',
      hall: 'A',
      joinDate: '2024-09-01',
      passThru: false,
      nightCardEarlyReturn: false,
      msc: false,
      open: true,
    },
    {
      id: '2',
      shipName: 'Endeavor',
      region: 'Atlantic',
      hall: 'B',
      joinDate: '2024-10-15',
      passThru: true,
      nightCardEarlyReturn: true,
      msc: true,
      open: false,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetJobsArray.mockResolvedValue(jobs)
  })

  const renderViewBoard = () =>
    render(
      <MemoryRouter>
        <ViewBoard />
      </MemoryRouter>
    )

  it('renders jobs fetched from API', async () => {
    renderViewBoard()
    await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
    expect(await screen.findByText('Voyager')).toBeInTheDocument()
    expect(screen.getByText('Endeavor')).toBeInTheDocument()
  })

  it('filters jobs by search input', async () => {
    renderViewBoard()
    expect(await screen.findByText('Voyager')).toBeInTheDocument()
    const searchBox = screen.getByPlaceholderText('Search vessel, region, hall, or join date…')
    fireEvent.change(searchBox, { target: { value: 'ende' } })
    await waitFor(() => expect(screen.queryByText('Voyager')).not.toBeInTheDocument())
    expect(screen.getByText('Endeavor')).toBeInTheDocument()
  })

  it('shows only open jobs when filter is activated', async () => {
    renderViewBoard()
    expect(await screen.findByText('Voyager')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Show Open Only'))
    await waitFor(() => expect(screen.queryByText('Endeavor')).not.toBeInTheDocument())
    expect(screen.getByText('Voyager')).toBeInTheDocument()
  })

  it('switches layout when view changes', async () => {
    const { container } = renderViewBoard()
    expect(await screen.findByText('Voyager')).toBeInTheDocument()
    expect(container.querySelector('.space-y-4')).toBeNull()
    fireEvent.click(screen.getByText('Switch to list'))
    await waitFor(() => expect(container.querySelector('.space-y-4')).not.toBeNull())
  })
})