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

//Mock CSS modules (if your test environment doesn't already ignore CSS imports)
vi.mock('../pages/AddJob.module.css', () => ({ default: {} }), { virtual: true })

//Mock FormInput to keep tests focused on AddUser/Formik behavior
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


vi.mock('../api/supabaseClient', () => {
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
    //Expose the mocks so tests can control/responsive them:
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
import supabase from '../api/supabaseClient' //the mocked module

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AddUser from '../pages/AddUser'

//Helper to access the mock fns easily
const {
  mockMaybeSingle,
  mockEq,
  mockSelect,
  mockFrom,
  mockSignUp,
  mockGetSession,
  mockSetSession,
} = supabase.__mocks

const getInput = (label) => screen.getByLabelText(new RegExp(label, 'i'))

beforeEach(() => {
  vi.clearAllMocks()
})

describe ('AddUser Integration Test', () => {
    //Form validation test
    it ('Invalid form values prevent submission', async () => {
        render(<MemoryRouter><AddUser /></MemoryRouter>)

        //Fill up the form entries with empty data
        await userEvent.type(getInput('First Name'), 'Empty')
        await userEvent.tab() // blur
        await userEvent.click(screen.getByRole('button', { name: /submit/i }))
        
        //Await for at least one validation message
        const alerts = await screen.findAllByRole('alert')
        expect(alerts.length).toBeGreaterThan(0)
    })
    it ('Valid form values allow submission', async () => {
        //DB check says no existing user
        mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
        //signUp resolves successfully
        mockSignUp.mockResolvedValueOnce({ data: { user: { id: 'new-user-id' } }, error: null })
        render(<MemoryRouter><AddUser /></MemoryRouter>)

        //Valid form data
        await userEvent.type(getInput('First Name'), 'Rob')
        await userEvent.type(getInput('Abbreviation'), 'ZYX')
        await userEvent.type(getInput('Username'), 'robz')
        await userEvent.type(getInput('Password'), 'Testing1!')
        await userEvent.selectOptions(getInput('Role'), 'Admin')
        
        await userEvent.click(screen.getByRole('button', { name: /submit/i }))
        await waitFor(() => expect(mockSignUp).toHaveBeenCalled())
    })
    
    //Username lookup test
    it ('A resued username fails', async () => {
        mockMaybeSingle.mockResolvedValueOnce({ data: { UUID: 'exists-already' }, error: null })
        render(<MemoryRouter><AddUser /></MemoryRouter>)
        
        await userEvent.type(getInput('First Name'), 'Sydney')
        await userEvent.type(getInput('Abbreviation'), 'ABC')
        await userEvent.type(getInput('Username'), 'sydneyA')
        await userEvent.type(getInput('Password'), 'Testing2!')
        await userEvent.selectOptions(getInput('Role'), 'Dispatch')
        await userEvent.click(screen.getByRole('button', { name: /submit/i }))

        expect(await screen.findByText(/username.*exists|already/i)).toBeInTheDocument()
        expect(mockSignUp).not.toHaveBeenCalled()
    })
    it ('A database error is shown', async () => {
        //Simulate a DB error
        mockMaybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'DB failure' } })
        render(<MemoryRouter><AddUser /></MemoryRouter>)

        await userEvent.type(getInput('First Name'), 'Adam')
        await userEvent.type(getInput('Abbreviation'), 'EVE')
        await userEvent.type(getInput('Username'), 'adamE')
        await userEvent.type(getInput('Password'), 'Testing3!')
        await userEvent.selectOptions(getInput('Role'), 'Display')
        await userEvent.click(screen.getByRole('button', { name: /submit/i }))

        expect(await screen.findByText(/error|failed|unable to check/i)).toBeInTheDocument()
        expect(mockSignUp).not.toHaveBeenCalled()
    })
    it ('A signup error is shown', async () => {
        //No existing user in DB
        mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
        //signUp returns an error
        mockSignUp.mockResolvedValueOnce({ data: null, error: { message: 'SignUp failed' } })
        render(<MemoryRouter><AddUser /></MemoryRouter>)

        await userEvent.type(getInput('First Name'), 'Brent')
        await userEvent.type(getInput('Abbreviation'), 'CKR')
        await userEvent.type(getInput('Username'), 'brentC')
        await userEvent.type(getInput('Password'), 'Testing4!')
        await userEvent.selectOptions(getInput('Role'), 'Display')
        await userEvent.click(screen.getByRole('button', { name: /submit/i }))

        expect(await screen.findByText(/sign.?up|failed|error/i)).toBeInTheDocument()
        expect(mockSetSession).not.toHaveBeenCalled()
    })
    /*IsSubmitting render test*/
    it ('Submit button is disabled when processing submission', async () => {
        // Make signUp a promise that resolves later so we can assert intermediate disabled state
        mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })

        let resolveSignUp
        const signUpPromise = new Promise((res) => { resolveSignUp = res })
        mockSignUp.mockReturnValueOnce(signUpPromise) // pending promise

        //getSession returns admin session so setSession will be called after signUp
        mockGetSession.mockResolvedValueOnce({ data: { session: { access_token: 'token' } }, error: null })
        mockSetSession.mockResolvedValueOnce({ data: {}, error: null })

        render(<MemoryRouter><AddUser /></MemoryRouter>)

        await userEvent.type(getInput('First Name'), 'Carl')
        await userEvent.type(getInput('Abbreviation'), 'WHZ')
        await userEvent.type(getInput('Username'), 'carlw')
        await userEvent.type(getInput('Password'), 'Testing5!')
        await userEvent.selectOptions(getInput('Role'), 'Dispatch')

        const submitBtn = screen.getByRole('button', { name: /submit/i })
        //Click to submit and while signUp promise is pending, button should be disabled
        await userEvent.click(submitBtn)
        expect(submitBtn).toBeDisabled()
        //Label will either by 'Adding User...' or 'submit' based on latency
        expect(submitBtn).toHaveTextContent(/adding user|submit/i)

        //Resolve signUp
        resolveSignUp({ data: { user: { id: 'done' } }, error: null })
        await waitFor(() => expect(submitBtn).toBeEnabled())
    })
    //Get/set admin session test
    it ('The admin session is stored and restored properly', async () => {
        //DB check says no existing user
        mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
        //signUp resolves successfully
        mockSignUp.mockResolvedValueOnce({ data: { user: { id: 'new-user-id' } }, error: null })
        //Existing admin session
        const adminSession = { access_token: 'admin-token' }
        mockGetSession.mockResolvedValueOnce({ data: { session: { access_token: 'admin-token' } }, error: null })
        mockSetSession.mockResolvedValueOnce({ data: {}, error: null })
        render(<MemoryRouter><AddUser /></MemoryRouter>)

        await userEvent.type(getInput('First Name'), 'Carl')
        await userEvent.type(getInput('Abbreviation'), 'WHZ')
        await userEvent.type(getInput('Username'), 'carlw')
        await userEvent.type(getInput('Password'), 'Testing5!')
        await userEvent.selectOptions(getInput('Role'), 'Dispatch')

        await userEvent.click(screen.getByRole('button', { name: /submit/i }))

        //Check that the admin session is restored after signUp
        expect(mockSetSession).toHaveBeenCalledWith({ access_token: 'admin-token' })
    })
})