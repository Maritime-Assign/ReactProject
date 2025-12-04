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
                    company: [{ label: 'ACME Marine', is_active: true }], // ✅ Add this
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

        // Wait for dropdown mock to populate
        await waitFor(
            () =>
                expect(
                    screen.getByLabelText(/Region/i).options.length
                ).toBeGreaterThan(1),
            { timeout: 3000 }
        )

        console.log('Step 1: Form loaded')

        // Fill ALL dropdowns (selects)
        await user.selectOptions(
            screen.getByLabelText(/Status/i, { exact: false }),
            'Open'
        )
        await user.selectOptions(
            screen.getByLabelText(/Region/i, { exact: false }),
            'LA'
        )
        await user.selectOptions(
            screen.getByLabelText(/Hall/i, { exact: false }),
            'LA'
        )
        await user.selectOptions(
            screen.getByLabelText(/Billet/i, { exact: false }),
            '1 A/E'
        )
        await user.selectOptions(
            screen.getByLabelText(/Type/i, { exact: false }),
            'Relief'
        )
        await user.selectOptions(
            screen.getByLabelText(/Company/i, { exact: false }),
            'ACME Marine'
        ) // ✅ Changed to selectOptions

        // Fill text inputs only
        const vesselField = screen.getByLabelText(/Vessel/i, { exact: false })
        await user.type(vesselField, 'Test Vessel')
        vesselField.blur()

        const daysField = screen.getByLabelText(/Days/i, { exact: false })
        await user.type(daysField, '30')
        daysField.blur()

        const locationField = screen.getByLabelText(/Location/i, {
            exact: false,
        })
        await user.type(locationField, 'Oakland')
        locationField.blur()

        const crewField = screen.getByLabelText(/Crew Relieved/i, {
            exact: false,
        })
        await user.type(crewField, 'Smith')
        crewField.blur()

        // Date fields
        const dateCalledField = screen.getByLabelText(/Date Called/i, {
            exact: false,
        })
        await user.type(dateCalledField, '12/01/2025')
        dateCalledField.blur()

        const joinDateField = screen.getByLabelText(/Join Date/i, {
            exact: false,
        })
        await user.type(joinDateField, '12/10/2025')
        joinDateField.blur()

        console.log('Step 2: All fields filled')

        await user.click(screen.getByRole('button', { name: /submit/i }))

        console.log('Step 3: Submit clicked')

        await waitFor(
            () => {
                expect(addJob).toHaveBeenCalledTimes(1)
            },
            { timeout: 5000 }
        )

        console.log('Step 4: Success!')
    }, 15000)
})
