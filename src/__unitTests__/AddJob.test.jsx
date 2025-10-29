import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'


vi.mock('../auth/AuthContext', () => ({
    UserAuth: () => ({ user: { id: '1', email: 'test@example.com' } }),
}))

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

describe('Add new job page', () => {
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

        // ✅ Expect multiple "Required" validation errors
        const errors = await screen.findAllByText(/required/i)
        expect(errors.length).toBeGreaterThan(0)

        // ✅ Toggle the three checkboxes
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



})
