import { render, screen } from '@testing-library/react'

// Mock AuthContext
vi.mock('../auth/AuthContext', () => ({
    UserAuth: () => ({ user: { id: '1', email: 'test@example.com' } }),
}))

// Mock jobHistoryOptimized
vi.mock('../utils/jobHistoryOptimized', () => ({
    updateJob: vi.fn(),
}))

// Mock supabase client
vi.mock('../api/supabaseClient', () => ({
    default: {
        from: vi.fn(() => ({
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn(),
                    })),
                })),
            })),
        })),
    },
}))

import EditJobModal from '../components/EditJobModal'

describe('EditJobModal Component', () => {
    const mockJobData = {
        id: 1,
        shipName: 'Test Ship',
        region: 'LA',
        hall: 'LA',
        open: true,
        notes: 'Test notes',
        location: 'Test Location',
        days: 30,
        dateCalled: '2024-01-01',
        joinDate: '2024-01-15',
        company: 'Test Company',
        billet: '1A/E',
        type: 'Permanent',
        crewRelieved: 'Test Crew',
    }

    const mockOnClose = vi.fn()
    const mockOnSave = vi.fn()

    test('renders the modal without crashing', () => {
        render(
            <EditJobModal
                jobData={mockJobData}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        )

        expect(screen.getByText(/Edit Job/i)).toBeInTheDocument()
    })

    test('renders all form input fields', () => {
        render(
            <EditJobModal
                jobData={mockJobData}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        )

        // Check for ship name input
        const shipNameInput = screen.getByPlaceholderText(/Ship Name/i)
        expect(shipNameInput).toBeInTheDocument()
        expect(shipNameInput).toHaveValue(mockJobData.shipName)

        // Check for location input
        const locationInput = screen.getByPlaceholderText(/Location/i)
        expect(locationInput).toBeInTheDocument()

        // Check for company input
        const companyInput = screen.getByPlaceholderText(/Company/i)
        expect(companyInput).toBeInTheDocument()
    })

    test('renders action buttons', () => {
        render(
            <EditJobModal
                jobData={mockJobData}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        )

        // Check for Save button
        const saveButton = screen.getByRole('button', { name: /Save/i })
        expect(saveButton).toBeInTheDocument()

        // Check for Cancel button
        const cancelButton = screen.getByRole('button', { name: /Cancel/i })
        expect(cancelButton).toBeInTheDocument()

        // Check for Remove Job button
        const removeButton = screen.getByRole('button', { name: /Remove Job/i })
        expect(removeButton).toBeInTheDocument()
    })

    test('renders dropdown selects for billet and type', () => {
        render(
            <EditJobModal
                jobData={mockJobData}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        )

        const dropdowns = screen.getAllByRole('combobox')
        expect(dropdowns.length).toBeGreaterThan(0)
    })

    test('renders notes textarea', () => {
        render(
            <EditJobModal
                jobData={mockJobData}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        )

        const notesTextarea = screen.getByPlaceholderText(
            /Enter notes\/requirements/i
        )
        expect(notesTextarea).toBeInTheDocument()
        expect(notesTextarea).toHaveValue(mockJobData.notes)
    })
})
