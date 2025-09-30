import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import OptionBar from './components/OptionBar'
import Dashboard from './pages/Dashboard'
import DashboardDispatch from './pages/DashboardDispatch'
import DashboardDisplay from './pages/DashboardDisplay'
import ViewBoard from './pages/ViewBoard'
import PasswordRecovery from './pages/PasswordRecovery'
import Login from './pages/Login'
import './App.css'
import AddJob from './pages/AddJob'
import FSboard from './pages/FSboard'
import UsersAndRoles from './pages/UsersAndRoles'
import EditJob from './pages/EditJob'
import ViewHistory from './components/ViewHistory'
import AddUser from './pages/AddUser'
import SetPassword from './pages/SetPassword'
import EditUser from './pages/EditUser'
import LoadingSpinner from './components/LoadingSpinner'
import { UserAuth } from './context/AuthContext'
import UserProfile from './pages/UserProfile'
import EditProfile from './pages/EditProfile'

import { getRoleTiles } from './utils/tilePermissions';
import { fetchUserRole } from './utils/userHelpers';


const App = () => {
    const { loadingSession, user } = UserAuth()
    const navigate = useNavigate()
    const [userRole, setUserRole] = useState(null);

    // Redirect to login if user logs out
    useEffect(() => {
        const publicRoutes = ['/login', '/password-recovery', '/set-password'];


        if (!loadingSession 
            && !user
            && !publicRoutes.includes(window.location.pathname)
        ) {
            navigate('/login')
        }
    }, [user, loadingSession, navigate])

    // Log user and metadata when user changes
    useEffect(() => {
        if (user) {
            console.log("Supabase User object:", user)
            console.log("app_metadata:", user.app_metadata)
            console.log("user_metadata:", user.user_metadata)
        }
    }, [user])

    // Fetch user role from Supabase when user changes
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


    // Block rendering until AuthProvider finishes fetching session & role
    if (loadingSession) return <LoadingSpinner />

    // Fetch user role from Supabase
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
                    <Route path="/history" element={<ViewHistory />} />
                    <Route path="/edituser" element={<EditUser />} />

                    {/* Role-based dashboard routing */}
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

                    <Route path='/history' element={<ViewHistory />} />
                    <Route path='/edituser' element={<EditUser />} />
                    <Route path='/userprofile' element={<UserProfile />} />
                    <Route path='/editprofile' element={<EditProfile />} />

                </Routes>
            </div>
        </div>
    )
}

export default App