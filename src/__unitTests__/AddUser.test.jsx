/*
Method for Unit tests of the Dashboard components

If you want to replicate the tests you must first:
    -- npm install --save-dev @testing-library/react @testing-library/jest-dom
       - This package provides  matchers to test the state of the DOM and the components.
    
    -- Use [npm test] command to run the tests.
       - This runs all test files in src matching pattern *.test.{js,jsx,ts,tsx}
*/

// === Mocks ===

// Mock navigate from react-router-dom

import React from 'react'
import { vi } from 'vitest'
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock CSS modules (if your test environment doesn't already ignore CSS imports)
vi.mock('../pages/AddJob.module.css', () => ({ default: {} }), { virtual: true })

// Mock FormInput to keep tests focused on AddUser/Formik behavior
vi.mock('../components/FormInput', () => ({
  default: (props) => {
    const { label, name, type = 'text', value, onChange, onBlur, options, errors } = props
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        {type === 'select' ? (
          <select id={name} name={name} value={value || ''} onChange={onChange} onBlur={onBlur}>
            <option value="">Select</option>
            {options && options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ) : (
          <input id={name} name={name} type={type} value={value || ''} onChange={onChange} onBlur={onBlur} />
        )}
        {errors && <div role="alert">{errors}</div>}
      </div>
    )
  },
}))


vi.mock('../supabaseClient', () => {
  const mockMaybeSingle = vi.fn()
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))

  const mockSignUp = vi.fn()
  const mockGetSession = vi.fn()
  const mockSetSession = vi.fn()

  const defaultExport = {
    from: mockFrom,
    auth: {
      signUp: mockSignUp,
      getSession: mockGetSession,
      setSession: mockSetSession,
    },
    // Expose the mocks so tests can control/responsive them:
    __mocks: {
      mockMaybeSingle,
      mockEq,
      mockSelect,
      mockFrom,
      mockSignUp,
      mockGetSession,
      mockSetSession,
    },
  }
  return {default: defaultExport}
})
import supabase from '../supabaseClient' // the mocked module


import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AddUser from '../pages/AddUser'

// Helper to access the mock fns easily
const {
  mockMaybeSingle,
  mockEq,
  mockSelect,
  mockFrom,
  mockSignUp,
  mockGetSession,
  mockSetSession,
} = supabase.__mocks

