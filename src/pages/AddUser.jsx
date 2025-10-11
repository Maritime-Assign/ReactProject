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
        .min(2, 'First Name must be at least 2 character')
        .max(50, 'First Name must be 50 characters or less'),
    lName: yup
        .string()
        .required('Required')
        .min(2, 'Last Name must be at least 2 character')
        .max(50, 'Last Name must be 50 characters or less'),
    username: yup
        .string()
        .required('Required')
        .matches(/^[a-zA-Z0-9_-]+$/, 'Invalid Username')
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be 30 characters or less'),
    password: yup
        .string()
        .required('Required')
        .min(8, 'Password must be at least 8 characters')
        .max(50, 'Password must be 50 characters or less')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/\d/, 'Password must contain at least one number')
        .matches(
            /[@$!%*?&]/,
            'Password must contain at least one special character'
        ),
    role: yup
        .string()
        .oneOf(['Display', 'Dispatch', 'Admin'], 'Invalid role')
        .required('Required'),
})

// Submission function to invite user to supabase with email

const onSubmit = async (values, actions) => {
    // Clear previous status
    actions.setStatus({ submitError: null })

    try {
        // Check if username already exists in public Users table
        const { data: existingUser, error: fetchError } = await supabase
            .from('Users')
            .select('UUID')
            .eq('username', values.username)
            .maybeSingle()

        if (fetchError) {
            // Some unexpected DB error
            console.error('Error checking username:', fetchError)
            actions.setStatus({ submitError: 'Error checking username' })
            return
        }

        if (existingUser) {
            actions.setFieldError('username', 'Username Already Exists')
            return
        }

        // Save the current admin session
        const {
            data: { session: adminSession },
        } = await supabase.auth.getSession()

        // Sign up user in Supabase Auth with metadata
        const { data: authData, error: signUpError } =
            await supabase.auth.signUp({
                email: `${values.username}@maritimeassign.local`,
                password: values.password,
                options: {
                    data: {
                        first_name: values.fName,
                        last_name: values.lName,
                        role: values.role.toLowerCase(),
                        username: values.username,
                    },
                },
            })

        if (signUpError) {
            console.error('Supabase signUp error:', signUpError)
            actions.setStatus({ submitError: signUpError.message })
            return
        }

        // Restore admin session immediately
        if (adminSession) {
            await supabase.auth.setSession(adminSession)
        }

        console.log('User Sign Up Success:', authData)
        actions.resetForm()
    } catch (error) {
        console.error('Unexpected error submitting form:', error)
        actions.setStatus({ submitError: 'Unexpected error occurred' })
    } finally {
        actions.setSubmitting(false)
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
        submitCount,
        setFieldError,
        touched,
    } = useFormik({
        initialValues: {
            username: '',
            password: '',
            role: '',
            fName: '',
            lName: '',
        },
        validationSchema: userValidationSchema, // schema used to validate entries using Formik
        onSubmit,
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
                            submitCount={submitCount}
                            setFieldError={setFieldError}
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
                            submitCount={submitCount}
                            setFieldError={setFieldError}
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
                            submitCount={submitCount}
                            setFieldError={setFieldError}
                        />
                        <FormInput
                            type='text'
                            label='Password'
                            name='password'
                            value={values.password}
                            placeholder='Enter Password'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={
                                errors.password && touched.password
                                    ? 'textError'
                                    : 'textBase'
                            }
                            errors={errors.password}
                            touched={touched.password}
                            submitCount={submitCount}
                            setFieldError={setFieldError}
                        />
                        <FormInput
                            type='select'
                            label='Role'
                            name='role'
                            value={values.role}
                            placeholder='Select Role'
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
                            submitCount={submitCount}
                            setFieldError={setFieldError}
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
