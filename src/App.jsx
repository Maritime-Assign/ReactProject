import { Routes, Route, Navigate } from 'react-router-dom'
import OptionBar from './components/OptionBar'
import Dashboard from './pages/Dashboard'
import ViewBoard from './pages/ViewBoard'
import PasswordRecovery from './pages/PasswordRecovery'
import Login from './pages/Login'
import './App.css'
import AddJob from './pages/AddJob'
import FSboard from './pages/FSboard'
import UsersAndRoles from './pages/UsersAndRoles'
import EditJob from './pages/EditJob'

const App = () => {
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
                    <Route path='/login' element={<Login />} />
                    <Route path='/recovery' element={<PasswordRecovery />} />
                    <Route path='/board' element={<ViewBoard />} />
                    <Route path='/fsb' element={<FSboard />} />
                    <Route path='/addjob' element={<AddJob />} />
                    <Route path='/users-roles' element={<UsersAndRoles />} />
                    <Route path='/editjob' element={<EditJob />} />
                </Routes>
            </div>
        </div>
    )
}

export default App
