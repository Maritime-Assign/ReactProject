import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import ViewBoard from '../pages/ViewBoard'
import { updateJob } from '../utils/jobHistoryOptimized'

const mockGetJobsArray = vi.hoisted(() => vi.fn())

vi.mock('../components/jobDataAPI', () => ({
  __esModule: true,
  default: mockGetJobsArray,
}))

vi.mock('../utils/jobHistoryOptimized', () => ({
  updateJob: vi.fn(),
}))

let mockOnJobUpdate
let mockTriggerSave

vi.mock('../components/Tile', () => ({
  __esModule: true,
  default: ({ job, onJobUpdate }) => {
    mockOnJobUpdate = onJobUpdate
    
    // Simulate what Tile.handleJobSave does
    mockTriggerSave = async (updatedData) => {
      // Call updateJob from jobHistoryOptimized
      const result = await updateJob(job.id, updatedData)
      
      // If successful, call onJobUpdate with the returned data
      if (result.success && result.data) {
        onJobUpdate(result.data)
      }
      
      return result
    }
    
    return (
      <div data-testid="job-tile">
        {job.shipName}
        <button onClick={() => mockTriggerSave({ shipName: job.shipName + ' Updated' })}>
          Save
        </button>
      </div>
    )
  },
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
    {
      id: '3',
      shipName: 'Archived Ship',
      region: 'Pacific',
      hall: 'C',
      joinDate: '2024-08-01',
      passThru: false,
      nightCardEarlyReturn: false,
      msc: false,
      open: false,
      archivedJob: true,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetJobsArray.mockResolvedValue(jobs)
    mockOnJobUpdate = null
    mockTriggerSave = null
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

  it('does not display archived jobs by default', async () => {
    renderViewBoard()
    await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
    expect(await screen.findByText('Voyager')).toBeInTheDocument()
    expect(screen.getByText('Endeavor')).toBeInTheDocument()
    expect(screen.queryByText('Archived Ship')).not.toBeInTheDocument()
  })

  it('displays archived job when searched for', async () => {
    renderViewBoard()
    await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
    expect(await screen.findByText('Voyager')).toBeInTheDocument()
    
    const searchBox = screen.getByPlaceholderText('Search vessel, region, hall, or join date…')
    fireEvent.change(searchBox, { target: { value: 'Archived' } })
    
    await waitFor(() => expect(screen.getByText('Archived Ship')).toBeInTheDocument())
    expect(screen.queryByText('Voyager')).not.toBeInTheDocument()
    expect(screen.queryByText('Endeavor')).not.toBeInTheDocument()
  })

  it('updates job when handleJobUpdate is called', async () => {
    renderViewBoard()
    await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
    expect(await screen.findByText('Voyager')).toBeInTheDocument()
    
    // Simulate a job update via the onJobUpdate callback
    const updatedJob = { ...jobs[0], shipName: 'Voyager Updated', open: false }
    mockOnJobUpdate(updatedJob)
    
    // Verify the updated job appears
    await waitFor(() => expect(screen.getByText('Voyager Updated')).toBeInTheDocument())
    expect(screen.queryByText('Voyager')).not.toBeInTheDocument()
  })

  it('calls updateJob which sets archivedJob to false when an archived job is updated', async () => {
    const archivedJob = {
      id: '4',
      shipName: 'Previously Archived',
      region: 'Atlantic',
      hall: 'D',
      joinDate: '2024-07-01',
      passThru: false,
      nightCardEarlyReturn: false,
      msc: false,
      open: false,
      archivedJob: true,
    }
    
    const jobsWithArchived = [...jobs, archivedJob]
    mockGetJobsArray.mockResolvedValue(jobsWithArchived)
    
    // Mock updateJob to simulate what jobHistoryOptimized.js does
    const updatedJobData = {
      ...archivedJob,
      shipName: 'Previously Archived - Now Active',
      open: true,
      archivedJob: false, // updateJob sets this to false
    }
    
    vi.mocked(updateJob).mockResolvedValue({
      success: true,
      data: updatedJobData,
      error: null,
    })
    
    renderViewBoard()
    await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
    
    // Search for the archived job to make it visible
    const searchBox = screen.getByPlaceholderText('Search vessel, region, hall, or join date…')
    fireEvent.change(searchBox, { target: { value: 'Previously Archived' } })
    
    await waitFor(() => expect(screen.getByText('Previously Archived')).toBeInTheDocument())
    
    // Trigger the save which simulates Tile calling updateJob then onJobUpdate
    await mockTriggerSave({
      shipName: 'Previously Archived - Now Active',
      open: true,
    })
    
    // Verify updateJob was called with correct parameters
    expect(updateJob).toHaveBeenCalledWith('4', {
      shipName: 'Previously Archived - Now Active',
      open: true,
    })
    
    // Verify the UI updated with the new job data
    await waitFor(() => 
      expect(screen.getByText('Previously Archived - Now Active')).toBeInTheDocument()
    )
    
    // Clear search to verify it's now shown in the default view (non-archived)
    fireEvent.change(searchBox, { target: { value: '' } })
    
    await waitFor(() => 
      expect(screen.getByText('Previously Archived - Now Active')).toBeInTheDocument()
    )
  })
})