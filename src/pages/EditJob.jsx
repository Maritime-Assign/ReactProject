import { useLocation, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import supabase from '../supabaseClient'

const EditJob = () => {
    const location = useLocation();
    const { jobData } = location.state || {};  // Access the job data

    //component state
    const [formData, setFormData] = useState({
        shipName: jobData?.shipName || '',
        branch1: jobData?.branch1 || '',
        branch2: jobData?.branch2 || '',
        notes: jobData?.notes || '',
        location: jobData?.location || '',
        days: jobData?.days || '',
        dateCalled: jobData?.dateCalled || '',
        joinDate: jobData?.joinDate || '',
        company: jobData?.company || '',
        billet: jobData?.billet || '',
        type: jobData?.type || '',
        crewRelieved: jobData?.crewRelieved || '',
        open: jobData?.open ?? true,
    });

    const [status, setStatus] = useState(formData.open)
    const [message, setMessage] = useState('');
    const [window, setWindow] = useState(false);

    // make sure the status matches incoming prop
    useEffect(() => {
        setStatus(formData.open)
    }, [formData.open]);
    // status color green if state is true, red if false (open vs filled)
    const statusColor = status ? 'bg-green-600' : 'bg-red-600';

    const save = async () => {
        try {
            const { data, error } = await supabase
                .from('Jobs')
                .update({
                    shipName: formData.shipName,
                    branch1: formData.branch1,
                    branch2: formData.branch2,
                    notes: formData.notes,
                    location: formData.location,
                    days: formData.days,
                    dateCalled: formData.dateCalled,
                    joinDate: formData.joinDate,
                    company: formData.company,
                    billet: formData.billet,
                    type: formData.type,
                    crewRelieved: formData.crewRelieved,
                    open: status,
                })
                .eq('id', jobData.id) // target the correct job row
                .select();

            if (error) {
                console.error('Error updating job:', error);
                setMessage(`Failed to save: ${error.message}`);
            } else {
                console.log('Job updated successfully:', data);
                setMessage('Job saved successfully!');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setMessage('Unexpected error saving job.');
        } finally {
            setWindow(true);
        }
    };

    const closeWindow = () => {
        setWindow(false);
    }

    return (
        <div className='flex flex-col bg-mebablue-hover max-w-[1280px] mx-auto h-fit rounded-md mt-4'>
            <div className='flex justify-center py-4 bg-mebablue-dark rounded-t-md w-full shadow-xl'>
                <span className='text-white text-2xl font-semibold'>
                    Edit Job
                </span>
            </div>
            {/* Tile Content container*/}
            <div className='flex flex-col w-full h-full px-2 mx-auto'>
                {/* Row 1: Ship Name, Branches, Status 3 Col Grid*/}
                <div className='grid grid-cols-3 gap-2 py-2 font-semibold text-white'>
                    <input
                        type="text"
                        value={formData.shipName}
                        onChange={(e) => setFormData({ ...formData, shipName: e.target.value })}
                        className='bg-mebablue-light px-2 py-1 rounded-md text-center'
                    />
                    <input
                        type="text"
                        value={formData.branch1}
                        onChange={(e) => setFormData({ ...formData, branch1: e.target.value })}
                        className="bg-mebablue-light px-2 py-1 rounded-md text-center"
                    />

                    <input
                        type="text"
                        value={formData.branch2}
                        onChange={(e) => setFormData({ ...formData, branch2: e.target.value })}
                        className="bg-mebablue-light px-2 py-1 rounded-md text-center"
                    />
                    {/* if job is open render box green and display 'Open' if filled render red and display 'Filled + date' */}
                    <select
                        value={status ? 'Open' : 'Filled'}
                        onChange={(e) => {
                            const isOpen = e.target.value === 'Open';
                            setStatus(isOpen);
                        }}
                        className={`${statusColor} px-2 py-1 rounded-md text-white text-center`}
                    >
                        <option value="Open">Open</option>
                        <option value="Filled">Filled</option>
                    </select>
                </div>
                {/* Row 2: Notes */}
                <div className='bg-mebablue-light rounded-md py-2 px-4 text-sm font-medium flex-col flex text-white items-center w-full mx-auto'>
                    <span className='font-semibold'>Requirements/Notes:</span>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="bg-mebablue-light py-1 rounded-md text-white outline-none w-full mx-auto"
                    />
                </div>
                {/* Row 3: Details 4 col Grid */}
                <div className='grid grid-cols-4 gap-2 font-medium text-sm py-2 w-full mx-auto'>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        value={formData.days}
                        onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        value={formData.dateCalled}
                        onChange={(e) => setFormData({ ...formData, dateCalled: e.target.value })}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        value={formData.joinDate}
                        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        value={formData.billet}
                        onChange={(e) => setFormData({ ...formData, billet: e.target.value })}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                    <input
                        type="text"
                        value={formData.crewRelieved}
                        onChange={(e) => setFormData({ ...formData, crewRelieved: e.target.value })}
                        className='bg-mebablue-light px-3 py-1 rounded-md font-semibold text-white col-span-2'
                    />
                </div>
            </div>

            {/* Exit and Save Button, Exit redirect to Job board, Save result in a status message */}
            <div className="flex justify-center gap-4 p-4">
                <Link to='/board'>
                    {/* Exit button is linked directly to the job board */}
                    <button className='bg-red-500 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 hover:bg-red-600'>
                        Exit
                    </button>
                </Link>
                {/* Save button will pop up a status message window, current message is a placeholder */}
                <button
                    className='bg-green-500 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 hover:bg-green-600'
                    onClick={save}
                >
                    Save
                </button>
            </div>

            {/* Message Popup */}
            {window && (
                <div className='fixed inset-0 flex items-center justify-center'>
                    <div className='bg-gray-300 p-6 rounded-md shadow-lg max-w-sm w-full border border-black-300'>
                        <h2 className='text-xl font-semibold'>{message}</h2>
                        <div className="mt-7 flex justify-center w-full">
                            <button
                                onClick={closeWindow}
                                className='bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditJob;