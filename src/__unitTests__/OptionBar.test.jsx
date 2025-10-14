import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import OptionBar from '../components/OptionBar'
import { UserAuth } from '../context/AuthContext'

// Mock the UserAuth context
vi.mock('../context/AuthContext', () => ({
  UserAuth: vi.fn(),
}))

vi.mock('../components/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}))

describe('OptionBar Component', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('renders LoadingSpinner when loadingSession is true', () => {
    UserAuth.mockReturnValue({
      user: null,
      role: null,
      loadingSession: true,
      signOut: vi.fn(),
    })

    render(
      <MemoryRouter>
        <OptionBar />
      </MemoryRouter>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('renders Logo and SessionManager when user is logged in', () => {
    UserAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      role: 'admin',
      loadingSession: false,
      signOut: vi.fn(),
    })

    render(
      <MemoryRouter>
        <OptionBar />
      </MemoryRouter>
    )

    expect(screen.getByAltText('Maritime Assign Logo')).toBeInTheDocument()
    expect(screen.getByText('Signed in as:')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  test('renders NavBar with correct items for admin role', () => {
    UserAuth.mockReturnValue({
      user: { email: 'admin@example.com' },
      role: 'admin',
      loadingSession: false,
      signOut: vi.fn(),
    })

    render(
      <MemoryRouter>
        <OptionBar />
      </MemoryRouter>
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Job Board')).toBeInTheDocument()
  })

  test('calls signOut when Logout button is clicked', async () => {
    const mockSignOut = vi.fn()
    UserAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      role: 'admin',
      loadingSession: false,
      signOut: mockSignOut,
    })

    render(
      <MemoryRouter>
        <OptionBar />
      </MemoryRouter>
    )

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
    test('does not render navigation bar content on the login page', () => {
    UserAuth.mockReturnValue({
        user: null,
        role: null,
        loadingSession: false,
        signOut: vi.fn(),
    })

    render(
        <MemoryRouter initialEntries={['/login']}>
        <OptionBar />
        </MemoryRouter>
    )

    // Ensure the navigation bar content is not rendered
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
    expect(screen.queryByText('Job Board')).not.toBeInTheDocument()
    expect(screen.queryByText('Signed in as:')).not.toBeInTheDocument()

    // Ensure the logo is still rendered
    expect(screen.getByAltText('Maritime Assign Logo')).toBeInTheDocument()
    })

  describe('role-based rendering', () => {
    const rolesConfig = [
      { role: 'admin', expectedLink: '/admin/dashboard' },
      { role: 'dispatch', expectedLink: '/dispatch/dashboard' },
      { role: 'display', expectedLink: '/display/dashboard' },
    ]

    rolesConfig.forEach(({ role, expectedLink }) => {
      test(`for role "${role}", "Home" button has correct link`, () => {
        UserAuth.mockReturnValue({
          user: { email: `${role}@example.com` },
          role,
          loadingSession: false,
          signOut: vi.fn(),
        })

        render(
          <MemoryRouter>
            <OptionBar />
          </MemoryRouter>
        )

        // "Home" button should only be present for non-display roles
        if (role !== 'display') {
          const homeLink = screen.getByRole('link', { name: /home/i })
          expect(homeLink).toBeInTheDocument()
          expect(homeLink).toHaveAttribute('href', expectedLink)
        } else {
          expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument()
        }
      })
    })
  })
})