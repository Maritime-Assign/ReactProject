/**
 * Add Job Page with Form Validation and Error Handling
 * Form elements are imported using FormInput component given a different type of form element as type prop
 * Forms handled with Formik,Yup open source components installed in the project
 */

import styles from './AddJob.module.css'
import FormInput from '../components/FormInput'
import branchNames from '../data/branchNames'
import { useFormik } from 'formik'
import jobValidationSchema from '../data/jobValidationSchema'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack, IoSettingsSharp } from 'react-icons/io5'
import { UserAuth } from '../auth/AuthContext'
import { addJob } from '../utils/jobHistoryOptimized'
import React, { useState, useEffect, useActionState } from 'react'
import supabase from '../api/supabaseClient'

// Arrays for options for the various dropdowns
const statusOptions = ['Open', 'Filled', 'Filled by Company']
const billetOptions = ['1 A/E', '2M', '3M']
const typeOptions = ['Relief', 'Permanent']

const toDB = (date) => {
    if (!date) return null
    if (!(date instanceof Date)) return null
    return date.toISOString().split("T")[0]
}

// Submission function - this will be passed the user as a parameter
const createOnSubmit = (user, setPopup) => async (values, actions) => {
    console.log('🚀 FORM SUBMITTED')
    console.log('Submitting job with user:', user)
    console.log('Values received by Formik:', values)

    try {
        console.log('Submitting job with values:', values)

        if (!user || !user.id) {
            setPopup('error')
            return
        }

        const userId = user.id

        // Prepare job data - convert form values to match database schema
        // Explicitly define only the fields we want to send (excluding auto-generated fields)
        const jobData = {
            region: values.region || null,
            hall: values.hall || null,
            dateCalled: toDB(values.dateCalled),
            shipName: values.shipName || null,
            joinDate: toDB(values.joinDate),
            billet: values.billet || null,
            type: values.type || null,
            days: values.days || null,
            location: values.location || null,
            company: values.company || null,
            crewRelieved: values.crewRelieved || null,
            notes: values.notes || null,
            open: values.status || null,
            passThru: values.passThru || false,
            nightCardEarlyReturn: values.nightCardEarlyReturn || false,
            msc: values.msc || false,
        }

        // Debug: Log the exact data being sent
        console.log('Sending job data:', JSON.stringify(jobData, null, 2))

        // Add the job (history logging handled automatically by database triggers)
        const result = await addJob(jobData, userId)

        if (result.success) {
            setPopup('success')
            actions.resetForm()
        } else {
            setPopup('error')
        }
    } catch (error) {
        console.error('Error submitting job:', error)
        setPopup('error')
    }
}

// helper to fetch the single dropdown row (just once or when needed)
const fetchDropdownRow = async () => {
    const { data, error } = await supabase
        .from('job_dropdown_options')
        .select('*')
        .maybeSingle()

    if (error) {
        console.error('Fetch error:', error)
        return null
    }

    if (data) return data

    const { data: inserted, error: insErr } = await supabase
        .from('job_dropdown_options')
        .insert({ region: [], company: [], hall: [], billet: [], type: [] })
        .select()
        .single()

    if (insErr) {
        console.error('Seed insert error:', insErr)
        return null
    }
    return inserted
}

// ADD an option to a category
const handleAddOption = async (category, label) => {
    if (!label.trim()) return
    try {
        const data = await fetchDropdownRow()
        if (!data) return

        // checks for duplicate in the existing dropdown
        const current = Array.isArray(data[category]) ? data[category] : []
        const exists = current.some(
            (item) => item.label.toLowerCase() === label.trim().toLowerCase()
        )

        if (exists) {
            return
        }

        const newItem = {
            id: crypto.randomUUID(),
            label: label.trim(),
            is_active: true,
            sort_order: (data[category]?.length || 0) * 10 + 10,
            deleted_at: null,
        }

        const updatedArray = [...data[category], newItem]

        const { error } = await supabase
            .from('job_dropdown_options')
            .update({ [category]: updatedArray })
            .eq('id', data.id)

        if (error) throw error

        console.log(`✅ Added "${label}" to ${category}`)
    } catch (err) {
        console.error('Add option error:', err.message)
    }
}

// REMOVE an option from a category (by label)
const handleRemoveOption = async (category, label) => {
    if (!label.trim()) return
    try {
        const data = await fetchDropdownRow()
        if (!data) return

        const updatedArray = data[category].filter(
            (item) => item.label.toLowerCase() !== label.trim().toLowerCase()
        )

        const { error } = await supabase
            .from('job_dropdown_options')
            .update({ [category]: updatedArray })
            .eq('id', data.id)

        if (error) throw error

        console.log(`❌ Removed "${label}" from ${category}`)
    } catch (err) {
        console.error('Remove option error:', err.message)
    }
}

