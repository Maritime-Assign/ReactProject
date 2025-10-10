/**
 * Form input element component, takes a prop 'type' which determines what type of form to render with label displayed above
 * Utilizes 'react-datepicker' component for selecting dates and reformats the value
 */

import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './FormInput.module.css'

// reformate output date string to desired string format
const formatDateString = (date) => {
    if (!date) return ''
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
        .getDate()
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
}

// Form Input Component
const FormInput = ({
    label,
    type = 'text',
    multiline = false,
    value = '',
    options = [],
    onChange,
    placeholder = '',
    name,
    disabled = false,
    rows = 3,
    onBlur,
    className,
    errors,
    touched,
    submitCount = 0,
    setFieldError,
}) => {
    const handleChange = (e) => {
        onChange(e)

        // Clear the error if the field is now valid
        if (submitCount > 0 && errors) {
            const val = e.target?.value ?? e
            if (val && val.toString().trim() !== '')
                setFieldError(name, undefined)
        }
    }

    const inputId = `input-${name}` // save an input id for later use if needed

    const appliedClass = styles[className]

    const renderInput = () => {
        // For dropdown select type
        if (type === 'select') {
            return (
                <select
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={handleChange} // Change from onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={appliedClass}
                >
                    <option value='' disabled>
                        {placeholder || 'Select an option'}
                    </option>
                    {options.map((option) => (
                        <option
                            key={
                                typeof option === 'object'
                                    ? option.value
                                    : option
                            }
                            value={
                                typeof option === 'object'
                                    ? option.value
                                    : option
                            }
                        >
                            {typeof option === 'object' ? option.label : option}
                        </option>
                    ))}
                </select>
            )
        }
        // For date form type
        if (type === 'date') {
            return (
                <DatePicker
                    name={name}
                    selected={value}
                    onChange={(date) =>
                        handleChange({ target: { name, value: date } })
                    }
                    dateFormat='MM/dd/yyyy'
                    placeholderText={placeholder}
                    className={appliedClass}
                    onBlur={onBlur}
                />
            )
        }
        // For multiline form element type
        if (multiline) {
            return (
                <textarea
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    rows={rows}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={styles.multi}
                />
            )
        }

        // For regular text input and other types
        return (
            <input
                type={type}
                id={inputId}
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                className={appliedClass}
            />
        )
    }

    // final displayed component with error css applied if errors are passed in as props
    return (
        <div className='flex flex-col items-center mb-1 w-full'>
            {/* Input wrapper with fixed width */}
            <div className='w-full max-w-sm flex flex-col'>
                {/* Label */}
                <span className='text-lg font-medium text-mebablue-dark mb-1 font-mont'>
                    {label}
                </span>
                {/* Input */}
                {renderInput()}
                {/* Error */}
                {errors && submitCount > 0 && touched && (
                    <span className=' text-red-500 text-sm mt-1 block'>
                        {errors}
                    </span>
                )}
            </div>
        </div>
    )
}

export default FormInput
