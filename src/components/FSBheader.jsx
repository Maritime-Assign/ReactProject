import { FaUser } from 'react-icons/fa6'

const FSBheader = () => {
    const cellStyle = 'py-1 font-mont justify-center flex items-center'

    return (
        <div className='grid grid-cols-27 w-full text-center font-bold text-mebablue-dark text-[8px] lg:text-sm border-b border-mebagold'>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Status</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <FaUser className='w-2 h-2 lg:w-4 lg:h-4' />
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Region</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Hall</span>
            </div>

            <div className={`col-span-2 ${cellStyle}`}>
                <span className='block lg:hidden'>Called</span>
                <span className='hidden lg:block'>Date Called</span>
            </div>
            <div className={`col-span-3 ${cellStyle}`}>
                <span>Vessel</span>
            </div>
            <div className={`col-span-2 ${cellStyle}`}>
                <span>Join Date</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Billet</span>
            </div>
            <div className={`col-span-2 ${cellStyle}`}>
                <span>Type</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Days</span>
            </div>
            <div className={`col-span-3 ${cellStyle}`}>
                <span>Location</span>
            </div>
            <div className={`col-span-2 ${cellStyle}`}>
                <span>Company</span>
            </div>
            <div className={`col-span-3 ${cellStyle}`}>
                <span>Crew Relieved</span>
            </div>
            <div className={`col-span-4 ${cellStyle}`}>
                <span>Notes</span>
            </div>
        </div>
    )
}

export default FSBheader
