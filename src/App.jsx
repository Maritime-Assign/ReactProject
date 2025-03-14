import './App.css'
import Tile from './components/Tile'
import Header from './components/Header'

function App() {
    return (
        <>
            <div className='flex flex-col items-center'>
                <Header />
                <div className='justify-center py-4'>
                    <span className='text-2xl font-semibold'>
                        Open Board 2025
                    </span>
                </div>
                <div className='w-full'>
                    <div className='grid md:grid-cols-2 grid-cols-1 justify-start place-items-center gap-4'>
                        <Tile
                            shipName='USNS Sisler'
                            branch1='OAK'
                            branch2='OAK'
                            status='Open'
                            open={true}
                            dateCalled='9/3/2024'
                            joinDate='10/28/202'
                            billet='1 A/E'
                            type='Perm'
                            days='90-120'
                            location='Saipan'
                            crewRelieved='Min Joo Jung'
                            notes='FOS. Universal EPA. CMEO. Heli FireFighting. Resume, Online Training Night Card'
                            company='PCS-MSC'
                        />
                        <Tile
                            shipName='USNS Watkins'
                            branch1='OAK'
                            branch2='OAK'
                            status='Filled LA 2/4'
                            open={false}
                            dateCalled='12/31/202'
                            joinDate='12/31/2024'
                            billet='1 A/E'
                            type='Perm'
                            days='30'
                            location='Saipan'
                            crewRelieved='Dilson Ramirez'
                            notes='FOS. Universal EPA. CMEO. Resume and online trainiing Night Card / Early Return'
                            company='PCS-MSC'
                        />
                        <Tile
                            shipName='OV Houston'
                            branch1='HOU'
                            branch2='TAMP'
                            status='Open'
                            open={true}
                            dateCalled='1/23/2025'
                            joinDate='2/5/2025'
                            billet='1 A/E'
                            type='Relief'
                            days='85'
                            location='Pt. Everglades'
                            crewRelieved='Chris Wagner'
                            notes='Tankerman, PIC or Tankerman Engineer, & Benzene, Night Card / Early Return'
                            company='OSG'
                        />
                        <Tile
                            shipName='Liberty Promise'
                            branch1='OAK'
                            branch2='SEA'
                            status='Filled CHS 2/6'
                            open={false}
                            dateCalled='2/6/2025'
                            joinDate='2/24/2025'
                            billet='3 M'
                            type='Relief'
                            days='30'
                            location='Tacoma, WA'
                            crewRelieved='Brian Walsh'
                            notes='Anderson Kelly'
                            company='Liberty'
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default App
