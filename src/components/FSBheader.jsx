const FSBheader = () => {
    const cellStyle = 'py-1 font-mont'

    return (
        <div className='grid grid-cols-20 w-full text-center font-bold text-mebablue-dark text-sm mb-1'>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Status</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Region</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Hall</span>
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
            <div className={`col-span-3 ${cellStyle}`}>
                <span>Notes</span>
            </div>
        </div>
    )
}

export default FSBheader
