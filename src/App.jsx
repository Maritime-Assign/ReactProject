import {
    Routes,
    Route,
    Navigate,
    useNavigate,
    useLocation,
} from 'react-router-dom'
import { useEffect, useState } from 'react'
import OptionBar from './components/OptionBar'
import Dashboard from './pages/Dashboard'
import DashboardDispatch from './pages/DashboardDispatch'
import DashboardDisplay from './pages/DashboardDisplay'
import ManageJobs from './pages/ManageJobs'
import PasswordRecovery from './pages/PasswordRecovery'
import Login from './pages/Login'
import './App.css'
import AddJob from './pages/AddJob'
import FSboard from './pages/FSboard'
import ManageUsers from './pages/ManageUsers'
import EditJob from './pages/EditJob'
import ViewHistory from './components/ViewHistory'
import AddUser from './pages/AddUser'
import SetPassword from './pages/SetPassword'
import EditUser from './pages/EditUser'
import LoadingSpinner from './components/LoadingSpinner'
import { UserAuth } from './auth/AuthContext'
import usePermission from './components/PermissionsTable'
import UserProfile from './pages/UserProfile'
import EditProfile from './pages/EditProfile'
import { getRoleTiles } from './utils/tilePermissions'
import { fetchUserRole } from './utils/userHelpers'

const App = () => {
    const { loadingSession, user, role } = UserAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [userRole, setUserRole] = useState(null) // from role-based-dash

    // Redirect to login if user logs out
    useEffect(() => {
        const publicRoutes = ['/login', '/password-recovery', '/set-password']
        if (
            !loadingSession &&
            !user &&
            !publicRoutes.includes(location.pathname)
        ) {
            navigate('/login')
        }
    }, [user, loadingSession, navigate, location.pathname])

    // Fetch user role from Supabase when user changes (role-based-dash)
    useEffect(() => {
        async function getRole() {
            if (!user?.id) {
                setUserRole(null)
                return
            }

            try {
                const role = await fetchUserRole(user.id)
                if (role) {
                    setUserRole(role)
                } else {
                    // No role found → log out user
                    setUserRole(null)
                    navigate('/login', { replace: true })
                }
            } catch (err) {
                console.error('Failed to fetch role:', err)
                setUserRole(null)
                navigate('/login', { replace: true })
            }
        }

        getRole()
    }, [user, navigate])

    // Compute permissions for current path
    var grantedPermission = usePermission(role, location.pathname)

    //map to redirect unauthorized access to pages
    const redirectRoutes = {
        admin: '/admin/dashboard',
        dispatch: '/dispatch/dashboard',
        display: '/fsb',
    }
    // Redirect to FSboard if logged-in user has no permission
    // FIX: wait for the user's role to load before checking permissions and redirecting.
    // This prevents jumping to /fsb before the app knows the correct dashboard to show.
    useEffect(() => {
        // Wait until userRole is fetched
        if (
            !loadingSession &&
            user &&
            userRole !== null &&
            !grantedPermission
        ) {
            // redirect based on user - fall back on login
            const path = redirectRoutes[userRole] || '/login'
            navigate(path, { replace: true })
        }
    }, [
        loadingSession,
        user,
        userRole,
        grantedPermission,
        navigate,
        redirectRoutes,
    ])

    useEffect(() => {
        if (!loadingSession && user && userRole) {
            const currentPath = location.pathname
            if (currentPath === '/login' || currentPath === '/') {
                if (userRole === 'admin') {
                    navigate('/admin/dashboard', { replace: true })
                } else if (userRole === 'dispatch') {
                    navigate('/dispatch/dashboard', { replace: true })
                } else {
                    navigate('/fsb', { replace: true })
                }
            }
        }
    }, [
        loadingSession,
        user,
        userRole,
        location.pathname,
        navigate,
        redirectRoutes,
    ])

    console.log({ user, userRole, loadingSession })
    // Block render until session or role fetch is complete
    if (loadingSession || (user && userRole === null)) {
        return <LoadingSpinner />
    }

    const allowedTiles = getRoleTiles(userRole || 'none')

    return (
        <div className='flex flex-col min-h-screen'>
            <div className='w-full h-fit'>
                <OptionBar />
            </div>
            <div className='flex-grow w-full'>
                <Routes>
                    <Route
                        path='/'
                        element={<Navigate to='/login' replace />}
                    />
                    <Route path='/login' element={<Login />} />
                    <Route
                        path='/password-recovery'
                        element={<PasswordRecovery />}
                    />
                    <Route path='/manage-jobs' element={<ManageJobs />} />
                    <Route path='/fsb' element={<FSboard />} />
                    <Route path='/addjob' element={<AddJob />} />
                    <Route path='/manageusers' element={<ManageUsers />} />
                    <Route path='/editjob' element={<EditJob />} />
                    <Route path='/add-user' element={<AddUser />} />
                    <Route path='/set-password' element={<SetPassword />} />
                    <Route path='/history' element={<ViewHistory />} />
                    <Route path='/edituser' element={<EditUser />} />
                    <Route path='/userprofile' element={<UserProfile />} />
                    <Route path='/editprofile' element={<EditProfile />} />

                    {/* Role-based dashboard routing (preferred from role-based-dash) */}

                    <Route
                        path='/admin/dashboard'
                        element={<Dashboard allowedTiles={allowedTiles} />}
                    />
                    <Route
                        path='/dispatch/dashboard'
                        element={
                            <DashboardDispatch allowedTiles={allowedTiles} />
                        }
                    />
                    <Route
                        path='/display/dashboard'
                        element={
                            <DashboardDisplay allowedTiles={allowedTiles} />
                        }
                    />
                </Routes>
            </div>
        </div>
    )
}

export default App
