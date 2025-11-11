import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import EditUser from '../pages/EditUser'

// Mock supabase and supabaseAdmin
vi.mock('../api/supabaseClient', () => ({
  __esModule: true,
  default: {
    from: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [{ UUID: '123' }], error: null })
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'logged-user' } },
        error: null
      })
    }
  }
}))

vi.mock('../api/supabaseAdmin', () => ({
  __esModule: true,
  default: {
    auth: {
      admin: {
        updateUserById: vi.fn().mockResolvedValue({ data: {}, error: null }),
        deleteUser: vi.fn().mockResolvedValue({ data: {}, error: null })
      }
    }
  }
}))

// Mock useNavigate and alerts
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {
        UUID: '123',
        username: 'TestUser',
        role: 'dispatch',
        abbreviation: 'TST'
      }
    })
  }
})

describe('EditUser Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
  })

  const setup = () =>
    render(
      <MemoryRouter initialEntries={['/edit-user']}>
        <Routes>
          <Route path="/edit-user" element={<EditUser />} />
        </Routes>
      </MemoryRouter>
    )

  it('renders with state user data', () => {
    setup()

    expect(screen.getByDisplayValue('TestUser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('TST')).toBeInTheDocument()
  })

  it('shows abbreviation validation error when length is not 3', () => {
    setup()

    const abbrevInput = screen.getByPlaceholderText(/Enter 3 character abbreviation/i)
    fireEvent.change(abbrevInput, { target: { value: 'ABC' } })
    fireEvent.change(abbrevInput, { target: { value: 'ABCD' } })

    expect(screen.getByText(/Must be exactly 3 letters/i)).toBeInTheDocument()
  })

  it('submits form successfully', async () => {
    setup()

    const submitButton = screen.getByRole('button', { name: /Submit Changes/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('User updated successfully')
    })
  })

  it('calls delete user and navigates back', async () => {
    setup()

    const deleteButton = screen.getByRole('button', { name: /Delete User/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('User deleted successfully')
      expect(mockNavigate).toHaveBeenCalledWith('/users-roles')
    })
  })
})
