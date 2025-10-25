import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

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
})

