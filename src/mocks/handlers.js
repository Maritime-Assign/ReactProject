import { http, HttpResponse } from 'msw'

// Define the mock job data you expect from Supabase
export const mockJobs = [
    // --- Mock Job 1: Regular MSC Job (Testing MSC and 'open' flags) ---
    {
        id: 1,
        region: 'OAK',
        hall: 'OAK',
        open: 'Open',
        FillDate: null,
        dateCalled: '10/25/2025',
        shipName: 'USNS Yuma',
        joinDate: '12/15/2025',
        billet: 'Able Seaman (AB)',
        type: 'Perm',
        days: '180',
        location: 'Singapore',
        crewRelieved: 'N/A (New Position)',
        notes: 'Passport required, STCW Basic Safety, VPDSD.',
        company: 'PCS-MSC',
        rowIndex: 0,
        nightCardEarlyReturn: false,
        msc: true,
        passThru: false,
        Users: {
            abbreviation: 'ABC', // Mock abbreviation from nested object
        },
    },
    // --- Mock Job 2: Pass Thru Job (Testing PassThru and 'filled' flags) ---
    {
        id: 2,
        region: 'NYC',
        hall: 'NYC',
        open: 'Filled by Company', // This job is filled/closed
        FillDate: '10/20/2025',
        dateCalled: '10/18/2025',
        shipName: 'M/V Liberty Ace',
        joinDate: '10/22/2025',
        billet: 'Chief Mate',
        type: 'Temporary',
        days: '60',
        location: 'Houston, TX',
        crewRelieved: 'Alex Johnson',
        notes: 'GMDSS, ARPA, Radar Observer.',
        company: 'Maersk Line',
        rowIndex: 1,
        nightCardEarlyReturn: false,
        msc: false,
        passThru: true,
        Users: {
            abbreviation: 'XYZ',
        },
    },
    // --- Mock Job 3: Night Card/Early Return Job (Testing edge case flags) ---
    {
        id: 3,
        region: 'LA',
        hall: 'LA',
        open: 'Filled',
        FillDate: '12/25/2025',
        dateCalled: '11/04/2025',
        shipName: 'USNS Guadalupe',
        joinDate: '12/05/2025',
        billet: 'QMED (Electrician)',
        type: 'Perm',
        days: '90-120',
        location: 'San Diego, CA',
        crewRelieved: 'Marcus Fenix',
        notes: 'Ensure all crew members have completed the latest STCW safety training and emergency drills prior to departure. Verify that all lifeboats, life rafts, and fire suppression systems are fully operational and documented in the safety log. Review bridge resource management protocols and confirm readiness of personal protective equipment for engine room and deck operations.',
        company: 'PCS-MSC',
        rowIndex: 2,
        nightCardEarlyReturn: true, // Flag for Night Card/Early Return
        msc: true,
        passThru: false,
        Users: {
            abbreviation: 'QRS',
        },
    },
]

export const handlers = [
    http.get(
        'https://niwgwqnkqpfjhxvcwjdt.supabase.co/rest/v1/Jobs_test2',
        () => {
            // This will now intercept the request that the real component code sends
            return HttpResponse.json(mockJobs, { status: 200 })
        }
    ),
]
