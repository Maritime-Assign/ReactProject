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

describe('EditUser Unit Test', () => {
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

  it('changes role dropdown', async () => {
    setup()

    const roleDropdown = screen.getByRole('combobox');
    expect(roleDropdown).toHaveValue('dispatch');

    fireEvent.change(roleDropdown, { target: { value: 'admin' } });

    expect(roleDropdown).toHaveValue('admin');

  })
})
