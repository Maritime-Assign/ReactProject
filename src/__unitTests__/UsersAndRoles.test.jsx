import UsersAndRoles from '../pages/UsersAndRoles.jsx'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

describe('Render UsersAndRoles page', () => {
    it('Checks for Role, Name, and Username columns', () => {
        render(
            <MemoryRouter>
                <UsersAndRoles />
            </MemoryRouter>
        );
        
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
    });
});
