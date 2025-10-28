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
import { IoArrowBack } from 'react-icons/io5'
import { UserAuth } from '../auth/AuthContext'
import { addJob } from '../utils/jobHistoryOptimized'

// Arrays for options for the various dropdowns
const statusOptions = ['Open', 'Filled']
const billetOptions = ['1 A/E', '2M', '3M']
const typeOptions = ['Relief', 'Permanent']

// Submission function - this will be passed the user as a parameter
const createOnSubmit = (user) => async (values, actions) => {
    try {
        console.log('Submitting job with values:', values)

        if (!user) {
            actions.setStatus({ error: 'You must be logged in to add a job.' })
            return
        }

        // Prepare job data - convert form values to match database schema
        // Explicitly define only the fields we want to send (excluding auto-generated fields)
        const jobData = {
            region: values.region || null,
            hall: values.hall || null,
            dateCalled: values.dateCalled || null,
            shipName: values.shipName || null,
            joinDate: values.joinDate || null,
            billet: values.billet || null,
            type: values.type || null,
            days: values.days || null,
            location: values.location || null,
            company: values.company || null,
            crewRelieved: values.crewRelieved || null,
            notes: values.notes || null,
            open: values.status === 'Open', // Convert status to boolean - table uses 'open' not 'status'
            passThru: values.passThru || false,
            nightCardEarlyReturn: values.nightCardEarlyReturn || false,
            msc: values.msc || false,
        }

        // Debug: Log the exact data being sent
        console.log('Sending job data:', JSON.stringify(jobData, null, 2))

        // Add the job (history logging handled automatically by database triggers)
        const result = await addJob(jobData)

        if (result.success) {
            console.log('Job added successfully:', result.data)
            actions.setStatus({ success: 'Job added successfully!' })
            actions.resetForm() // reset/clear the form

            // Note: Navigation will happen when user manually navigates
            // Auto-navigation removed to prevent errors
        } else {
            console.error('Failed to add job:', result.error)
            actions.setStatus({ error: 'Failed to add job. Please try again.' })
        }
    } catch (error) {
        console.error('Error submitting job:', error)
        actions.setStatus({ error: 'An error occurred while adding the job.' })
    }
}

// Main AddJob Page component
const AddJob = () => {
    const navigate = useNavigate() // react router function to navigate back
    const { user } = UserAuth() // Get current user

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
            days: '',
            location: '',
            company: '',
            crewRelieved: '',
            notes: '',
            passThru: false,
            nightCardEarlyReturn: false,
            msc: false,
        },
        validationSchema: jobValidationSchema, // bring in Schema from jobValidationSchema.jsx in data dir
        onSubmit: createOnSubmit(user),
        validateOnChange: false,
        validateOnBlur: false,
    })

    return (
        <div className='w-full pt-4 flex flex-col max-w-[1280px] mx-auto'>
            <div className='flex py-4 bg-mebablue-dark rounded-md w-full shadow-xl relative items-center'>
                {/* Left-aligned back button */}
                <button
                    onClick={() => navigate(-1)} // navigate back one page
                    className='bg-mebagold shadow-md rounded-full p-2 absolute left-4 text-2xl text-center text-mebablue-dark'
                >
                    <svg
                        className='w-6 h-6 hover:w-6.5 hover:h-6.5 transition-all ease-in-out text-center items-center justify-center drop-shadow-md'
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='currentColor'
                    >
                        <IoArrowBack />
                        {/* <path d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' /> */}
                    </svg>
                </button>

                {/* Centered page header */}
                <div className='w-full text-center'>
                    <span className='text-white text-2xl font-medium font-mont'>
                        Add New Job
                    </span>
                </div>
            </div>
            {/* Form */}
            <div className='my-4 w-full font-mont bg-white rounded-lg shadow p-4'>
                <form onSubmit={handleSubmit} autoComplete='off'>
                    <div className='grid grid-cols-2 gap-6'>
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
                            />
                            <FormInput
                                type='select'
                                label='Region'
                                name='region'
                                value={values.region}
                                placeholder='Select Region'
                                options={branchNames}
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
                            />
                            <FormInput
                                type='select'
                                label='Hall'
                                name='hall'
                                value={values.hall}
                                placeholder='Select Hall'
                                options={branchNames}
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
                            />
                            <FormInput
                                type='date'
                                label='Date Called'
                                name='dateCalled'
                                value={values.dateCalled}
                                required
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
                            />
                            <FormInput
                                type='text'
                                label='Ship Name'
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
                                    errors.dateCalled && touched.dateCalled
                                        ? 'datePickerError'
                                        : 'datePickerBase'
                                }
                                errors={errors.dateCalled}
                                touched={touched.dateCalled}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                            />
                        </div>
                        <div className='flex flex-col items-center'>
                            <FormInput
                                type='select'
                                label='Billet'
                                name='billet'
                                value={values.billet}
                                placeholder='Select Billet'
                                options={billetOptions}
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
                            />
                            <FormInput
                                type='select'
                                label='Type'
                                name='type'
                                value={values.type}
                                required
                                placeholder='Select Type'
                                options={typeOptions}
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
                            />
                            <FormInput
                                type='text'
                                label='Days'
                                name='days'
                                value={values.days}
                                required
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
                            />
                            <FormInput
                                type='text'
                                label='Location'
                                name='location'
                                value={values.location}
                                required
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
                            />
                            <FormInput
                                type='text'
                                label='Company'
                                name='company'
                                value={values.company}
                                required
                                placeholder='Enter Company'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.company && touched.company
                                        ? 'textError'
                                        : 'textBase'
                                }
                                errors={errors.company}
                                touched={touched.company}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                            />
                            <FormInput
                                type='text'
                                label='Crew Relieved'
                                name='crewRelieved'
                                value={values.crewRelieved}
                                required={false}
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
          target: { name: e.target.name, value: e.target.checked },
        })
      }
      className='h-4 w-4 accent-mebablue-dark'
    />
    <span className='text-mebablue-dark font-medium'>Pass-Thru</span>
  </label>

  <label className='flex items-center space-x-2'>
    <input
      type='checkbox'
      name='nightCardEarlyReturn'
      checked={values.nightCardEarlyReturn}
      onChange={(e) =>
        handleChange({
          target: { name: e.target.name, value: e.target.checked },
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
          target: { name: e.target.name, value: e.target.checked },
        })
      }
      className='h-4 w-4 accent-mebablue-dark'
    />
    <span className='text-mebablue-dark font-medium'>MSC</span>
  </label>
</div>


                        </div>


                        <div className='col-span-2 flex flex-col items-center'>
                            <FormInput
                                multiline
                                type='text'
                                label='Notes'
                                name='notes'
                                value={values.notes}
                                required={false}
                                placeholder='Enter Notes/Requirements'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                errors={errors.notes}
                                touched={touched.notes}
                                submitCount={submitCount}
                                setFieldError={setFieldError}
                            />
                        </div>
                    </div>
                    {/* Status Messages */}
                    {status && (
                        <div
                            className={`mt-4 p-3 rounded-md text-center ${status.error
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
        </div>
    )
}

export default AddJob
