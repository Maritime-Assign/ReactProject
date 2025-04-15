import { sliderClasses } from '@mui/material'
import React from 'react'
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './FormInput.css'

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
    const inputId = `input-${name}`
    const baseClass = 'w-sm p-2 rounded-md border-1'

    const renderInput = () => {
        // For dropdown select
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
        if (type === 'date') {
            return (
                <DatePicker
                    name={name}
                    selected={value ? new Date(value) : null}
                    onChange={(date) => {
                        // Create a synthetic event with the date value
                        const synthEvent = {
                            target: {
                                name: name,
                                value: date, // Pass the Date object directly
                                type: 'date',
                            },
                        }
                        onChange(synthEvent) // This calls your parent handleChange function
                    }}
                    dateFormat='MM/dd/yyyy'
                    placeholderText={placeholder}
                    className={className}
                    onBlur={onBlur}
                />
            )
        }
        // For multiline text input
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
