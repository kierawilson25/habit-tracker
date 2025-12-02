'use client';

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

/**
 * Options for configuring the useForm hook
 */
export interface UseFormOptions<T> {
  /**
   * Initial values for the form fields
   */
  initialValues: T;

  /**
   * Callback function called when form is submitted and validation passes
   * @param values - The current form values
   */
  onSubmit: (values: T) => void | Promise<void>;

  /**
   * Optional validation function
   * @param values - The current form values
   * @returns Object with field names as keys and error messages as values
   */
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

/**
 * Return type for the useForm hook
 */
export interface UseFormReturn<T> {
  /**
   * Current form values
   */
  values: T;

  /**
   * Current form errors (field name -> error message)
   */
  errors: Partial<Record<keyof T, string>>;

  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;

  /**
   * Handle change events for form inputs
   * @param e - Change event from input element
   */
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;

  /**
   * Handle form submission
   * @param e - Form event
   */
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;

  /**
   * Reset form to initial values and clear errors
   */
  reset: () => void;

  /**
   * Manually set errors
   * @param errors - Object with field names as keys and error messages as values
   */
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;

  /**
   * Manually set values
   * @param values - Partial or full form values
   */
  setValues: (values: Partial<T>) => void;
}

/**
 * Generic form state management hook
 *
 * Handles form state, validation, submission, and error management.
 * Provides a clean API for managing form inputs and validation logic.
 *
 * @template T - The shape of the form values object
 * @param options - Configuration options for the form
 * @returns Form state and handlers
 *
 * @example
 * interface LoginForm {
 *   email: string;
 *   password: string;
 * }
 *
 * function LoginPage() {
 *   const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm<LoginForm>({
 *     initialValues: { email: '', password: '' },
 *     onSubmit: async (values) => {
 *       await login(values);
 *     },
 *     validate: (values) => {
 *       const errors: Partial<Record<keyof LoginForm, string>> = {};
 *       if (!values.email) errors.email = 'Email is required';
 *       if (!values.password) errors.password = 'Password is required';
 *       return errors;
 *     }
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="email" value={values.email} onChange={handleChange} />
 *       {errors.email && <span>{errors.email}</span>}
 *       <input name="password" type="password" value={values.password} onChange={handleChange} />
 *       {errors.password && <span>{errors.password}</span>}
 *       <button type="submit" disabled={isSubmitting}>
 *         {isSubmitting ? 'Submitting...' : 'Submit'}
 *       </button>
 *     </form>
 *   );
 * }
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change events
   * Updates the form values state with the new value
   */
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error for this field when user starts typing
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name as keyof T];
      return newErrors;
    });
  }, []);

  /**
   * Handle form submission
   * Validates the form and calls onSubmit if validation passes
   */
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Run validation if provided
      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      }

      // Clear any existing errors
      setErrors({});

      // Set submitting state and call onSubmit
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        // Optionally set a generic error
        // setErrors({ submit: 'An error occurred during submission' } as any);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  /**
   * Reset form to initial values and clear errors
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Manually update form values
   */
  const updateValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setErrors,
    setValues: updateValues,
  };
}
