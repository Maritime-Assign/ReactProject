import { render,screen, waitForElementToBeRemoved, waitFor } from "@testing-library/react";
import { expect, afterEach } from "vitest";
import "@testing-library/jest-dom";
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import FSBoard from '../pages/FSboard'
import getJobsArray from "../components/jobDataAPI";

vi.mock('../context/AuthContext', () => ({
    UserAuth: () => ({ user: {
        id: '1',
        email: 'test@example.com'
    }}),
}))

vi.mock('../components/jobDataAPI', () => ({
    default: vi.fn(),
}));

describe('FSBoard components', () => {
    beforeEach(() => {
        getJobsArray.mockResolvedValue([{
        id: 1,
        region: 'OAK',
        hall: 'OAK',
        open: true,
        FillDate: null,
        dateCalled: '1/31/2025',
        shipName: 'USNS Watkins',
        joinDate: '2/22/2025',
        billet: '1 A/E',
        type: 'Perm',
        days: '90',
        location: 'Busan',
        crewRelieved: 'Jason Greene',
        notes: 'FOS, Universal EPA, CMEO, Additional 1AE or Supp 2AE, Resume and online training',
        company: 'PCS-MSC',
        },
        {
        id: 2,
        region: 'OAK',
        hall: 'SEA',
        open: false,
        FillDate: 'CHS',
        dateCalled: '2/4/2025',
        shipName: 'Bob Hope',
        joinDate: 'ASAP',
        billet: '2M',
        type: 'Relief',
        days: '10',
        location: 'Portland, OR',
        crewRelieved: 'N/A',
        notes: 'Turbo Activation Night Card / Early Return',
        company: 'Keystone',
    }])
    })

    test('FSBoard renders loading message before fetching data', () => {
        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )
        expect(screen.getByText('Loading jobs...')).toBeInTheDocument()
    })

    test('FSBoard renders the FSBheader onto the screen', async () => {
        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )
        await waitForElementToBeRemoved(() => screen.queryByText("Loading jobs..."));
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Hall')).toBeInTheDocument()
        expect(screen.getByText('Date Called')).toBeInTheDocument()
        expect(screen.getByText('Ship Name')).toBeInTheDocument()
        expect(screen.getByText('Join Date')).toBeInTheDocument()
        expect(screen.getByText('Billet')).toBeInTheDocument()
        expect(screen.getByText('Type')).toBeInTheDocument()
        expect(screen.getByText('Days')).toBeInTheDocument()
        expect(screen.getByText('Location')).toBeInTheDocument()
        expect(screen.getByText('Company')).toBeInTheDocument()
        expect(screen.getByText('Crew Relieved')).toBeInTheDocument()
        expect(screen.getByText('Notes')).toBeInTheDocument()
    })

    test('FSBoard renders all possible job claim states', async () => {
        render(
            <MemoryRouter>
                <FSBoard />
            </MemoryRouter>
        )
        await waitForElementToBeRemoved(() => screen.queryByText("Loading jobs..."));
        expect(screen.getAllByText('Open')).toHaveLength(1)
        expect(screen.getAllByText('Claimed on CHS')).toHaveLength(1)
    })
})
