import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import EditUser from '../pages/EditUser.jsx';
import supabase from '../api/supabaseAdmin';

const mockSelect = vi.fn().mockResolvedValue({ data: [{/* updated user data */}], error: null });

const mockEq = vi.fn(() => ({
  select: mockSelect,
}));

const mockUpdate = vi.fn(() => ({
  eq: mockEq,
}));

const mockFromReturnValue = {
  update: mockUpdate,
};

// Mock the entire supabase API
vi.mock('../api/supabaseAdmin', () => ({
  default: {
    from: vi.fn(() => mockFromReturnValue),
    auth: {
      admin: {
        updateUserById: vi.fn().mockResolvedValue({ data: {}, error: null })
      }
    }
  }
}));

// Mocking useLocation to return custom state
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLocation: () => ({
      state: {
        username: 'johndoe',
        role: 'admin',
        UUID: '1234-uuid'
      }
    })
  };
});

test('renders the form with initial data and submits edits', async () => {
  render(
    <MemoryRouter initialEntries={['/edit-user']}>
      <Routes>
        <Route path="/edit-user" element={<EditUser />} />
      </Routes>
    </MemoryRouter>
  );

  // Check initial form values (username, role)
  expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();

  // Ensure the dropdown has the correct initial value
  const roleDropdown = screen.getByRole('combobox');
  expect(roleDropdown).toHaveValue('admin');

  // Change user role and submit
  fireEvent.change(roleDropdown, { target: { value: 'dispatch' } });
  fireEvent.click(screen.getByText('Submit Changes'));

  // Wait for the async operation to complete
  await waitFor(() => {
    expect(supabase.from).toHaveBeenCalledWith('Users');
    expect(mockUpdate).toHaveBeenCalledWith({
      username: 'johndoe',
      role: 'dispatch'
    });
  });
});
