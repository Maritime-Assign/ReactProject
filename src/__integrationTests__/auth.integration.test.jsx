/**
 * src/__integrationTests__/auth.integration.test.jsx
 *
 * Vitest + React Testing Library integration tests for Sign-In / Sign-Out flows.
 *
 * Mocks:
 *  - ../api/supabaseClient (default export) with helpers __setGetSession, __getFromMock, __reset
 *  - ../auth/AuthContext (partial) but provides a reactive UserAuth hook backed by a tiny store
 *
 * The reactive UserAuth uses React.useSyncExternalStore so changing the test store
 * re-triggers component updates (no manual rerender/act calls required).
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AuthContextProvider } from '../auth/AuthContext' // keep provider available (we spread actual exports in mock)

// Components under test
import Login from '../pages/Login'
import OptionBar from '../components/OptionBar'

// --- Fixtures ---
const roles = {
  admin: { id: 'u-admin', role: 'admin', email: 'admin@example.com' },
  dispatch: { id: 'u-dispatch', role: 'dispatch', email: 'dispatch@example.com' },
  display: { id: 'u-display', role: 'display', email: 'display@example.com' },
}

// --- Mocked modules (self-contained factories) ---

vi.mock('../api/supabaseClient', () => {
  // everything inside factory to avoid hoisting issues
  const fromFn = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn(),
  }))

  const auth = {
    // default: unauthenticated
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn(),
  }

  const supabaseMock = {
    from: fromFn,
    auth,
  }

  // named helpers for tests
  const __setGetSession = (resp) => {
    auth.getSession.mockResolvedValue(resp)
  }
  const __getFromMock = () => fromFn
  const __reset = () => {
    fromFn.mockReset()
    auth.getSession.mockReset()
    auth.getSession.mockResolvedValue({ data: { session: null } })
    auth.signOut.mockReset()
    auth.signInWithPassword.mockReset()
  }

  return {
    // default export consumed by runtime code (Login imports default)
    default: supabaseMock,
    // helpers consumed by tests
    __setGetSession,
    __getFromMock,
    __reset,
  }
})

vi.mock('../auth/AuthContext', async (importOriginal) => {
  // import the real module so we can preserve other exports (like AuthContextProvider)
  const actual = await importOriginal()

  // tiny reactive store implementation
  const createStore = () => {
    let current = null
    const listeners = new Set()
    return {
      get: () => current,
      set: (u) => {
        current = u
        listeners.forEach((l) => l())
      },
      subscribe: (l) => {
        listeners.add(l)
        return () => listeners.delete(l)
      },
    }
  }

  const store = createStore()

  // spies that update the store when called
  const signInSpy = vi.fn(async (username, password) => {
    const map = {
      admin: roles.admin,
      dispatch: roles.dispatch,
      display: roles.display,
    }
    if (!map[username] || password !== 'correct') return { success: false }
    const user = { id: map[username].id, email: map[username].email, role: map[username].role }
    store.set(user)
    return { success: true, data: { user } }
  })

  const signOutSpy = vi.fn(async () => {
    store.set(null)
    return { error: null }
  })

  // Reactive hook exposed as UserAuth for components to call
  // useSyncExternalStore ensures components re-render when store changes
  const UserAuth = () => {
    const user = React.useSyncExternalStore(store.subscribe, store.get, store.get)
    return {
      signInUser: signInSpy,
      signOut: signOutSpy,
      get user() {
        return user
      },
      get role() {
        return user?.role ?? null
      },
      loadingSession: false,
    }
  }

  // helpers for tests (optional convenience)
  const __setUser = (u) => store.set(u)
  const __getSpies = () => ({ signInSpy, signOutSpy })

  // return real exports plus our hook & helpers
  return {
    ...actual,
    UserAuth,
    __setUser,
    __getSpies,
  }
})

// --- Import the mocks' helpers and default objects AFTER vi.mock ---
import supabase, { __setGetSession, __getFromMock, __reset as __resetSupabase } from '../api/supabaseClient'
import { UserAuth as _UserAuthHelper, __setUser, __getSpies } from '../auth/AuthContext'

// small protected page used in a protected-route test
function ProtectedTestPage() {
  return <div data-testid="protected">Protected</div>
}

// reset between tests
beforeEach(() => {
  vi.clearAllMocks()
  __resetSupabase()
  // ensure mock session starts unauthenticated
  __setGetSession({ data: { session: null } })
  __setUser(null)
})

// --- Tests ---
describe('Auth integration flows (compatible with current Login.jsx + AuthContext)', () => {
  it.each([
    ['admin'],
    ['dispatch'],
    ['display'],
  ])('successful sign-in for %s calls signInUser and logs an event', async (roleKey) => {
    // Make the Users lookup succeed (Login calls supabase.from('Users').select(...).single())
    const userRecord = { UUID: `${roleKey}-uuid` }
    const fromObj = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: userRecord, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }
    supabase.from.mockImplementation(() => fromObj)

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* dashboards not required for this test */}
        </Routes>
      </MemoryRouter>
    )

    await userEvent.type(screen.getByPlaceholderText(/enter username/i), roleKey)
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'correct')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    const { signInSpy } = __getSpies()

    await waitFor(() => {
      expect(signInSpy).toHaveBeenCalledWith(roleKey, 'correct')
      expect(fromObj.select).toHaveBeenCalled()
      expect(fromObj.single).toHaveBeenCalled()
    })

    expect(fromObj.insert).toHaveBeenCalled()
  }, 5000)

  it('invalid credentials show Invalid Password and do not create a session', async () => {
    const fromObj = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { UUID: 'x' }, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }
    supabase.from.mockImplementation(() => fromObj)

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    )

    await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'admin')
    await userEvent.type(screen.getByPlaceholderText(/enter password/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    const { signInSpy } = __getSpies()
    await waitFor(() => expect(signInSpy).toHaveBeenCalled())

    expect(await screen.findByText(/Invalid Password/i)).toBeInTheDocument()
    const sess = await supabase.auth.getSession()
    expect(sess.data.session).toBeNull()
  })

  it('unauthenticated users are redirected to /login when accessing a protected route', async () => {
    const ProtectedWrapper = () => {
      const { user } = _UserAuthHelper()
      return user ? <ProtectedTestPage /> : <Navigate to="/login" replace />
    }

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedWrapper />} />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByTestId('login-page')).toBeInTheDocument()
  })

  it('role-based UI in OptionBar: Display hides nav, Dispatch/Admin show nav', async () => {
    const renderOptionBarAt = (initialPath = '/') =>
      render(
        <MemoryRouter initialEntries={[initialPath]}>
          <OptionBar />
        </MemoryRouter>
      )

    // Display should hide Home/Job Board
    __setUser(roles.display)
    const { rerender } = renderOptionBarAt('/')
    expect(screen.queryByText(/Job Board/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Home/i)).not.toBeInTheDocument()

    // Switch to dispatch
    __setUser(roles.dispatch)
    rerender(
      <MemoryRouter initialEntries={['/']}>
        <OptionBar />
      </MemoryRouter>
    )
    expect(screen.getByText(/Job Board/i)).toBeInTheDocument()
    expect(screen.getByText(/Home/i)).toBeInTheDocument()

    // Switch to admin
    __setUser(roles.admin)
    rerender(
      <MemoryRouter initialEntries={['/']}>
        <OptionBar />
      </MemoryRouter>
    )
    expect(screen.getByText(/Job Board/i)).toBeInTheDocument()
    expect(screen.getByText(/Home/i)).toBeInTheDocument()
  })

  it('session persists (mocked) and sign-out clears session UI', async () => {
    // Start with no user
    __setUser(null)

    // Render OptionBar inside the real AuthContextProvider (we preserved it in the mock)
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContextProvider>
          <OptionBar />
        </AuthContextProvider>
      </MemoryRouter>
    )

    const { signInSpy, signOutSpy } = __getSpies()

    // Sign in via the spy (this updates the reactive store)
    await signInSpy('admin', 'correct')

    // Now OptionBar should show the signed-in UI
    expect(await screen.findByText(/Signed in as:/i)).toBeInTheDocument()
    expect(screen.getByText(/admin/i)).toBeInTheDocument()

    // Click logout button in UI
    await userEvent.click(screen.getByRole('button', { name: /logout/i }))
    await waitFor(() => expect(signOutSpy).toHaveBeenCalled())

    // After signOutSpy runs it sets the store to null; wait for the UI to update
    await waitFor(() => {
      expect(screen.getByText(/Guest/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Login/i) || screen.getByText(/Guest/i)).toBeTruthy()
  })
})
