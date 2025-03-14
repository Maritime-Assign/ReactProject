import './App.css'
import Tile from './components/Tile'
import Header from './components/Header'
import Filter from './components/Filter'

function App() {
    return (
        <>
            <div className='flex flex-col items-center'>
                <Header />
                <div className='w-full pt-4'>
                    <div className='flex justify-center py-4 bg-neutral-300 rounded-md w-full'>
                        <span className='text-2xl font-semibold'>
                            Open Board 2025
                        </span>
                    </div>
                </div>
                <Filter />
                <div className='w-full'>
                    <div className='grid md:grid-cols-2 grid-cols-1 justify-start place-items-center gap-4'>
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                        <Tile />
                    </div>
                </div>
            </div>
        </>
    )
}

export default App
