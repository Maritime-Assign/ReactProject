/**
 * Form input element component, takes a prop 'type' which determines what type of form to render with label displayed above
 * Utilizes 'react-datepicker' component for selecting dates and reformats the value
 */

import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './FormInput.css'

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
}) => {
    const inputId = `input-${name}` // save an input id for later use if needed

    const renderInput = () => {
        // For dropdown select type
        if (type === 'select') {
            return (
                <select
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={className}
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
                    onChange={(date) => {
                        onChange({
                            target: {
                                name: name,
                                value: formatDateString(date),
                            },
                        })
                    }}
                    dateFormat='MM/dd/yyyy'
                    placeholderText={placeholder}
                    className={className}
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
                    onChange={onChange}
                    rows={rows}
                    placeholder={placeholder}
                    disabled={disabled}
                    className='multi'
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
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={className}
            />
        )
    }

    // final displayed component with error css applied if errors are passed in as props
    return (
        <div className='flex flex-col mb-2 items-start justify-start'>
            <span
                className={
                    errors && touched
                        ? 'text-lg font-medium text-red-500 mb-1'
                        : 'text-lg font-medium text-mebablue-dark mb-1'
                }
            >
                {errors && touched ? label + ' Required*' : label}
            </span>
            {renderInput()}
        </div>
    )
}

export default FormInput
