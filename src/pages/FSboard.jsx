const FSboard = () => {
    return (
        <div className='w-full h-screen flex flex-col'>
            <div className='grid grid-cols-20 pt-1'>
                <div className='grid grid-cols-20 w-full col-span-20 bg-gradient-to-b from-mebablue-dark to-mebablue-light text-center font-medium text-white rounded-t-md text-xs'>
                    <div className='col-span-1 border-r-1 py-2'>
                        <span>Status</span>
                    </div>
                    <div className='col-span-1 border-r-1 py-2'>
                        <span>Branch 1</span>
                    </div>
                    <div className='col-span-1 border-r-1 py-2'>
                        <span>Branch 2</span>
                    </div>

                    <div className='col-span-2 border-r-1 py-2'>
                        <span>Date Called</span>
                    </div>
                    <div className='col-span-2 border-r-1 py-2'>
                        <span>Ship Name</span>
                    </div>
                    <div className='col-span-2 border-r-1 py-2'>
                        <span>Join Date</span>
                    </div>
                    <div className='col-span-1 border-r-1 py-2'>
                        <span>Billet</span>
                    </div>
                    <div className='col-span-1 border-r-1 py-2'>
                        <span>Type</span>
                    </div>
                    <div className='col-span-1 border-r-1 py-2'>
                        <span>Days</span>
                    </div>
                    <div className='col-span-2 border-r-1 py-2'>
                        <span>Location</span>
                    </div>
                    <div className='col-span-1 border-r-1 py-2'>
                        <span>Company</span>
                    </div>
                    <div className='col-span-2 border-r-1 py-2'>
                        <span>Crew Relieved</span>
                    </div>
                    <div className='col-span-3 py-2'>
                        <span>Notes</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FSboard
