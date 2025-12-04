import { FaUser } from 'react-icons/fa6'
import { ChevronUp, ChevronDown } from 'lucide-react'

const FSBheader = ({ sortConfig, onSort }) => {
    const cellStyle = 'py-1 font-mont justify-center flex items-center'

    // Helper to render sortable column
    const SortableColumn = ({ columnKey, children, className = '' }) => {
        const isActive = sortConfig?.key === columnKey
        const isAsc = sortConfig?.direction === 'asc'

        return (
            <div
                className={`${className} ${cellStyle} cursor-pointer hover:bg-slate-100 transition-colors`}
                onClick={() => onSort(columnKey)}
            >
                <span className='flex items-center gap-1'>
                    {children}
                    {isActive &&
                        (isAsc ? (
                            <ChevronUp size={14} />
                        ) : (
                            <ChevronDown size={14} />
                        ))}
                </span>
            </div>
        )
    }

    return (
        <div className='grid grid-cols-27 w-full text-center font-bold text-mebablue-dark text-[8px] md:text-sm border-b border-mebagold'>
            <div className={`col-span-1 ${cellStyle}`}>
                <span>Status</span>
            </div>
            <div className={`col-span-1 ${cellStyle}`}>
                <FaUser className='w-2 h-2 lg:w-4 lg:h-4' />
            </div>
            {/* Sortable columns */}
            <SortableColumn columnKey='region' className='col-span-1'>
                Region
            </SortableColumn>

            <SortableColumn columnKey='hall' className='col-span-1'>
                Hall
            </SortableColumn>

            <SortableColumn columnKey='dateCalled' className='col-span-2'>
                <span className='block lg:hidden'>Called</span>
                <span className='hidden lg:block'>Date Called</span>
            </SortableColumn>

            <SortableColumn columnKey='shipName' className='col-span-3'>
                Vessel
            </SortableColumn>

            <SortableColumn columnKey='joinDate' className='col-span-2'>
                Join Date
            </SortableColumn>

            <SortableColumn columnKey='billet' className='col-span-1'>
                Billet
            </SortableColumn>

            <SortableColumn columnKey='type' className='col-span-2'>
                Type
            </SortableColumn>

            <SortableColumn columnKey='days' className='col-span-1'>
                Days
            </SortableColumn>

            <SortableColumn columnKey='location' className='col-span-3'>
                Location
            </SortableColumn>

            <SortableColumn columnKey='company' className='col-span-2'>
                Company
            </SortableColumn>
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
