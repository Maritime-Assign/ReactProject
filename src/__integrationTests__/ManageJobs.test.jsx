import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import ManageJobs from '../pages/ManageJobs'
import { updateJob } from '../utils/jobHistoryOptimized'

const mockGetJobsArray = vi.hoisted(() => vi.fn())

// mock fetchJobs API
vi.mock('../components/jobDataAPI', () => ({
    __esModule: true,
    default: mockGetJobsArray,
}))

// mock updateJob function
vi.mock('../utils/jobHistoryOptimized', () => ({
    updateJob: vi.fn(),
}))

// mock useNavigate so clicking the back button doesn't cause errors
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (orig) => {
    const actual = await orig()
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

let mockOnJobUpdate
const mockTriggerSaveByJobId = {}

// mock Tile
vi.mock('../components/Tile', () => ({
    __esModule: true,
    default: ({ job, onJobUpdate }) => {
        mockOnJobUpdate = onJobUpdate
        mockTriggerSaveByJobId[job.id] = async (updatedData) => {
            const result = await updateJob(job.id, updatedData)
            if (result.success && result.data) {
                onJobUpdate(result.data)
            }
            return result
        }

        return (
            <div data-testid='job-tile'>
                {job.shipName}
                <button
                    data-testid={`edit-button-${job.id}`}
                    onClick={() =>
                        mockTriggerSaveByJobId[job.id]({
                            shipName: job.shipName + ' Updated',
                        })
                    }
                >
                    Edit Job
                </button>
            </div>
        )
    },
}))

// mock Filter
vi.mock('../components/Filter', () => ({
    __esModule: true,
    default: ({ setView, setFilterOpen, searchWord, setSearchWord }) => {
        const [isOpen, setIsOpen] = React.useState(false)

        const toggleFilter = () => {
            setIsOpen(!isOpen)
            setFilterOpen(!isOpen)
        }

        return (
            <div>
                <button onClick={() => setView('list')}>Switch to list</button>
                <button onClick={toggleFilter}>Show Open Only</button>
                <input
                    placeholder='Search vessel, region, hall, or join date'
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                />
            </div>
        )
    },
}))

describe('ManageJobs integration', () => {
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
        Object.keys(mockTriggerSaveByJobId).forEach(
            (key) => delete mockTriggerSaveByJobId[key]
        )
    })

    const renderManageJobs = () =>
        render(
            <MemoryRouter>
                <ManageJobs />
            </MemoryRouter>
        )

    it('renders jobs fetched from API', async () => {
        renderManageJobs()
        await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
        expect(await screen.findByText('Voyager')).toBeInTheDocument()
        expect(screen.getByText('Endeavor')).toBeInTheDocument()
    })

    it('filters jobs by search input', async () => {
        renderManageJobs()
        expect(await screen.findByText('Voyager')).toBeInTheDocument()

        const searchBox = screen.getByPlaceholderText(
            'Search vessel, region, hall, or join date'
        )
        fireEvent.change(searchBox, { target: { value: 'ende' } })

        await waitFor(() =>
            expect(screen.queryByText('Voyager')).not.toBeInTheDocument()
        )
        expect(screen.getByText('Endeavor')).toBeInTheDocument()
    })

    it('shows only open jobs when filter is activated', async () => {
        renderManageJobs()
        expect(await screen.findByText('Voyager')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Show Open Only'))
        await waitFor(() =>
            expect(screen.queryByText('Endeavor')).not.toBeInTheDocument()
        )
        expect(screen.getByText('Voyager')).toBeInTheDocument()
    })

    it('does not display archived jobs by default', async () => {
        renderManageJobs()
        await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
        expect(await screen.findByText('Voyager')).toBeInTheDocument()
        expect(screen.getByText('Endeavor')).toBeInTheDocument()
        expect(screen.queryByText('Archived Ship')).not.toBeInTheDocument()
    })

    it('displays archived job when searched for', async () => {
        renderManageJobs()
        await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
        expect(await screen.findByText('Voyager')).toBeInTheDocument()

        const searchBox = screen.getByPlaceholderText(
            'Search vessel, region, hall, or join date'
        )
        fireEvent.change(searchBox, { target: { value: 'Archived' } })

        await waitFor(() =>
            expect(screen.getByText('Archived Ship')).toBeInTheDocument()
        )
        expect(screen.queryByText('Voyager')).not.toBeInTheDocument()
        expect(screen.queryByText('Endeavor')).not.toBeInTheDocument()
    })

    it('updates job when handleJobUpdate is called', async () => {
        renderManageJobs()
        await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())
        expect(await screen.findByText('Voyager')).toBeInTheDocument()

        const updatedJob = {
            ...jobs[0],
            shipName: 'Voyager Updated',
            open: 'Filled',
        }
        mockOnJobUpdate(updatedJob)

        await waitFor(() =>
            expect(screen.getByText('Voyager Updated')).toBeInTheDocument()
        )
        expect(screen.queryByText('Voyager')).not.toBeInTheDocument()
    })

    it('calls updateJob which sets archivedJob to false when an archived job is updated', async () => {
        const archivedJob = {
            id: '4',
            shipName: 'Previously Archived',
            region: 'Atlantic',
            hall: 'D',
            joinDate: '2024-07-01',
            open: 'Filled',
            archivedJob: true,
        }

        const jobsWithArchived = [...jobs, archivedJob]
        mockGetJobsArray.mockResolvedValue(jobsWithArchived)

        const updatedJobData = {
            ...archivedJob,
            shipName: 'Previously Archived - Now Active',
            open: 'Open',
            archivedJob: false,
        }

        vi.mocked(updateJob).mockResolvedValue({
            success: true,
            data: updatedJobData,
            error: null,
        })

        renderManageJobs()
        await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())

        const searchBox = screen.getByPlaceholderText(
            'Search vessel, region, hall, or join date'
        )
        fireEvent.change(searchBox, {
            target: { value: 'Previously Archived' },
        })

        await waitFor(() =>
            expect(screen.getByText('Previously Archived')).toBeInTheDocument()
        )

        await mockTriggerSaveByJobId['4']({
            shipName: 'Previously Archived - Now Active',
            open: 'Open',
        })

        expect(updateJob).toHaveBeenCalledWith('4', {
            shipName: 'Previously Archived - Now Active',
            open: 'Open',
        })

        await waitFor(() =>
            expect(
                screen.getByText('Previously Archived - Now Active')
            ).toBeInTheDocument()
        )

        fireEvent.change(searchBox, { target: { value: '' } })

        await waitFor(() =>
            expect(
                screen.getByText('Previously Archived - Now Active')
            ).toBeInTheDocument()
        )
    })

    describe('Tile component integration', () => {
        it('renders Tile components for each job', async () => {
            renderManageJobs()
            await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())

            const tiles = screen.getAllByTestId('job-tile')
            expect(tiles).toHaveLength(2)
            expect(tiles[0]).toHaveTextContent('Voyager')
            expect(tiles[1]).toHaveTextContent('Endeavor')
        })

        it('Tile edit button triggers job update', async () => {
            vi.mocked(updateJob).mockResolvedValue({
                success: true,
                data: { ...jobs[0], shipName: 'Voyager Updated' },
                error: null,
            })

            renderManageJobs()
            await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())

            fireEvent.click(screen.getByTestId('edit-button-1'))

            await waitFor(() =>
                expect(updateJob).toHaveBeenCalledWith('1', {
                    shipName: 'Voyager Updated',
                })
            )
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

            renderManageJobs()
            await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())

            fireEvent.click(screen.getByTestId('edit-button-1'))
            await waitFor(() =>
                expect(screen.getByText('Voyager Updated')).toBeInTheDocument()
            )

            fireEvent.click(screen.getByTestId('edit-button-2'))
            await waitFor(() =>
                expect(screen.getByText('Endeavor Updated')).toBeInTheDocument()
            )

            expect(updateJob).toHaveBeenCalledTimes(2)
        })

        it('Tile update failure does not update UI', async () => {
            vi.mocked(updateJob).mockResolvedValue({
                success: false,
                data: null,
                error: { message: 'Update failed' },
            })

            renderManageJobs()
            await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())

            fireEvent.click(screen.getByTestId('edit-button-1'))
            await waitFor(() => expect(updateJob).toHaveBeenCalled())

            expect(screen.getByText('Voyager')).toBeInTheDocument()
            expect(
                screen.queryByText('Voyager Updated')
            ).not.toBeInTheDocument()
            expect(updateJob).toHaveBeenCalledTimes(1)
        })

        it('Tiles update correctly after job status changes from closed to open', async () => {
            const updatedJob = { ...jobs[1], open: 'Open' }

            vi.mocked(updateJob).mockResolvedValue({
                success: true,
                data: updatedJob,
                error: null,
            })

            renderManageJobs()
            await waitFor(() => expect(mockGetJobsArray).toHaveBeenCalled())

            expect(screen.getByText('Voyager')).toBeInTheDocument()
            expect(screen.getByText('Endeavor')).toBeInTheDocument()

            fireEvent.click(screen.getByText('Show Open Only'))
            await waitFor(() => {
                expect(screen.getByText('Voyager')).toBeInTheDocument()
                expect(screen.queryByText('Endeavor')).not.toBeInTheDocument()
            })

            mockOnJobUpdate(updatedJob)

            await waitFor(() => {
                expect(screen.getByText('Voyager')).toBeInTheDocument()
                expect(screen.getByText('Endeavor')).toBeInTheDocument()
            })
        })
    })
})
