import React from 'react'
import { useEffect, useState } from 'react'
import { UserAuth } from '../context/AuthContext.jsx'
import { supabase } from './supabaseClient.js'


const JobListing = ({ rowIndex, handleClaimJob, ...props }) => {
    const { user } = UserAuth();
    const [status, setStatus] = useState(props.open);
    const [makingClaim, setClaim] = useState(false);
    const [error, setError] = useState(null);

    // make sure the status matches incoming prop
    useEffect(() => {
        setStatus(props.open)
    }, [props.open])

    // Auto-clear error message after 3 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
            setError(null);
            //handleClaimJob();
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [error]);


    // Claim a job function
    const claimJob = async () => {

        // Debugging
        console.log('props.id:', props.id, 'type:', typeof props.id);

        setClaim(true);
        setError(null);

        // If claim is made when not logged in
        if (!user) {
            setError('You must be logged in to claim a job.');
            setClaim(false);
            return;
        }
        // Proceed to claim the job
        const { data, error: updateError } = await supabase
            .from('Jobs')
            .update({
            open: false,
            FillDate: new Date().toISOString().split('T')[0],
            // ID of user who claimed the job | this need to be added as a column in supabase
            claimedBy: user.id,
            //status: 'Filled',
            // timestamp of claim | this need to be added as a column in supabase
            claimed_at: new Date().toISOString(),
            
        })
        .eq('id', props.id)
        .eq('open', true) // Ensure the job is still open
        // Return the updated row
        .select();

        // Debugging
        console.log('Update response:', { data, updateError });
        
        // Debugging
        console.log('User:', user);
        if (updateError) {
            console.error('Claim failed:', updateError);
        }



        // Handle any errors during the claim process
        if (updateError) {
            setError('Failed to claim the job. Please try again.');
        }
        else {
            handleClaimJob();
        }
        setClaim(false);
    }

    const rowClass = rowIndex % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'

    const cellStyle = 'px-1 py-1 items-center justify-center flex'
    const statusColor = status == true ? 'bg-green-300' : 'bg-red-300'

    return (
        <div className='grid grid-cols-20 w-full text-sm font-mont font-semibold h-fit'>
            <div className={`col-span-1 ${cellStyle} ${rowClass}`}>
                {status ? (
                    <button
                    onClick={claimJob}
                    disabled={makingClaim}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
                    >
                    {makingClaim ? 'Claim' : 'Claim'}
                    </button>
                ) : (
                    <span className="text-red-700 text-sm text-center">
                    Claimed {props.FillDate ? `on ${props.FillDate}` : ''}
                    </span>
                )}
            </div>


            {/* Job Data Grid */}            
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}><span>{props.branch1}</span></div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}><span>{props.branch2}</span></div>
            <div className={`col-span-2  ${cellStyle} ${rowClass}`}><span>{props.dateCalled}</span></div>
            <div className={`col-span-2  ${cellStyle} ${rowClass}`}><span>{props.shipName}</span></div>
            <div className={`col-span-2  ${cellStyle} ${rowClass}`}><span>{props.joinDate}</span></div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}><span>{props.billet}</span></div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}><span>{props.type}</span></div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}><span>{props.days}</span></div>
            <div className={`col-span-2  ${cellStyle} ${rowClass}`}><span>{props.location}</span></div>
            <div className={`col-span-1  ${cellStyle} ${rowClass}`}><span>{props.company}</span></div>
            <div className={`col-span-2  ${cellStyle} ${rowClass}`}><span>{props.crewRelieved}</span></div>
            <div className={`col-span-3 text-left ${cellStyle} ${rowClass}`}><span>{props.notes}</span></div>
            
            
                            

            {/*Error display */}
            {error && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md w-80">
                    <div className="flex items-start justify-between">
                        <p className="text-sm">{error}</p>
                    </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default JobListing
