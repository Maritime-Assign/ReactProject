/**
 * Unit tests for the Login component
 *
 * Tests included:
 * 1. Renders username input, password input, and login button.
 * 2. Shows "Username Required" error if usernme is empty on submit.
 * 3. Shows "Password Required" error if password is empty on submit.
 * 4. Calls signInUser with correct arguments when valid username and password are provided.
 * 5. Toggles password visibility when the show password icon is clicked.
 *
 * - Supabase API calls and UserAuth context are mocked.
 * - useNavigate is mocked for routing.
 * - Focuses on component state, validation, and interactions; no real API calls are made.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../pages/Login'
import { UserAuth } from '../auth/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import supabase from '../api/supabaseClient'

// Mock supabase
vi.mock('../api/supabaseClient', () => ({
    default: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({
                        data: { UUID: 'user-123' },
                        error: null,
                    }),
                })),
            })),
        })),
    },
}))

// Mock UserAuth context
const mockSignInUser = vi.fn()
vi.mock('../auth/AuthContext', () => ({
    UserAuth: () => ({ signInUser: mockSignInUser }),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('Login component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders username and password inputs and login button', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        expect(
            screen.getByPlaceholderText(/enter username/i)
        ).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText(/enter password/i)
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /login/i })
        ).toBeInTheDocument()
    })

    it('shows error if username is empty on submit', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        fireEvent.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(screen.getByText(/username required/i)).toBeInTheDocument()
        })
    })

    it('shows error if password is empty on submit', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
            target: { value: 'testuser' },
        })

        fireEvent.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(screen.getByText(/password required/i)).toBeInTheDocument()
        })
    })

    it('calls signInUser when username and password are provided', async () => {
        mockSignInUser.mockResolvedValue({
            success: true,
            data: { user: { id: '123', email: 'test@test.com' } },
        })

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
            target: { value: 'testuser' },
        })
        fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
            target: { value: 'password123' },
        })

        fireEvent.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(mockSignInUser).toHaveBeenCalledWith(
                'testuser',
                'password123'
            )
        })
    })

    it('toggles password visibility when clicking the show password icon', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        const passwordInput = screen.getByPlaceholderText(/enter password/i)
        const toggleIcon = screen.getByAltText(/show password icon/i)

        // Initially type should be 'password'
        expect(passwordInput).toHaveAttribute('type', 'password')

        // Click to show password
        fireEvent.click(toggleIcon)
        expect(passwordInput).toHaveAttribute('type', 'text')

        // Click again to hide password
        fireEvent.click(toggleIcon)
        expect(passwordInput).toHaveAttribute('type', 'password')
    })
})