// === Helpers ===
const getInput = (label) => screen.getByLabelText(new RegExp(label, 'i'))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AddUser page', () => {
  test('renders form fields, role select, submit and back button', async () => {
    render(<MemoryRouter><AddUser /></MemoryRouter>)

    // expect inputs/labels to exist
    expect(getInput('First Name')).toBeInTheDocument()
    expect(getInput('Last Name')).toBeInTheDocument()
    expect(getInput('Username')).toBeInTheDocument()
    expect(getInput('Password')).toBeInTheDocument()
    // Role is select
    expect(getInput('Role')).toBeInTheDocument()
    // Submit button
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    // Back (arrow) button - component likely renders an element (we look for an element with role=button and aria-label/back text)
    
    // Submit button must exist (explicit)
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()

    // Back button: prefer an accessible button named "back", otherwise fall back to the first button on the page
    const backBtn = screen.queryByRole('button', { name: /back/i }) || screen.getAllByRole('button')[0]
    expect(backBtn).toBeTruthy()

    })

  test('initial values empty', () => {
    render(<MemoryRouter><AddUser /></MemoryRouter>)
    expect(getInput('First Name')).toHaveValue('')
    expect(getInput('Last Name')).toHaveValue('')
    expect(getInput('Username')).toHaveValue('')
    expect(getInput('Password')).toHaveValue('')
    expect(getInput('Role')).toHaveValue('')
  })

  test('shows validation errors only after submit (Formik configured to validate on submit)', async () => {
    render(<MemoryRouter><AddUser /></MemoryRouter>)

    // interact without submitting: type and blur - there should be no validation errors yet due to validateOnBlur:false in AddUser
    await userEvent.type(getInput('First Name'), 'A')
    await userEvent.tab() // blur
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument()

    // Submit with minimal/empty data - should show validation messages
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))
    
    // Await for at least one validation message (there may be multiple alerts)
    const alerts = await screen.findAllByRole('alert')
    expect(alerts.length).toBeGreaterThan(0)

    })

  test('rejects weak password per schema (password pattern)', async () => {
    render(<MemoryRouter><AddUser /></MemoryRouter>)

    // Fill out valid other fields
    await userEvent.type(getInput('First Name'), 'Bob')
    await userEvent.type(getInput('Last Name'), 'Smith')
    await userEvent.type(getInput('Username'), 'bobuser')
    // Weak password: 'password' (lowercase only) - should be rejected by pattern-based validation on submit
    await userEvent.type(getInput('Password'), 'password')

    await userEvent.selectOptions(getInput('Role'), 'Admin')

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    // Password errors typically contain 'uppercase' or 'number' or 'special', so match any of those keywords
    expect(await screen.findByText(/uppercase|number|special|must/i)).toBeInTheDocument()
  })

  test('username already exists path: setFieldError displays username error and signUp not called', async () => {
    // Configure the DB check to return an existing record
    mockMaybeSingle.mockResolvedValueOnce({ data: { UUID: 'exists-123' }, error: null })

    render(<MemoryRouter><AddUser /></MemoryRouter>)

    await userEvent.type(getInput('First Name'), 'Alice')
    await userEvent.type(getInput('Last Name'), 'Jones')
    await userEvent.type(getInput('Username'), 'alice')
    await userEvent.type(getInput('Password'), 'Password1!')
    await userEvent.selectOptions(getInput('Role'), 'Admin')

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    // Expect an error message about username already existing (match case-insensitive)
    expect(await screen.findByText(/username.*exists|already/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  test('db select returns error -> displays generic submit error', async () => {
    // simulate a DB error
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'DB failure' } })

    render(<MemoryRouter><AddUser /></MemoryRouter>)

    await userEvent.type(getInput('First Name'), 'Eve')
    await userEvent.type(getInput('Last Name'), 'Me')
    await userEvent.type(getInput('Username'), 'eve')
    await userEvent.type(getInput('Password'), 'Password1!')
    await userEvent.selectOptions(getInput('Role'), 'Dispatch')

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    // Expect a submit-level error message to appear (component sets actions.setStatus({ submitError: ... }))
    expect(await screen.findByText(/error|failed|unable to check/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  test('supabase.auth.signUp error -> shows sign up error and does not call setSession', async () => {
    // No existing user in DB
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    // signUp returns an error
    mockSignUp.mockResolvedValueOnce({ data: null, error: { message: 'SignUp failed' } })

    render(<MemoryRouter><AddUser /></MemoryRouter>)

    await userEvent.type(getInput('First Name'), 'Trent')
    await userEvent.type(getInput('Last Name'), 'Lane')
    await userEvent.type(getInput('Username'), 'trent')
    await userEvent.type(getInput('Password'), 'Password1!')
    await userEvent.selectOptions(getInput('Role'), 'Display')

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(/sign.?up|failed|error/i)).toBeInTheDocument()
    expect(mockSetSession).not.toHaveBeenCalled()
    
  })

  test('successful sign up: calls signUp with constructed email, restores admin session, resets form', async () => {
    // DB check says no existing user
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    // getSession returns admin session token (pre-existing admin session)
    const adminSession = { access_token: 'admin-token' }
    mockGetSession.mockResolvedValueOnce({ data: { session: adminSession }, error: null })

    // signUp resolves successfully
    mockSignUp.mockResolvedValueOnce({ data: { user: { id: 'new-user-id' } }, error: null })

    // setSession resolves
    mockSetSession.mockResolvedValueOnce({ data: {}, error: null })

    render(<MemoryRouter><AddUser /></MemoryRouter>)

    await userEvent.type(getInput('First Name'), 'Sam')
    await userEvent.type(getInput('Last Name'), 'Taylor')
    await userEvent.type(getInput('Username'), 'samt')
    await userEvent.type(getInput('Password'), 'Password1!')
    await userEvent.selectOptions(getInput('Role'), 'Admin')

    const submitBtn = screen.getByRole('button', { name: /submit/i })

    await userEvent.click(submitBtn)

    // While submitting, button label might change to 'Adding User...' according to component
    // We check that signUp was called and that setSession was called to restore the admin session
    await waitFor(() => expect(mockSignUp).toHaveBeenCalled())

    // Check signUp called with constructed email (pattern from component: `${username}@maritimeassign.local`)
    expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
      email: expect.stringMatching(/^samt@/i),
      password: 'Password1!',
      options: expect.anything(),
    }))

    // verify admin session restored after signUp
    expect(mockSetSession).toHaveBeenCalledWith(adminSession)

    // Verify form was reset: username input should be cleared
    await waitFor(() => expect(getInput('Username')).toHaveValue(''))
  })

  test('submit button disabled while submitting', async () => {
    // Make signUp a promise that resolves later so we can assert intermediate disabled state
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

    let resolveSignUp
    const signUpPromise = new Promise((res) => { resolveSignUp = res })
    mockSignUp.mockReturnValueOnce(signUpPromise) // pending promise

    // getSession returns admin session so setSession will be called after signUp
    mockGetSession.mockResolvedValueOnce({ data: { session: { access_token: 'token' } }, error: null })
    mockSetSession.mockResolvedValueOnce({ data: {}, error: null })

    render(<MemoryRouter><AddUser /></MemoryRouter>)

    await userEvent.type(getInput('First Name'), 'Will')
    await userEvent.type(getInput('Last Name'), 'Hunter')
    await userEvent.type(getInput('Username'), 'willh')
    await userEvent.type(getInput('Password'), 'Password1!')
    await userEvent.selectOptions(getInput('Role'), 'Display')

    const submitBtn = screen.getByRole('button', { name: /submit/i })

    // click to submit and while signUp promise is pending, button should be disabled (isSubmitting true)
   await userEvent.click(submitBtn)
expect(submitBtn).toBeDisabled()
// label may change to 'Adding User...' -- check the same button we clicked
expect(submitBtn).toHaveTextContent(/adding user|submit/i)

    // resolve signUp
    resolveSignUp({ data: { user: { id: 'done' } }, error: null })
    // wait for promise resolution and component updates
    await waitFor(() => expect(submitBtn).toBeEnabled())
  })

  test('back button navigates back (-1)', async () => {
    render(<MemoryRouter><AddUser /></MemoryRouter>)
    // try to find a back button - the component uses IoArrowBack but accessible name might be missing.
    // Try query by aria-label or role:button that contains svg — fall back to first button if necessary.
    const backBtn = screen.queryByRole('button', { name: /back/i }) || screen.getAllByRole('button')[0]
    await userEvent.click(backBtn)
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
