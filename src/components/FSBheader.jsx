const FSBheader = () => {
    const cellStyle =
        'py-2 bg-gradient-to-b from-mebablue-dark to-mebablue-light'

    return (
        <div className='grid grid-cols-20 gap-1 w-full text-center font-medium text-white rounded-t-md text-xs mb-1'>
            <div className='col-span-1 py-2 bg-gradient-to-b from-mebablue-dark to-mebablue-light rounded-tl-md'>
                <span>Status</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Branch 1</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Branch 2</span>
            </div>

            <div className={`col-span-2 ${cellStyle}`}>
                <span>Date Called</span>
            </div>
            <div className={`col-span-2 ${cellStyle}`}>
                <span>Ship Name</span>
            </div>
            <div className={`col-span-2 ${cellStyle}`}>
                <span>Join Date</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Billet</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Type</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Days</span>
            </div>
            <div className={`col-span-2 ${cellStyle}`}>
                <span>Location</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Company</span>
            </div>
            <div className={`col-span-2 ${cellStyle}`}>
                <span>Crew Relieved</span>
            </div>
            <div className={`col-span-3 rounded-tr-md ${cellStyle}`}>
                <span>Notes</span>
            </div>
        </div>
    )
}

export default FSBheader
