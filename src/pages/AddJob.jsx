import { useState } from 'react'
import './AddJob.css'
import FormInput from '../components/FormInput'
import branchNames from '../data/branchNames'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import jobValidationSchema from '../data/jobValidationSchema'

const statusOptions = ['Open', 'Filled']
const billetOptions = ['1 A/E', '2M', '3M']
const typeOptions = ['Relief', 'Permanent']

const onSubmit = () => {
    console.log('Form submitted')
}

const AddJob = () => {
    const {
        values,
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        validateOnChange,
        validateOnBlur,
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
        validationSchema: jobValidationSchema,
        onSubmit,
        validateOnChange: true,
        validateOnBlur: false,
    })
    // const [formData, setFormData] = useState({

    // })

    // const handleSubmit = (e) => {
    //     e.preventDefault()
    //     console.log('Form Submitted: ' + formData)
    // }

    // DEBUG LOG
    //console.log(errors)
    return (
        <div className='w-full pt-4 flex flex-col max-w-[1280px] mx-auto'>
            <div className='flex py-4 bg-mebablue-dark rounded-md w-full shadow-xl justify-center'>
                <span className='text-white text-2xl font-semibold ml-4'>
                    Add New Job
                </span>
            </div>
            <div className='my-4 w-full'>
                <form onSubmit={handleSubmit}>
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
                            onBlue={handleBlur}
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
                    <div className='flex flex-row space-x-4 mt-4 justify-center'>
                        <button
                            type='submit'
                            className='w-sm rounded-md bg-mebablue-dark text-white text-xl py-2 hover:bg-mebablue-hover'
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddJob
