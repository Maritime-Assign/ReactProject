import * as yup from 'yup'

const jobValidationSchema = yup.object().shape({
    status: yup.string().required('Required'),
    branch1: yup.string().required('Required'),
    branch2: yup.string().required('Required'),
    dateCalled: yup.string().required('Required'),
    shipName: yup.string().required('Required'),
    joinDate: yup.string().required('Required'),
    billet: yup.string().required('Required'),
    type: yup.string().required('Required'),
    days: yup.string().required('Required'),
    location: yup.string().required('Required'),
    company: yup.string().required('Required'),
    crewRelieved: yup.string().required('Required'),
    notes: yup.string(),
})

export default jobValidationSchema
