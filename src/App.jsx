import {
    Routes,
    Route,
    Navigate,
    useNavigate,
    useLocation,
} from 'react-router-dom'
import { useEffect, useState } from 'react'  // Need useState from role-based-dash

// ... all your imports here (OptionBar, Dashboard, etc.)

const App = () => {
    const { loadingSession, user, role } = UserAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [userRole, setUserRole] = useState(null);  // from role-based-dash

    // Redirect to login if user logs out
    useEffect(() => {
        const publicRoutes = ['/login', '/password-recovery', '/set-password'];
        if (!loadingSession && !user && !publicRoutes.includes(window.location.pathname)) {
            navigate('/login')
        }
    }, [user, loadingSession, navigate])

    // Log user and metadata when user changes (role-based-dash)
    useEffect(() => {
        if (user) {
            console.log("Supabase User object:", user)
            console.log("app_metadata:", user.app_metadata)
            console.log("user_metadata:", user.user_metadata)
        }
    }, [user])

    // Fetch user role from Supabase when user changes (role-based-dash)
    useEffect(() => {
        async function getRole() {
            if (user && user.id) {
                const role = await fetchUserRole(user.id)
                console.log('Fetched user role:', role)
                setUserRole(role)
            } else {
                setUserRole(null)
            }
        }
        getRole()
    }, [user])

    // Check permission and redirect if no access (main)
    const grantedPermission = usePermission(role, location.pathname)
    useEffect(() => {
        if (!loadingSession && !grantedPermission && user) {
            navigate('/fsb')
        }
    }, [grantedPermission, loadingSession, user, navigate])

    // Block rendering until AuthProvider finishes fetching session & role
    if (loadingSession) return <LoadingSpinner />

    // Fetch allowed tiles based on userRole (role-based-dash)
    const allowedTiles = getRoleTiles(userRole || 'none');
    console.log("userRole:", userRole);
    console.log("allowedTiles:", allowedTiles);

    return (
        <div className='flex flex-col min-h-screen'>
            <div className='w-full h-fit'>
                <OptionBar />
            </div>
            <div className='flex-grow w-full'>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/recovery" element={<PasswordRecovery />} />
                    <Route path="/board" element={<ViewBoard />} />
                    <Route path="/fsb" element={<FSboard />} />
                    <Route path="/addjob" element={<AddJob />} />
                    <Route path="/users-roles" element={<UsersAndRoles />} />
                    <Route path="/editjob" element={<EditJob />} />
                    <Route path="/add-user" element={<AddUser />} />
                    <Route path="/set-password" element={<SetPassword />} />
                    <Route path="/password-recovery" element={<PasswordRecovery />} />
                    <Route path="/history" element={<ViewHistory />} />
                    <Route path="/edituser" element={<EditUser />} />
                    <Route path="/userprofile" element={<UserProfile />} />
                    <Route path="/editprofile" element={<EditProfile />} />

                    {/* Role-based dashboard routing (preferred from role-based-dash) */}
                    <Route
                        path="/dashboard"
                        element={
                            userRole === 'admin' ? (
                                <Dashboard allowedTiles={allowedTiles} />
                            ) : userRole === 'minor' ? (
                                <DashboardDispatch allowedTiles={allowedTiles} />
                            ) : (
                                <DashboardDisplay allowedTiles={allowedTiles} />
                            )
                        }
                    />
                    <Route
                        path="/dashboard/dispatch"
                        element={<DashboardDispatch allowedTiles={allowedTiles} />}
                    />
                    <Route
                        path="/dashboard/display"
                        element={<DashboardDisplay allowedTiles={allowedTiles} />}
                    />
                </Routes>
            </div>
        </div>
    )
}

export default App
