import { Routes, Route, Link } from 'react-router-dom';
import OptionBar from './components/OptionBar';
import Dashboard from './pages/Dashboard';
import ViewBoard from './pages/ViewBoard';
import PasswordRecovery from './pages/PasswordRecovery';
import Login from './pages/Login';
import History from './pages/history';  // This import is correct if filename is History.jsx
import './App.css';

const App = () => {
    return (
        <div className='flex flex-col h-screen'>
            <OptionBar />
            <div className='w-full flex flex-col items-center justify-center'>
                <span className='text-xl p-4'>Developer Navigation</span>
                {/* Developer Nav Bar */}
                <nav className='flex space-x-4 text-white text-lg font-medium'>
                    <Link to='/dashboard'>
                        <button className='p-4 bg-mebablue-dark rounded'>
                            Dashboard
                        </button>
                    </Link>
                    <Link to='/login'>
                        <button className='p-4 bg-mebablue-dark rounded'>
                            Login
                        </button>
                    </Link>
                    <Link to='/board'>
                        <button className='p-4 bg-mebablue-dark rounded'>
                            Job Board
                        </button>
                    </Link>
                    <Link to='/history'>  {/* Changed to lowercase for consistency */}
                        <button className='p-4 bg-mebablue-dark rounded'>
                            Edit History
                        </button>
                    </Link>
                </nav>
            </div>

            <Routes>
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/login' element={<Login />} />
                <Route path='/recovery' element={<PasswordRecovery />} />
                <Route path='/board' element={<ViewBoard />} />
                <Route path='/history' element={<History />} />  {/* Changed to lowercase */}
            </Routes>
        </div>
    );
};

export default App;