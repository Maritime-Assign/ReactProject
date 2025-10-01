// tile component which takes in props as parameter (data)

import React, { useState, useEffect } from 'react'

import supabase from '../supabaseClient'

const Tile = ({ job, onJobUpdate }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ ...job })
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})
    const [error, setError] = useState(null)

    useEffect(() => {
        setFormData({ ...job })
    }, [job])

    const statusColor = formData.open ? 'bg-green-600' : 'bg-red-600'

    const boxStyle = () =>
        'bg-mebablue-light px-3 py-1 rounded-md font-medium text-white font-mont'

    const validateForm = () => {
        let newErrors = {};

        //Ship name required and cannot exceed 50 characters
        if (!formData.shipName.trim()) {
            newErrors.shipName = "Ship name is required.";
        } else if (formData.shipName.length > 50) {
            newErrors.shipName = "Ship name cannot exceed 50 characters.";
        }

        // Location required and can't exceed 50 chars

        if (!formData.location) {
            newErrors.location = "Location is required.";
        } else if (formData.location && formData.location.length > 50) {
            newErrors.location = "Location cannot exceed 50 characters.";
        }

        // Days required and must be non-negative & numeric 

        if (formData.days === "" || formData.days === null || formData.days === undefined) {
            newErrors.days = "Number of days required.";
        } else if (formData.days && isNaN(formData.days)) {
            newErrors.days = "Please enter a number";
        } else if (formData.days < 0) {
            newErrors.days = "No negative input allowed";
        }

        // dateCalled and joinDate required

        if (!formData.dateCalled) {
            newErrors.dateCalled = "Date called is required.";
        }

        if (!formData.joinDate) {
            newErrors.joinDate = "Join Date is required";
        }

        // Company required and cannot exceed 50 chars
        if (!formData.company) {
            newErrors.company = "Company is required";

        } else if (formData.company && formData.company.length > 50) {
            newErrors.company = "Company cannot exceed 50 characters.";
        }

        //Crew relieved cannot exceed 100 chars
        if (formData.crewRelieved && formData.crewRelieved.length > 100) {
            newErrors.crewRelieved = "Crew Relieved cannot exceed 100 characters.";
        }

        // Billet is required
        if (!formData.billet) {
            newErrors.billet = "Please select a billet";
        }

        //Type required 
        if (!formData.type) {
            newErrors.type = "Please select type.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;

    }


    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {

        // prevents save if errors exist
        if (!validateForm()) return;

        setSaving(true)
        setError(null)

        try {
            const { data, error } = await supabase
                .from('Jobs')
                .update(formData)
                .eq('id', job.id)
                .select()

            if (error) throw error

            if (data && data.length > 0) {
                onJobUpdate(data[0])
                setIsEditing(false)
            }
        } catch (err) {
            console.error('Error saving job:', err.message)
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }



    /*     const navigate = useNavigate()
    
        const handleEdit = () => {
            navigate('/editjob', {
                state: { jobData: props }, // Pass the specific job data
            })
        } */


    return (
        <div className="flex flex-col bg-mebablue-hover w-full h-full rounded-md">
            {/* top bar */}
            <div className="bg-mebablue-dark w-full h-8 flex rounded-t-md justify-end gap-2 px-2">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-green-500 rounded-md text-sm my-auto px-2 text-white font-medium hover:bg-green-600 font-mont"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-400 rounded-md text-sm my-auto px-2 text-white font-medium hover:bg-gray-500 font-mont"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-mebablue-light rounded-md text-sm my-auto px-2 text-white font-medium hover:bg-mebablue-hover font-mont"
                    >
                        Edit
                    </button>
                )}
            </div>

            {/* content */}
            <div className="flex flex-col w-full h-full px-2 justify-center">
                {/* Row 1 */}
                <div className="grid grid-cols-4 gap-2 py-2 font-medium text-white font-mont">
                    {isEditing ? (
                        <>
                            <input
                                name="shipName"
                                value={formData.shipName}
                                maxLength={50}
                                onChange={handleChange}
                                className="bg-mebablue-light px-2 py-1 rounded-md text-center"
                            />
                            {errors.shipName && (
                                <span className="text-red-400 text-xs">{errors.shipName}</span>
                            )}

                            <select
                                name="branch1"
                                value={formData.branch1}
                                onChange={handleChange}
                                className="bg-mebablue-light px-2 py-1 rounded-md text-center"
                            >
                                <option value="LA">LA</option>
                                <option value="OAK">OAK</option>
                                <option value="DEN">DEN</option>
                                <option value="JAX">JAX</option>
                                <option value="TAMP">TAMP</option>
                                <option value="HNL">HNL</option>
                                <option value="NO">NO</option>
                                <option value="BLT">BLT</option>
                                <option value="BOS">BOS</option>
                                <option value="NY/NJ">NY/NJ</option>
                                <option value="CLV">CLV</option>
                                <option value="CHAR">CHAR</option>
                                <option value="HOU">HOU</option>
                                <option value="NOR">NOR</option>
                                <option value="DC">DC</option>
                                <option value="SEA">SEA</option>

                            </select>
                            <select
                                name="branch2"
                                value={formData.branch2}
                                onChange={handleChange}
                                className="bg-mebablue-light px-2 py-1 rounded-md text-center"
                            >
                                <option value="LA">LA</option>
                                <option value="OAK">OAK</option>
                                <option value="DEN">DEN</option>
                                <option value="JAX">JAX</option>
                                <option value="TAMP">TAMP</option>
                                <option value="HNL">HNL</option>
                                <option value="NO">NO</option>
                                <option value="BLT">BLT</option>
                                <option value="BOS">BOS</option>
                                <option value="NY/NJ">NY/NJ</option>
                                <option value="CLV">CLV</option>
                                <option value="CHAR">CHAR</option>
                                <option value="HOU">HOU</option>
                                <option value="NOR">NOR</option>
                                <option value="DC">DC</option>
                                <option value="SEA">SEA</option>

                            </select>

                            <select
                                name="open"
                                value={formData.open ? "Open" : "Filled"}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        open: e.target.value === "Open",
                                    }))
                                }
                                className={`${formData.open ? "bg-green-600" : "bg-red-600"} px-2 py-1 rounded-md text-white text-center`}
                            >
                                <option value="Open">Open</option>
                                <option value="Filled">Filled</option>
                            </select>

                        </>
                    ) : (
                        <>
                            <span className="bg-mebablue-light rounded-md px-2 py-1 text-center">
                                {job.shipName}
                            </span>
                            <span className="bg-mebablue-light px-2 py-1 rounded-md text-center">
                                {job.branch1}
                            </span>
                            <span className="bg-mebablue-light px-2 py-1 rounded-md text-center">
                                {job.branch2}
                            </span>
                            <span
                                className={`${statusColor} px-2 py-1 rounded-md text-white text-center`}
                            >
                                {job.open ? 'Open' : `Filled ${job.fillDate || ''}`}
                            </span>
                        </>
                    )}
                </div>

                {/* Row 2: Notes */}
                <div className="bg-mebablue-light rounded-md py-2 px-4 text-sm font-medium flex-col flex text-white">
                    <span className="font-medium font-mont">Requirements/Notes:</span>
                    {isEditing ? (
                        <textarea
                            name="notes"
                            value={formData.notes}
                            maxLength={250}
                            onChange={handleChange}
                            rows={2}
                            className="bg-mebablue-light py-1 rounded-md text-white outline-none w-full"
                        />
                    ) : (
                        <span className="font-mont">- {job.notes}</span>
                    )}
                </div>

                {/* Row 3: Details */}
                <div className="grid grid-cols-4 gap-2 font-medium text-sm py-2">
                    <div className={`${boxStyle()} col-span-2`}>
                        Location:{' '}
                        {isEditing ? (
                            <>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    maxLength={50}
                                    className="bg-mebablue-light px-2 py-1 rounded-md text-white w-full"
                                />
                                {errors.location && (
                                    <span className="text-red-400 text-xs">{errors.location}</span>
                                )}
                            </>
                        ) : (
                            job.location
                        )}
                    </div>
                    <div className={`${boxStyle()} col-span-2`}>
                        Days:{' '}
                        {isEditing ? (
                            <>
                                <input
                                    type="number"
                                    name="days"
                                    value={formData.days}
                                    onChange={handleChange}
                                    min={0}
                                    className="bg-mebablue-light px-2 py-1 rounded-md text-white w-full"
                                />
                                {errors.days && (
                                    <span className="text-red-400 text-xs">{errors.days}</span>
                                )}
                            </>
                        ) : (
                            job.days
                        )}
                    </div>

                    <div className={`${boxStyle()} col-span-2`}>
                        Date Called:{' '}
                        {isEditing ? (
                            <>
                                <input
                                    type="date"
                                    name="dateCalled"
                                    value={formData.dateCalled}
                                    onChange={handleChange}
                                    className="bg-mebablue-light px-2 py-1 rounded-md text-white w-full"
                                />
                                {errors.dateCalled && (
                                    <span className="text-red-400 text-xs">{errors.dateCalled}</span>
                                )}
                            </>
                        ) : (
                            job.dateCalled
                        )}
                    </div>

                    <div className={`${boxStyle()} col-span-2`}>
                        Join Date:{' '}
                        {isEditing ? (
                            <>
                                <input
                                    type="date"
                                    name="joinDate"
                                    value={formData.joinDate}
                                    onChange={handleChange}
                                    className="bg-mebablue-light px-2 py-1 rounded-md text-white w-full"
                                />
                                {errors.joinDate && (
                                    <span className="text-red-400 text-xs">{errors.joinDate}</span>
                                )}
                            </>
                        ) : (
                            job.joinDate
                        )}
                    </div>

                    <div className={`${boxStyle()} col-span-2`}>
                        Company:{' '}
                        {isEditing ? (
                            <>
                                <input
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    maxLength={50}
                                    className="bg-mebablue-light px-2 py-1 rounded-md text-white w-full"
                                />
                                {errors.company && (
                                    <span className="text-red-400 text-xs">{errors.company}</span>
                                )}
                            </>
                        ) : (
                            job.company
                        )}
                    </div>

                    <div className={`${boxStyle()} col-span-1`}>
                        Billet:{''}
                        {isEditing ? (
                            <select
                                name="billet"
                                value={formData.billet}
                                onChange={handleChange}
                                className="bg-mebablue-light px-2 py-1 rounded-md text-white w-full"
                            >
                                <option value="1A/E">1A/E</option>
                                <option value="2A/E">2A/E</option>
                                <option value="3M">3M</option>
                                <option value="CM">CM</option>
                                <option value="Relief">Relief</option>

                            </select>
                        ) : (
                            job.billet
                        )}
                    </div>
                    <div className={`${boxStyle()} col-span-1`}>
                        Type:{''}
                        {isEditing ? (
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="bg-mebablue-light px-2 py-1 rounded-md text-white w-full"
                            >
                                <option value="Permanent">Permanent</option>
                                <option value="Relief">Relief</option>
                                <option value="Temp">Temp</option>

                            </select>
                        ) : (
                            job.type
                        )}
                    </div>
                    <div className={`${boxStyle()} col-span-4`}>
                        Crew Relieved:{' '}
                        {isEditing ? (
                            <input
                                name="crewRelieved"
                                value={formData.crewRelieved}
                                onChange={handleChange}
                                maxLength={100}
                                className="bg-mebablue-light px-2 py-1 rounded-md text-white w-full"
                            />
                        ) : (
                            job.crewRelieved
                        )}
                    </div>
                </div>
            </div>

            {
                error && (
                    <div className="text-red-500 text-sm px-2 pb-2">Error: {error}</div>
                )
            }
        </div >
    )
}

export default Tile
