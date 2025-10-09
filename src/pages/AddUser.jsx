/**
 * AddUser page to allow admin to add a new user to the site and assign a role to them
 * new users are sent an email with a link which redirects them to the SetPassword page to create a password
 * New record is created in the user_roles table in supabase, saving the user's role for future use with sessions and permissions
 */

import styles from './AddJob.module.css'
import FormInput from '../components/FormInput'
import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import * as yup from 'yup'
import supabase from '../supabaseClient'

// Array for role options in the dropdown
// changed to match enum type for user roles
const roleOptions = ['Display', 'Dispatch', 'Admin']

// Schema for validation
const userValidationSchema = yup.object().shape({
    fName: yup
        .string()
        .required('Required')
        .min(2, 'Must be greater than 2 characters')
        .max(50, 'Must be shorter than 50 characters'),
    lName: yup
        .string()
        .required('Required')
        .min(2, 'Must be greater than 2 characters')
        .max(50, 'Must be shorter than 50 characters'),
    username: yup
        .string()
        .required('Required')
        .matches(/^[a-zA-Z0-9_-]+$/, 'Invalid Username')
        .min(2, 'Must be greater than 2 characters')
        .max(30, 'Must be less than 30 characters'),
    role: yup
        .string()
        .oneOf(['Display', 'Dispatch', 'Admin'], 'Invalid role')
        .required('Required'),
})

// Submission function to invite user to supabase with email

const onSubmit = async (values, actions) => {
    // metadata sent to supabase to get name and role
    const metadataToSend = {
        role: values.role,
        first_name: values.fName,
        last_name: values.lName,
    }

    // debug logs
    console.log('Values from form:', values)
    console.log('Metadata being sent:', metadataToSend)

    try {
        // this function uses supabase admin service role key to invite user by email to create a password for their new account
        // this needs to be moved to a server to hide supabase keys in production app
        const { data, error } = await supabase.auth.signUp({
            email: 'example@email.com',
            password: 'example-password',
        })

        console.log('Full Supabase response:', { data, error })

        if (error) {
            console.error('Error inviting user:', error)
            return
        }

        console.log('User invite success')
        actions.resetForm()
    } catch (error) {
        console.error('Error submitting form:', error)
    }
}

// Main AddUser component
const AddUser = () => {
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
            username: '',
            role: 'display',
            fName: '',
            lName: '',
        },
        validationSchema: userValidationSchema, // schema used to validate entries using Formik
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
                        Add New User
                    </span>
                </div>
            </div>
            {/* Form */}
            <div className='my-4 w-full font-mont'>
                <form onSubmit={handleSubmit} autoComplete='off'>
                    <div className='flex flex-col items-center'>
                        <FormInput
                            type='text'
                            label='First Name'
                            name='fName'
                            value={values.fName}
                            placeholder='Enter First Name'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={
                                errors.fName && touched.fName
                                    ? 'textError'
                                    : 'textBase'
                            }
                            errors={errors.fName}
                            touched={touched.fName}
                        />
                        <FormInput
                            type='text'
                            label='Last Name'
                            name='lName'
                            value={values.lName}
                            placeholder='Enter Last Name'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={
                                errors.lName && touched.lName
                                    ? 'textError'
                                    : 'textBase'
                            }
                            errors={errors.lName}
                            touched={touched.lName}
                        />
                        <FormInput
                            type='text'
                            label='Username'
                            name='username'
                            value={values.username}
                            placeholder='Enter Username'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={
                                errors.username && touched.username
                                    ? 'textError'
                                    : 'textBase'
                            }
                            errors={errors.username}
                            touched={touched.username}
                        />
                        <FormInput
                            type='select'
                            label='Role'
                            name='role'
                            value={values.role}
                            placeholder='Select Role for New User'
                            options={roleOptions}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={
                                errors.role && touched.role
                                    ? 'selectError'
                                    : 'selectBase'
                            }
                            errors={errors.role}
                            touched={touched.role}
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
                            {isSubmitting ? 'Adding User...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddUser
