import { Routes, Route, Link } from 'react-router-dom'
import OptionBar from './components/OptionBar'
import Dashboard from './pages/Dashboard'
import ViewBoard from './pages/ViewBoard'
import PasswordRecovery from './pages/PasswordRecovery'
import Login from './pages/Login'
import './App.css'
import AddJob from './pages/AddJob'
import FSboard from './pages/FSboard'
import EditJob from './pages/EditJob'

const App = () => {
    return (
        <div className='flex flex-col min-h-screen'>
            <OptionBar />
            <div className='w-full flex flex-col items-center justify-center'>
                <span className='text-xl p-2'>Developer Navigation</span>
                {/* Developer Nav Bar */}
                <nav className='flex space-x-4 text-white text-lg font-medium'>
                    <Link to='/dashboard'>
                        <button className='px-4 py-1 bg-mebablue-dark rounded'>
                            Dashboard
                        </button>
                    </Link>
                    <Link to='/login'>
                        <button className='px-4 py-1 bg-mebablue-dark rounded'>
                            Login
                        </button>
                    </Link>
                    <Link to='/board'>
                        <button className='px-4 py-1 bg-mebablue-dark rounded'>
                            Job Board
                        </button>
                    </Link>
                    <Link to='/fsb'>
                        <button className='px-4 py-1 bg-mebablue-dark rounded'>
                            Full Screen Board
                        </button>
                    </Link>
                </nav>
            </div>

            <Routes>
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/login' element={<Login />} />
                <Route path='/recovery' element={<PasswordRecovery />} />
                <Route path='/board' element={<ViewBoard />} />
                <Route path='/fsb' element={<FSboard />} />
                <Route path='/addjob' element={<AddJob />} />
                <Route path='/editjob' element={<EditJob />} />
            </Routes>
        </div>
    )
}

export default App
