import { useState } from 'react'
import Tile from '../components/Tile'
import Filter from '../components/Filter'
import OptionBar from '../components/OptionBar'

function ViewBoard() {
    // Default view is set to tile
    const [view, setView] = useState('tile')

    return (
        <>
            <div className='flex flex-col items-center'>
                <div className='w-full pt-4'>
                    <div className='flex justify-center py-4 bg-mebablue-dark rounded-md w-full shadow-xl'>
                        <span className='text-white text-2xl font-semibold'>
                            Job Board
                        </span>
                    </div>
                </div>
                <Filter setView={setView} />
                <div className='w-full'>
                    {/* This logic switch between list and tile view depending on which button is pressed */}
                    {view == 'tile' ? (
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
                    ) : (
                        <div className='space-y-4'>
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
                    )}
                </div>
            </div>
        </>
    )
}

export default ViewBoard
