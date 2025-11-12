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
const mockTriggerSaveByJobId = {}

vi.mock('../components/Tile', () => ({
  __esModule: true,
  default: ({ job, onJobUpdate }) => {
    mockOnJobUpdate = onJobUpdate
    
    // Simulate what Tile.handleJobSave does - store per job ID
    mockTriggerSaveByJobId[job.id] = async (updatedData) => {
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
        <button 
          data-testid={`edit-button-${job.id}`}
          onClick={() => mockTriggerSaveByJobId[job.id]({ shipName: job.shipName + ' Updated' })}
        >
          Edit Job
        </button>
      </div>
    )
  },
}))

vi.mock('../components/Filter', () => ({
  __esModule: true,
  default: ({ setView, setFilterOpen }) => {
    const [isOpen, setIsOpen] = React.useState(false)
    
    const toggleFilter = () => {
      setIsOpen(!isOpen)
      setFilterOpen(!isOpen)
    }
    
    return (
      <div>
        <button onClick={() => setView('list')}>Switch to list</button>
        <button onClick={toggleFilter}>Show Open Only</button>
      </div>
    )
  },
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
      open: 'Open',
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
      open: 'Filled',
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
      open: 'Filled',
      archivedJob: true,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetJobsArray.mockResolvedValue(jobs)
    mockOnJobUpdate = null
    Object.keys(mockTriggerSaveByJobId).forEach(key => delete mockTriggerSaveByJobId[key])
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
    const updatedJob = { ...jobs[0], shipName: 'Voyager Updated', open: 'Filled' }
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
      open: 'Filled',
      archivedJob: true,
    }
    
    const jobsWithArchived = [...jobs, archivedJob]
    mockGetJobsArray.mockResolvedValue(jobsWithArchived)
    
    // Mock updateJob to simulate what jobHistoryOptimized.js does
    const updatedJobData = {
      ...archivedJob,
      shipName: 'Previously Archived - Now Active',
      open: 'Open',
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
    await mockTriggerSaveByJobId['4']({
      shipName: 'Previously Archived - Now Active',
      open: 'Open',
    })
    
    // Verify updateJob was called with correct parameters
    expect(updateJob).toHaveBeenCalledWith('4', {
      shipName: 'Previously Archived - Now Active',
      open: 'Open',
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

  describe('Tile component integration', () => {
    it('renders Tile components for each job', async () => {
      renderViewBoard()
      await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
      
      const tiles = screen.getAllByTestId('job-tile')
      expect(tiles).toHaveLength(2) // Only non-archived jobs
      expect(tiles[0]).toHaveTextContent('Voyager')
      expect(tiles[1]).toHaveTextContent('Endeavor')
    })

    it('Tile edit button triggers job update', async () => {
      vi.mocked(updateJob).mockResolvedValue({
        success: true,
        data: { ...jobs[0], shipName: 'Voyager Updated' },
        error: null,
      })

      renderViewBoard()
      await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
      
      const editButton = screen.getByTestId('edit-button-1')
      fireEvent.click(editButton)
      
      await waitFor(() => expect(updateJob).toHaveBeenCalledWith('1', { shipName: 'Voyager Updated' }))
      expect(screen.getByText('Voyager Updated')).toBeInTheDocument()
    })

    it('multiple Tiles can be updated independently', async () => {
      vi.mocked(updateJob)
        .mockResolvedValueOnce({
          success: true,
          data: { ...jobs[0], shipName: 'Voyager Updated' },
          error: null,
        })
        .mockResolvedValueOnce({
          success: true,
          data: { ...jobs[1], shipName: 'Endeavor Updated' },
          error: null,
        })

      renderViewBoard()
      await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
      
      // Update first tile
      fireEvent.click(screen.getByTestId('edit-button-1'))
      await waitFor(() => expect(screen.getByText('Voyager Updated')).toBeInTheDocument())
      
      // Update second tile
      fireEvent.click(screen.getByTestId('edit-button-2'))
      await waitFor(() => expect(screen.getByText('Endeavor Updated')).toBeInTheDocument())
      
      // Both updates should have been called
      expect(updateJob).toHaveBeenCalledTimes(2)
    })

    it('Tile update failure does not update UI', async () => {
      vi.mocked(updateJob).mockResolvedValue({
        success: false,
        data: null,
        error: { message: 'Update failed' },
      })

      renderViewBoard()
      await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
      
      fireEvent.click(screen.getByTestId('edit-button-1'))
      
      await waitFor(() => expect(updateJob).toHaveBeenCalled())
      
      // Original ship name should still be visible
      expect(screen.getByText('Voyager')).toBeInTheDocument()
      expect(screen.queryByText('Voyager Updated')).not.toBeInTheDocument()

      //make sure that updateJob was called only once
      expect(updateJob).toHaveBeenCalledTimes(1)
    })

    it('Tiles update correctly after job status changes from closed to open', async () => {
      const updatedJob = { ...jobs[1], open: 'Open' }
      
      vi.mocked(updateJob).mockResolvedValue({
        success: true,
        data: updatedJob,
        error: null,
      })

      renderViewBoard()
      await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
      
      // Verify both jobs are initially visible (filter is OFF)
      expect(screen.getByText('Voyager')).toBeInTheDocument()
      expect(screen.getByText('Endeavor')).toBeInTheDocument()
      
      // Enable filter - only open jobs visible (Voyager)
      fireEvent.click(screen.getByText('Show Open Only'))
      await waitFor(() => {
        expect(screen.getByText('Voyager')).toBeInTheDocument()
        expect(screen.queryByText('Endeavor')).not.toBeInTheDocument()
      })
      
      // Update Endeavor to be open (while filter is active)
      mockOnJobUpdate(updatedJob)
      
      // Now both jobs should be visible since both are open
      await waitFor(() => {
        expect(screen.getByText('Voyager')).toBeInTheDocument()
        expect(screen.getByText('Endeavor')).toBeInTheDocument()
      })
    })
  })
})