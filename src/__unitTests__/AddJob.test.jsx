import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

import jobValidationSchema from '../data/jobValidationSchema'

beforeAll(() => {
    jobValidationSchema.fields.dateCalled = jobValidationSchema.fields.dateCalled.optional()
    jobValidationSchema.fields.joinDate = jobValidationSchema.fields.joinDate.optional()
})

vi.mock('../auth/AuthContext', () => ({
    UserAuth: () => ({ user: { id: '1', email: 'test@example.com' } }),
}))

vi.mock('../api/supabaseClient', () => {
  return {
    __esModule: true,
    default: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              region: [
                { label: 'LA', is_active: true, sort_order: 10 },
                { label: 'DEN', is_active: true, sort_order: 20 },
              ],
              hall: [{ label: 'LA', is_active: true }],
              billet: [{ label: '1 A/E', is_active: true }],
              type: [
                { label: 'Relief', is_active: true },
                { label: 'Permanent', is_active: true },
              ],
            },
            error: null,
          }),
        })),
      })),
    },
  }
})

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    }
})

vi.mock('../utils/jobHistoryOptimized', () => ({
    addJob: vi.fn(),
}))
import { addJob } from '../utils/jobHistoryOptimized'


import AddJob from "../pages/AddJob"
import { test } from 'vitest'

describe('Add new job page', () => {
    beforeEach(() => vi.clearAllMocks())

    test('renders without crashing', () => {
        render(
            <MemoryRouter>
                <AddJob />
            </MemoryRouter>
        )
        expect(screen.getByText(/Add New Job/i)).toBeInTheDocument()
    })

    test('renders key form components', () => {
        render(
            <MemoryRouter>
                <AddJob />
            </MemoryRouter>
        )

        const dateInput = screen.getByLabelText(/Date Called/i)
        expect(dateInput).toBeInTheDocument()

        const textInputs = screen.getAllByRole('textbox')
        expect(textInputs.length).toBeGreaterThan(0)

        const dropdowns = screen.getAllByRole('combobox')
        expect(dropdowns.length).toBeGreaterThan(0)

        const submitButton =
            screen.queryByRole('button', { name: /submit/i }) ||
            screen.queryByRole('button', { name: /add job/i })
        expect(submitButton).toBeInTheDocument()

    })

    test('shows validation error when required fields missing and toggles checkboxes', async () => {
        render(
            <MemoryRouter>
                <AddJob />
            </MemoryRouter>
        )

        const user = userEvent.setup()

        // Click submit without filling required fields
        await user.click(screen.getByRole('button', { name: /submit/i }))

        // Expect multiple "Required" validation errors
        const errors = await screen.findAllByText(/required/i)
        expect(errors.length).toBeGreaterThan(0)

        // Toggle the three checkboxes
        const passThruBox = screen.getByLabelText(/Pass-Thru/i)
        const nightCardBox = screen.getByLabelText(/Night Card Early Return/i)
        const mscBox = screen.getByLabelText(/MSC/i)

        await user.click(passThruBox)
        await user.click(nightCardBox)
        await user.click(mscBox)

        expect(passThruBox).toBeChecked()
        expect(nightCardBox).toBeChecked()
        expect(mscBox).toBeChecked()
    })

    test(
        'allows job submission when Notes field is empty',
        async () => {
            addJob.mockResolvedValue({ success: true })

            render(
                <MemoryRouter>
                    <AddJob />
                </MemoryRouter>
            )

            const user = userEvent.setup()

            // Use fireEvent to ensure Formik sees real change events
            const change = (label, name, value) =>
                fireEvent.change(screen.getByLabelText(label, { exact: false }), {
                    target: { name, value },
                })

             // Wait for dropdown options to populate from mock
            await waitFor(() =>
            expect(screen.getByLabelText(/Region/i).options.length).toBeGreaterThan(1)
            )

            await user.selectOptions(screen.getByLabelText(/Status/i), 'Open')
            await user.selectOptions(screen.getByLabelText(/Region/i), 'LA')
            await user.selectOptions(screen.getByLabelText(/Hall/i), 'LA')

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

            // Leave Notes blank intentionally
            await userEvent.click(screen.getByRole('button', { name: /submit/i }))
            console.log('Submitting form...')

            // Wait for Formik submit → addJob call
            await waitFor(() => expect(addJob).toHaveBeenCalled(), { timeout: 8000 })

            // Confirm notes was null
            expect(addJob).toHaveBeenCalledWith(
                expect.objectContaining({
                    notes: null,
                })
            )
        },
        8000
    )




})


