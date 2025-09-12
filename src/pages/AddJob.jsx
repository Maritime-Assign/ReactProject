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

// Arrays for options for the various dropdowns
const statusOptions = ['Open', 'Filled']
const billetOptions = ['1 A/E', '2M', '3M']
const typeOptions = ['Relief', 'Permanent']

// Submission function
const onSubmit = async (values, actions) => {
    console.log(values) // logs all values being submitted
    //console.log(actions) // displays available formik actions
    await new Promise((resolve) => setTimeout(resolve, 3000)) // simulating a database post promise

    actions.resetForm() // reset/clear the form
}

// Main AddJob Page component
const AddJob = () => {
    const navigate = useNavigate() // react router function to navigate back

    // destructured formik initialization
    const {
        values,
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
    } = useFormik({
        initialValues: {
            status: '',
            branch1: '',
            branch2: '',
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
        },
        validationSchema: jobValidationSchema, // bring in Schema from jobValidationSchema.jsx in data dir
        onSubmit,
        validateOnChange: true,
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
            <div className='my-4 w-full font-mont'>
                <form onSubmit={handleSubmit} autoComplete='off'>
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
                        />
                        <FormInput
                            type='select'
                            label='Branch 1'
                            name='branch1'
                            value={values.branch1}
                            placeholder='Select Branch'
                            options={branchNames}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={
                                errors.branch1 && touched.branch1
                                    ? 'selectError'
                                    : 'selectBase'
                            }
                            errors={errors.branch1}
                            touched={touched.branch1}
                        />
                        <FormInput
                            type='select'
                            label='Branch 2'
                            name='branch2'
                            value={values.branch2}
                            placeholder='Select Branch'
                            options={branchNames}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={
                                errors.branch2 && touched.branch2
                                    ? 'selectError'
                                    : 'selectBase'
                            }
                            errors={errors.branch2}
                            touched={touched.branch2}
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
                        />
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
                        />
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
                        />
                    </div>
                    {/* Submit button */}
                    <div className='flex flex-row space-x-4 mt-4 justify-center'>
                        <button
                            disabled={isSubmitting}
                            type='submit'
                            className={
                                isSubmitting
                                    ? styles.submitSubmitting
                                    : styles.submitBase
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
