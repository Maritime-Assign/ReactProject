import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import OptionBar from './components/OptionBar'
import Dashboard from './pages/Dashboard'
import DashboardManager from './pages/DashboardManager'
import DashboardUser from './pages/DashboardUser'
import DashboardViewer from './pages/DashboardViewer'
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

const App = () => {
    const { loadingSession, user } = UserAuth()
    const navigate = useNavigate()

    // Redirect to login if user logs out
    useEffect(() => {
        if (!loadingSession && !user) {
            navigate('/login')
        }
    }, [user, loadingSession, navigate])

    // Block rendering until AuthProvider finishes fetching session & role
    if (loadingSession) return <LoadingSpinner />

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
                    <Route path='/dashboard' element={<Dashboard />} />
                    <Route path='/dashboardManager' element={<DashboardManager />} />
                    <Route path='/dashboardViewer' element={<DashboardViewer />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/recovery' element={<PasswordRecovery />} />
                    <Route path='/board' element={<ViewBoard />} />
                    <Route path='/fsb' element={<FSboard />} />
                    <Route path='/addjob' element={<AddJob />} />
                    <Route path='/users-roles' element={<UsersAndRoles />} />
                    <Route path='/editjob' element={<EditJob />} />
                    <Route path='/add-user' element={<AddUser />} />
                    <Route path='/set-password' element={<SetPassword />} />
                    <Route
                        path='/dashboard/manager'
                        element={<DashboardManager />}
                    />
                    <Route path='/dashboard/user' element={<DashboardUser />} />
                    <Route
                        path='/dashboard/viewer'
                        element={<DashboardViewer />}
                    />
                    <Route path='/history' element={<ViewHistory />} />
                    <Route path='/edituser' element={<EditUser />} />
                </Routes>
            </div>
        </div>
    )
}

export default App
