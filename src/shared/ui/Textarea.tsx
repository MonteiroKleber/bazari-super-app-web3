import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="form-label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={clsx(
            'form-input resize-none',
            error && 'border-danger focus:border-danger focus:ring-danger',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-danger">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-matte-black-500">{helperText}</p>
        )}
      </div>
    )
  }
)