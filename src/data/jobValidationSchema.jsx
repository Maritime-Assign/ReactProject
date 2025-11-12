import * as yup from 'yup'

const jobValidationSchema = yup.object().shape({
    status: yup.string().oneOf(['Open', 'Filled', 'Filled by Company'], 'Invalid status').required('Required'),
    region: yup.string().required('Required'),
    hall: yup.string().required('Required'),
    dateCalled: yup.string().required('Required'),
    shipName: yup.string()
        .required('Required')
        .max(50, 'must be 50 characters or less'),
    joinDate: yup.string().required('Required'),
    billet: yup.string().required('Required'),
    type: yup.string().required('Required'),
    days: yup.number()
        .typeError("must be numeric")
        .integer("must be a whole number")
        .positive("must be greater than 0")
        .required("Required"),
    location: yup.string()
        .required('Required')
        .max(50, 'must be 50 characters or less'),
    company: yup.string().required('Required')
        .max(50, 'must be 50 characters or less'),
    crewRelieved: yup.string()
        .max(50, 'must be 50 characters or less'),
    notes: yup.string(),
})

export default jobValidationSchema
