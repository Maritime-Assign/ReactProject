import { describe, it, expect, beforeEach, vi, test } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ManageUsers from '../pages/ManageUsers.jsx'
import supabase from '../api/supabaseClient.js'
import { faker } from '@faker-js/faker'

// Create fake users
let fakeUsers
beforeEach(() => {
    // Before each test generate a new set of fake users and mock backend
    // 3 fake users with id, first_name, username, and role
    fakeUsers = Array.from({ length: 3 }, () => ({
    id: faker.string.uuid(),
    first_name: faker.person.firstName(),
    username: faker.internet.username(),
    role: faker.helpers.arrayElement(['admin', 'dispatch', 'display']),
  }))

  // Mock Supabase to return fake users
  supabase.from = vi.fn(() => supabase)
  supabase.select = vi.fn().mockResolvedValue({ data: fakeUsers, error: null })
})

// Helper for rendering
const helperRender = () => {
  return render(
    <MemoryRouter>
      <ManageUsers />
    </MemoryRouter>
  )
}

// Start tests
describe('MangageUsers Page', () => {

    test('Checks for Role, Name, and Username columns', () => {
        helperRender()
        // Expect col headers to be in DOM
        expect(screen.getByText('Role')).toBeInTheDocument()
        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Username')).toBeInTheDocument()
    })
    
    test('renders rows for each user', async () => {
        helperRender()
        // For each fake user
        for (const user of fakeUsers) {
            // Locate first name cell
            const locateFirstName = await screen.findByText(user.first_name)
            const locateRole = user.role ? user.role[0].toUpperCase() + user.role.slice(1) : ''

            // Locate parent row for fake user
            let row = locateFirstName
            while (row && row !== document.body && !(row.textContent?.includes(user.username) && row.textContent?.includes(locateRole))) 
            {
              row = row.parentElement
            }
            expect(row).toBeTruthy()
            
            // Specify queries to fake user row
            const userRow = within(row)
            // Check is username is present
            expect(userRow.getByText(user.username)).toBeInTheDocument()
            expect(userRow.getByText(user.role[0].toUpperCase() + user.role.slice(1))).toBeInTheDocument()
        }
    })

    test('filters users based on search input (case-insensitive)', async () => {
        helperRender()

        const searchQuery = screen.getByPlaceholderText(/search by name or role/i)
        // Simulate tying username 
        fireEvent.change(searchQuery, { target: { value: fakeUsers[0].first_name.toLowerCase() } })

        // Check if what appears matches
        const userMatch = await screen.findByText((content) =>
            content.includes(fakeUsers[0].first_name)
        )
        expect(userMatch).toBeInTheDocument()

        // Expect a non matched user to not appear
        expect(screen.queryByText((content) => content.includes(fakeUsers[1].first_name))).toBeNull()
    })

    test('edit button links to EditUser page with correct href', async () => {
        helperRender()

        // Get all edit buttons 
        const editButtons = await screen.findAllByTitle(/edit role/i)
        // Expect 1 per user
        expect(editButtons.length).toBe(fakeUsers.length)

        // Expect that the first edit button links to edit user page
        expect(editButtons[0].closest('a')).toHaveAttribute('href', '/edituser')
    })
})
