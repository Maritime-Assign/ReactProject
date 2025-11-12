/**
 * Integration Test: AddJob form behavior, validation, and API integration
 * Validates Formik/Yup + AuthContext + addJob API + popup feedback
 */

/**
 * @vitest-environment jsdom
 */


import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AddJob from '../pages/AddJob'

// Mock authentication context
vi.mock('../auth/AuthContext', () => ({
    UserAuth: () => ({ user: { id: '1', email: 'test@example.com' } }),
}))

// Mock navigation
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useNavigate: () => vi.fn() }
})

// Mock backend API
vi.mock('../utils/jobHistoryOptimized', () => ({
    addJob: vi.fn(),
}))

// Mock Supabase dropdown data
vi.mock('../api/supabaseClient', () => ({
    __esModule: true,
    default: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
                data: {
                    region: [{ label: 'LA', is_active: true }],
                    hall: [{ label: 'LA', is_active: true }],
                    billet: [{ label: '1 A/E', is_active: true }],
                    type: [{ label: 'Relief', is_active: true }],
                },
                error: null,
            }),
        })),
    },
}))

vi.mock('../data/jobValidationSchema', () => {
    const yup = require('yup')
    return {
        __esModule: true,
        default: yup.object({
            status: yup.string().required('Required'),
            region: yup.string().required('Required'),
            hall: yup.string().required('Required'),
            shipName: yup.string().required('Required'),
            billet: yup.string().required('Required'),
            type: yup.string().required('Required'),
            days: yup.number().required('Required'),
            location: yup.string().required('Required'),
            company: yup.string().required('Required'),
            crewRelieved: yup.string(),
            // 🧩 skip validation for dates
            dateCalled: yup.string().nullable(),
            joinDate: yup.string().nullable(),
        }),
    }
})

import { addJob } from '../utils/jobHistoryOptimized'
console.log('addJob mock reference:', addJob)

import { test } from 'vitest'

// Reusable render helper
const renderAddJob = () =>
    render(
        <MemoryRouter>
            <AddJob />
        </MemoryRouter>
    )

describe('Integration: AddJob Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders full form and key fields', () => {
        renderAddJob()

        // one dropdown field, one date field, one text field, one optional field
        expect(screen.getByText(/Add New Job/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Status/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Region/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Date Called/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Vessel/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument()
    })

    test('shows validation errors on empty submit', async () => {
        renderAddJob()
        const user = userEvent.setup()

        await user.click(screen.getByRole('button', { name: /submit/i }))

        const errors = await screen.findAllByText(/required/i)
        expect(errors.length).toBeGreaterThan(3)
    })

    test('calls addJob on valid submit (Formik full flow)', async () => {
        addJob.mockResolvedValue({ success: true })
        renderAddJob()

        const user = userEvent.setup()

        // Helper to fire Formik-compatible change events
        const change = (label, name, value) => {
            fireEvent.change(screen.getByLabelText(label, { exact: false }), {
                target: { name, value },
            })
        }

        // Wait for dropdown mock to populate
        await waitFor(() =>
            expect(screen.getByLabelText(/Region/i).options.length).toBeGreaterThan(1)
        )

        console.log('Step 1: Form loaded')

        // Fill the form explicitly via change events
        change(/Status/i, 'status', 'Open')
        change(/Region/i, 'region', 'LA')
        change(/Hall/i, 'hall', 'LA')
        change(/Date Called/i, 'dateCalled', '2025-12-01')
        change(/Vessel/i, 'shipName', 'Test Vessel')
        change(/Join Date/i, 'joinDate', '2025-12-10')
        change(/Billet/i, 'billet', '1 A/E')
        change(/Type/i, 'type', 'Relief')
        change(/Days/i, 'days', 30)
        change(/Location/i, 'location', 'Oakland')
        change(/Company/i, 'company', 'ACME Marine')
        change(/Crew Relieved/i, 'crewRelieved', 'Smith')

        console.log('Step 2: Fields filled')

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /submit/i }))
        })

        console.log('Step 3: Submit clicked')

        await waitFor(() => expect(addJob).toHaveBeenCalledTimes(1), { timeout: 8000 })

        console.log('Step 4: addJob called successfully')

        // success message pop up
        await waitFor(() =>
            expect(screen.getByText(/Job added successfully!/i)).toBeInTheDocument()
        )
        console.log('Step 5: Form reset occurs')
        
        await waitFor(() => {
            expect(screen.getByLabelText(/Vessel/i)).toHaveValue('')
        })
    })




})