// Main AddJob Page component
const AddJob = () => {
    const navigate = useNavigate() // react router function to navigate back
    const { user } = UserAuth() // Get current user
    const [showModal, setShowModal] = useState(false) // set up the modal view as false by default

    const [popup, setPopup] = useState(null)

    useEffect(() => {
        if (popup && process.env.NODE_ENV !== 'test') {
            const timer = setTimeout(() => setPopup(null), 1500)
            return () => clearTimeout(timer)
        }
    }, [popup])

    // destructured formik initialization
    const {
        values,
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        status,
        submitCount,
        setFieldError,
    } = useFormik({
        initialValues: {
            status: '',
            region: '',
            hall: '',
            dateCalled: '',
            shipName: '',
            joinDate: '',
            billet: '',
            type: '',
            company: '',
            days: '',
            location: '',
            crewRelieved: '',
            notes: '',
            passThru: false,
            nightCardEarlyReturn: false,
            msc: false,
        },
        validationSchema: jobValidationSchema, // bring in Schema from jobValidationSchema.jsx in data dir
        onSubmit: createOnSubmit(user, setPopup),
        validateOnChange: false,
        validateOnBlur: false,
    })

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('Formik validation errors:', errors)
        }
    }, [errors])

    const [regionOptions, setRegionOptions] = useState([])
    const [regionLoading, setRegionLoading] = useState(true)
    const [hallOptions, setHallOptions] = useState([])
    const [hallLoading, setHallLoading] = useState(true)
    const [billetOptions, setBilletOptions] = useState([])
    const [billetLoading, setBilletLoading] = useState(true)
    const [typeOptions, setTypeOptions] = useState([])
    const [typeLoading, setTypeLoading] = useState(true)
    const [companyOptions, setCompanyOptions] = useState([])
    const [companyLoading, setCompanyLoading] = useState(true)

    function visible(items = []) {
        return items
            .filter((i) => i?.is_active && !i?.deleted_at)
            .sort(
                (a, b) =>
                    (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
                    String(a.label).localeCompare(String(b.label))
            )
            .map((i) => String(i.label))
    }

    async function loadRegionOptions() {
        try {
            const { data, error } = await supabase
                .from('job_dropdown_options')
                .select('region')
                .maybeSingle()

            if (error) {
                console.error('Load region options error:', error)
                setRegionOptions([])
            } else {
                const items = Array.isArray(data?.region) ? data.region : []
                setRegionOptions(visible(items))
            }
        } finally {
            setRegionLoading(false)
        }
    }

    async function loadHallOptions() {
        try {
            const { data, error } = await supabase
                .from('job_dropdown_options')
                .select('hall')
                .maybeSingle()

            if (error) {
                console.error('Load hall options error:', error)
                setHallOptions([])
            } else {
                const items = Array.isArray(data?.hall) ? data.hall : []
                setHallOptions(visible(items))
            }
        } finally {
            setHallLoading(false)
        }
    }

    async function loadBilletOptions() {
        try {
            const { data, error } = await supabase
                .from('job_dropdown_options')
                .select('billet')
                .maybeSingle()

            if (error) {
                console.error('Load billet options error:', error)
                setBilletOptions([])
            } else {
                const items = Array.isArray(data?.billet) ? data.billet : []
                setBilletOptions(visible(items))
            }
        } finally {
            setBilletLoading(false)
        }
    }

    async function loadTypeOptions() {
        try {
            const { data, error } = await supabase
                .from('job_dropdown_options')
                .select('type')
                .maybeSingle()

            if (error) {
                console.error('Load type options error:', error)
                setTypeOptions([])
            } else {
                const items = Array.isArray(data?.type) ? data.type : []
                setTypeOptions(visible(items))
            }
        } finally {
            setTypeLoading(false)
        }
    }

    async function loadCompanyOptions() {
        try {
            const { data, error } = await supabase
                .from('job_dropdown_options')
                .select('company')
                .maybeSingle()

            if (error) {
                console.error('Load company options error:', error)
                setCompanyOptions([])
            } else {
                const items = Array.isArray(data?.company) ? data.company : []
                setCompanyOptions(visible(items))
            }
        } finally {
            setCompanyLoading(false)
        }
    }

    useEffect(() => {
        loadRegionOptions()
        loadHallOptions()
        loadBilletOptions()
        loadTypeOptions()
        loadCompanyOptions()
    }, [])

    useEffect(() => {
        if (!showModal) {
            loadRegionOptions()
            loadHallOptions()
            loadBilletOptions()
            loadTypeOptions()
            loadCompanyOptions()
        }
    }, [showModal])

    // NEW: derive required fields from Yup schema
    const requiredFields = React.useMemo(() => {
        try {
            const desc = jobValidationSchema?.describe?.()
            const fields = desc?.fields ?? {}
            const names = new Set()
            Object.entries(fields).forEach(([key, def]) => {
                const tests = def?.tests ?? []
                if (tests.some((t) => t?.name === 'required')) names.add(key)
            })
            return names
        } catch {
            return new Set()
        }
    }, [])

    const isRequired = (name) => requiredFields.has(name)

    return (
        <div className='w-full pt-4 flex flex-col max-w-[1280px] mx-auto'>
            {/* Popup message */}
            {popup && (
                <div
                    className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-md text-white font-mont transition-all duration-700 ease-out ${
                        popup === 'success'
                            ? 'bg-green-600 opacity-100'
                            : 'bg-red-600 opacity-100'
                    }`}
                >
                    {popup === 'success'
                        ? 'Job added successfully!'
                        : 'Failed to add job.'}
                </div>
            )}
            <div className='flex py-4 bg-mebablue-dark rounded-md w-full shadow-xl relative items-center'>
                {/* Left-aligned back button */}
                <button
                    onClick={() => navigate(-1)} // navigate back one page
                    className='bg-mebagold shadow-md rounded-full p-2 absolute left-4 text-2xl text-center text-mebablue-dark hover:bg-yellow-300'
                >
                    <IoArrowBack className='w-6 h-6' />
                </button>

                {/* Centered page header */}
                <div className='w-full text-center'>
                    <span className='text-white text-2xl font-medium font-mont'>
                        Add New Job
                    </span>
                </div>

                {/* Right-aligned Edit Dropdown Options button */}

                <div className='absolute right-4'>
                    {/* 1. Full Text Button (Desktop/Tablet) */}
                    <button
                        onClick={() => setShowModal(true)}
                        className='hidden md:block bg-mebagold text-mebablue-dark px-4 py-2 rounded-md font-semibold shadow hover:bg-yellow-400 transition'
                    >
                        Edit Dropdown Options
                    </button>

                    {/* 2. Icon-Only Button (Mobile) */}
                    <button
                        onClick={() => setShowModal(true)}
                        className='block md:hidden bg-mebagold shadow-md rounded-md p-2 text-2xl text-center text-mebablue-dark hover:bg-yellow-300'
                        aria-label='Edit Dropdown Options'
                    >
                        <IoSettingsSharp className='w-6 h-6' />
                    </button>
                </div>
            </div>
            {/* Form */}
            <div className='my-4 w-full font-mont bg-white rounded-lg shadow p-4'>
                <form onSubmit={handleSubmit} autoComplete='off'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='flex flex-col items-center'>
                            <FormInput
                                type='select'
                                label='Status'
                                name='status'
                                value={values.status}
                                placeholder='Select Status'
                                options={statusOptions}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.status && touched.status
                                        ? 'selectError'
                                        : 'selectBase'
                                }
                                errors={errors.status}
                                touched={touched.status}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('status')}  
                            />
                            <FormInput
                                type='select'
                                label='Region'
                                name='region'
                                value={values.region}
                                placeholder='Select Region'
                                options={regionLoading ? [] : regionOptions}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.region && touched.region
                                        ? 'selectError'
                                        : 'selectBase'
                                }
                                errors={errors.region}
                                touched={touched.region}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('region')}  
                            />
                            <FormInput
                                type='select'
                                label='Hall'
                                name='hall'
                                value={values.hall}
                                placeholder='Select Hall'
                                options={hallLoading ? [] : hallOptions}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.hall && touched.hall
                                        ? 'selectError'
                                        : 'selectBase'
                                }
                                errors={errors.hall}
                                touched={touched.hall}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('hall')}    
                            />
                            <FormInput
                                type='date'
                                label='Date Called'
                                name='dateCalled'
                                value={values.dateCalled}
                                placeholder='Select a Date'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.dateCalled && touched.dateCalled
                                        ? 'datePickerError'
                                        : 'datePickerBase'
                                }
                                errors={errors.dateCalled}
                                touched={touched.dateCalled}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('dateCalled')}
                            />
                            <FormInput
                                type='text'
                                label='Vessel'
                                name='shipName'
                                value={values.shipName}
                                placeholder='Enter Ship Name'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.shipName && touched.shipName
                                        ? 'textError'
                                        : 'textBase'
                                }
                                errors={errors.shipName}
                                touched={touched.shipName}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('shipName')}
                            />
                            <FormInput
                                type='date'
                                label='Join Date'
                                name='joinDate'
                                value={values.joinDate}
                                placeholder='Select a Date'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.joinDate && touched.joinDate
                                        ? 'datePickerError'
                                        : 'datePickerBase'
                                }
                                errors={errors.joinDate}
                                touched={touched.joinDate}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('joinDate')}
                            />
                        </div>
                        <div className='flex flex-col items-center'>
                            <FormInput
                                type='select'
                                label='Billet'
                                name='billet'
                                value={values.billet}
                                placeholder='Select Billet'
                                options={billetLoading ? [] : billetOptions}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.billet && touched.billet
                                        ? 'selectError'
                                        : 'selectBase'
                                }
                                errors={errors.billet}
                                touched={touched.billet}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('billet')}  
                            />
                            <FormInput
                                type='select'
                                label='Type'
                                name='type'
                                value={values.type}
                                placeholder='Select Type'
                                options={typeLoading ? [] : typeOptions}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.type && touched.type
                                        ? 'selectError'
                                        : 'selectBase'
                                }
                                errors={errors.type}
                                touched={touched.type}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('type')}    
                            />
                            <FormInput
                                type='text'
                                label='Days *'
                                name='days'
                                value={values.days}
                                placeholder='Enter # of Days'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.days && touched.days
                                        ? 'textError'
                                        : 'textBase'
                                }
                                errors={errors.days}
                                touched={touched.days}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('days')}    
                            />
                            <FormInput
                                type='text'
                                label='Location'
                                name='location'
                                value={values.location}
                                placeholder='Enter Location'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.location && touched.location
                                        ? 'textError'
                                        : 'textBase'
                                }
                                errors={errors.location}
                                touched={touched.location}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('location')}
                            />
                            <FormInput
                                type='select'
                                label='Company'
                                name='company'
                                value={values.company}
                                placeholder='Select Company'
                                options={companyLoading ? [] : companyOptions}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.company && touched.company
                                        ? 'selectError'
                                        : 'selectBase'
                                }
                                errors={errors.company}
                                touched={touched.company}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('company')} 
                            />
                            <FormInput
                                type='text'
                                label='Crew Relieved'
                                name='crewRelieved'
                                value={values.crewRelieved}
                                placeholder='Enter Crew Relieved'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.crewRelieved && touched.crewRelieved
                                        ? 'textError'
                                        : 'textBase'
                                }
                                errors={errors.crewRelieved}
                                touched={touched.crewRelieved}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('crewRelieved')}
                            />
                          {/* ✅ Job Flags (stacked vertically in right column) */}
                            <div className='flex flex-col items-start mt-4 space-y-2'>
                                <label className='flex items-center space-x-2'>
                                    <input
                                        type='checkbox'
                                        name='passThru'
                                        checked={values.passThru}
                                        onChange={(e) =>
                                            handleChange({
                                                target: {
                                                    name: e.target.name,
                                                    value: e.target.checked,
                                                },
                                            })
                                        }
                                        className='h-4 w-4 accent-mebablue-dark'
                                    />
                                    <span className='text-mebablue-dark font-medium'>
                                        Pass-Thru
                                    </span>
                                </label>

                                <label className='flex items-center space-x-2'>
                                    <input
                                        type='checkbox'
                                        name='nightCardEarlyReturn'
                                        checked={values.nightCardEarlyReturn}
                                        onChange={(e) =>
                                            handleChange({
                                                target: {
                                                    name: e.target.name,
                                                    value: e.target.checked,
                                                },
                                            })
                                        }
                                        className='h-4 w-4 accent-mebablue-dark'
                                    />
                                    <span className='text-mebablue-dark font-medium'>
                                        Night Card Early Return
                                    </span>
                                </label>

                                <label className='flex items-center space-x-2'>
                                    <input
                                        type='checkbox'
                                        name='msc'
                                        checked={values.msc}
                                        onChange={(e) =>
                                            handleChange({
                                                target: {
                                                    name: e.target.name,
                                                    value: e.target.checked,
                                                },
                                            })
                                        }
                                        className='h-4 w-4 accent-mebablue-dark'
                                    />
                                    <span className='text-mebablue-dark font-medium'>
                                        MSC
                                    </span>
                                </label>
                            </div>
                        </div>
                        

                        <div className='col-span-1 md:col-span-2 flex flex-col items-center'>
                            <FormInput
                                multiline
                                type='text'
                                label='Notes'
                                name='notes'
                                value={values.notes}
                                placeholder='Enter Notes/Requirements'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                errors={errors.notes}
                                touched={touched.notes}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                                required={isRequired('notes')}   
                            />
                        </div>
                    </div>
                    {/* Status Messages */}
                    {status && (
                        <div
                            className={`mt-4 p-3 rounded-md text-center ${
                                status.error
                                    ? 'bg-red-100 border border-red-400 text-red-700'
                                    : 'bg-green-100 border border-green-400 text-green-700'
                            }`}
                        >
                            {status.error || status.success}
                        </div>
                    )}

                    {/* Submit button */}
                    <div className='flex flex-row space-x-4 mt-4 justify-center'>
                        <button
                            disabled={isSubmitting || !user}
                            type='submit'
                            className={
                                isSubmitting || !user
                                    ? styles.submitSubmitting
                                    : styles.submitBase
                            }
                            title={
                                !user
                                    ? 'You must be logged in to add a job'
                                    : ''
                            }
                        >
                            {isSubmitting ? 'Adding Job...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
            {showModal && (
                <div className='fixed inset-0 flex items-center justify-center bg-black/40 z-50'>
                    <div className='bg-white rounded-lg shadow-lg p-6 w-[28rem] relative max-h-[90vh] overflow-y-auto'>
                        <h2 className='text-2xl font-semibold mb-6 text-center text-mebablue-dark'>
                            Edit Dropdown Options
                        </h2>

                        <div className='space-y-6'>
                            {/* --- Region --- */}
                            <div>
                                <h3 className='text-lg font-semibold text-mebablue-dark mb-2'>
                                    Region
                                </h3>
                                <div className='flex flex-col sm:flex-row gap-2'>
                                    <input
                                        id='regionAdd'
                                        type='text'
                                        placeholder='Add new Region...'
                                        className='border rounded p-2 flex-1'
                                    />
                                    <button
                                        onClick={() => {
                                            const value =
                                                document.getElementById(
                                                    'regionAdd'
                                                ).value
                                            handleAddOption('region', value)
                                            document.getElementById(
                                                'regionAdd'
                                            ).value = ''
                                        }}
                                        className='bg-mebagold text-mebablue-dark px-3 py-2 rounded font-semibold hover:bg-yellow-400'
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className='flex flex-col sm:flex-row gap-2 mt-2'>
                                    <input
                                        id='regionRem'
                                        type='text'
                                        placeholder='Remove Region...'
                                        className='border rounded p-2 flex-1'
                                    />
                                    <button
                                        onClick={() => {
                                            const value =
                                                document.getElementById(
                                                    'regionRem'
                                                ).value
                                            handleRemoveOption('region', value)
                                            document.getElementById(
                                                'regionRem'
                                            ).value = ''
                                        }}
                                        className='bg-red-500 text-white px-3 py-2 rounded font-semibold hover:bg-red-600'
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* --- Hall --- */}
                            <div>
                                <h3 className='text-lg font-semibold text-mebablue-dark mb-2'>
                                    Hall
                                </h3>
                                <div className='flex flex-col sm:flex-row gap-2'>
                                    <input
                                        id='hallAdd'
                                        type='text'
                                        placeholder='Add new Hall...'
                                        className='border rounded p-2 flex-1'
                                    />
                                    <button
                                        onClick={() => {
                                            const value =
                                                document.getElementById(
                                                    'hallAdd'
                                                ).value
                                            handleAddOption('hall', value)
                                            document.getElementById(
                                                'hallAdd'
                                            ).value = ''
                                        }}
                                        className='bg-mebagold text-mebablue-dark px-3 py-2 rounded font-semibold hover:bg-yellow-400'
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className='flex flex-col sm:flex-row gap-2 mt-2'>
                                    <input
                                        id='hallRem'
                                        type='text'
                                        placeholder='Remove Hall...'
                                        className='border rounded p-2 flex-1'
                                    />
                                    <button
                                        onClick={() => {
                                            const value =
                                                document.getElementById(
                                                    'hallRem'
                                                ).value
                                            handleRemoveOption('hall', value)
                                            document.getElementById(
                                                'hallRem'
                                            ).value = ''
                                        }}
                                        className='bg-red-500 text-white px-3 py-2 rounded font-semibold hover:bg-red-600'
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* --- Company --- */}
                            <div>
                                <h3 className='text-lg font-semibold text-mebablue-dark mb-2'>
                                    Company
                                </h3>
                                <div className='flex flex-col sm:flex-row gap-2'>
                                    <input
                                        id='companyAdd'
                                        type='text'
                                        placeholder='Add new Company...'
                                        className='border rounded p-2 flex-1'
                                    />
                                    <button
                                        onClick={() => {
                                            const value =
                                                document.getElementById(
                                                    'companyAdd'
                                                ).value
                                            handleAddOption('company', value)
                                            document.getElementById(
                                                'companyAdd'
                                            ).value = ''
                                        }}
                                        className='bg-mebagold text-mebablue-dark px-3 py-2 rounded font-semibold hover:bg-yellow-400'
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className='flex flex-col sm:flex-row gap-2 mt-2'>
                                    <input
                                        id='companyRem'
                                        type='text'
                                        placeholder='Remove Company...'
                                        className='border rounded p-2 flex-1'
                                    />
                                    <button
                                        onClick={() => {
                                            const value =
                                                document.getElementById(
                                                    'companyRem'
                                                ).value
                                            handleRemoveOption('company', value)
                                            document.getElementById(
                                                'companyRem'
                                            ).value = ''
                                        }}
                                        className='bg-red-500 text-white px-3 py-2 rounded font-semibold hover:bg-red-600'
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* --- Billet --- */}
                            <div>
                                <h3 className='text-lg font-semibold text-mebablue-dark mb-2'>
                                    Billet
                                </h3>
                                <div className='flex flex-col sm:flex-row gap-2'>
                                    <input
                                        id='billetAdd'
                                        type='text'
                                        placeholder='Add new Billet...'
                                        className='border rounded p-2 flex-1'
                                    />
                                    <button
                                        onClick={() => {
                                            const value =
                                                document.getElementById(
                                                    'billetAdd'
                                                ).value
                                            handleAddOption('billet', value)
                                            document.getElementById(
                                                'billetAdd'
                                            ).value = ''
                                        }}
                                        className='bg-mebagold text-mebablue-dark px-3 py-2 rounded font-semibold hover:bg-yellow-400'
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className='flex flex-col sm:flex-row gap-2 mt-2'>
                                    <input
                                        id='billetRem'
                                        type='text'
                                        placeholder='Remove Billet...'
                                        className='border rounded p-2 flex-1'
                                    />
                                    <button
                                        onClick={() => {
                                            const value =
                                                document.getElementById(
                                                    'billetRem'
                                                ).value
                                            handleRemoveOption('billet', value)
                                            document.getElementById(
                                                'billetRem'
                                            ).value = ''
                                        }}
                                        className='bg-red-500 text-white px-3 py-2 rounded font-semibold hover:bg-red-600'
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* --- Type --- */}
                            <div>
                                <h3 className='text-lg font-semibold text-mebablue-dark mb-2'>
                                    Type
                                </h3>
                                <div className='flex flex-col sm:flex-row gap-2'>
                                    <input
                                        id='typeAdd'
                                        type='text'
                                        placeholder='Add new Type...'
                                        className='border rounded p-2 flex-1'
                                    />
                                    <button
                                        onClick={() => {
                                            const value =
                                                document.getElementById(
                                                    'typeAdd'
                                                ).value
                                            handleAddOption('type', value)
                                            document.getElementById(
                                                'typeAdd'
                                            ).value = ''
                                        }}
                                        className='bg-mebagold text-mebablue-dark px-3 py-2 rounded font-semibold hover:bg-yellow-400'
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className='flex flex-col sm:flex-row gap-2 mt-2'>
                                    <input
                                        id='typeRem'
                                        type='text'
                                        placeholder='Remove Type...'
                                        className='border rounded p-2 flex-1'
                                    />
                                    <button
                                        onClick={() => {
                                            const value =
                                                document.getElementById(
                                                    'typeRem'
                                                ).value
                                            handleRemoveOption('type', value)
                                            document.getElementById(
                                                'typeRem'
                                            ).value = ''
                                        }}
                                        className='bg-red-500 text-white px-3 py-2 rounded font-semibold hover:bg-red-600'
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className='mt-8 w-full bg-gray-200 text-mebablue-dark font-semibold py-2 rounded hover:bg-gray-300 transition'
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddJob
