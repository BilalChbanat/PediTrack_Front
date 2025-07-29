import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Typography
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from 'react-toastify';
import axiosInstance from "@/api/axiosInstance";

// Validation schemas
const parentInfoSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email must not exceed 254 characters')
    .lowercase()
    .trim(),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters')
    .trim()
});

const patientInfoSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  birthDate: Yup.date()
    .required('Birth date is required')
    .max(new Date(), 'Birth date cannot be in the future')
    .min(new Date('1900-01-01'), 'Birth date cannot be before 1900'),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female'], 'Please select a valid gender'),
  address: Yup.string()
    .max(200, 'Address must not exceed 200 characters')
    .trim()
});

// Utility functions
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>]/g, '').trim();
};

// Helper component for form field errors
const FieldError = ({ error }) => (
  error ? (
    <Typography variant="small" color="red" className="mt-1 text-xs">
      {error.message}
    </Typography>
  ) : null
);

// Helper function to safely get patient data
const getPatientFieldValue = (patient, field, fallback = '') => {
  if (!patient) return fallback;
  const value = patient[field];
  return (value !== null && value !== undefined && value !== '') ? String(value) : fallback;
};

export function UpdatePatientModal({ 
  open, 
  onClose, 
  patient, 
  onPatientUpdated 
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form setup
  const parentForm = useForm({
    resolver: yupResolver(parentInfoSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: ''
    },
    mode: 'onBlur',
    shouldUnregister: false
  });

  const patientForm = useForm({
    resolver: yupResolver(patientInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: '',
      address: ''
    },
    mode: 'onBlur',
    shouldUnregister: false
  });

  // Populate forms with patient data
  useEffect(() => {
    if (patient && open) {
      console.log('Patient data:', patient); // Debug log
      
      // Clear forms first to prevent any residual data
      parentForm.reset();
      patientForm.reset();
      
      // Wait for next tick to ensure forms are cleared
      setTimeout(() => {
        // Populate parent form with safe data extraction
        const parentData = {
          fullName: getPatientFieldValue(patient.parent, 'fullName') || getPatientFieldValue(patient, 'parentName'),
          email: getPatientFieldValue(patient.parent, 'email') || getPatientFieldValue(patient, 'email'),
          phoneNumber: getPatientFieldValue(patient.parent, 'phoneNumber') || getPatientFieldValue(patient, 'phoneNumber')
        };
        
        parentForm.reset(parentData);

        // Populate patient form with safe data extraction
        const birthDateValue = patient.birthDate ? 
          new Date(patient.birthDate).toISOString().split('T')[0] : '';

        const patientData = {
          firstName: getPatientFieldValue(patient, 'firstName'),
          lastName: getPatientFieldValue(patient, 'lastName'),
          birthDate: birthDateValue,
          gender: getPatientFieldValue(patient, 'gender'),
          address: getPatientFieldValue(patient, 'address')
        };
        
        patientForm.reset(patientData);

        console.log('Form populated with:', patientData);
        console.log('Parent form values after reset:', parentForm.getValues());
        console.log('Patient form values after reset:', patientForm.getValues());
      }, 0);
    }
  }, [patient, open]);

  const handleClose = () => {
    setCurrentStep(1);
    parentForm.reset();
    patientForm.reset();
    onClose();
  };

  const handleNextStep = async () => {
    try {
      const isValid = await parentForm.trigger();
      if (!isValid) {
        toast.error('Please fix the errors in the parent information form');
        return;
      }
      setCurrentStep(2);
      toast.success('Parent information validated successfully');
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation error occurred');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleUpdatePatient = async (patientData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const parentData = parentForm.getValues();
      
      const updateData = {
        parent: {
          fullName: sanitizeInput(parentData.fullName),
          email: sanitizeInput(parentData.email.toLowerCase()),
          phoneNumber: sanitizeInput(parentData.phoneNumber),
        },
        firstName: sanitizeInput(patientData.firstName),
        lastName: sanitizeInput(patientData.lastName),
        birthDate: new Date(patientData.birthDate).toISOString(),
        gender: patientData.gender,
        address: sanitizeInput(patientData.address) || 'swirate rhamna',
      };

      console.log('Sending update data:', updateData); // Debug log

      const response = await axiosInstance.patch(`/patients/${patient._id}`, updateData);

      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Failed to update patient');
      }

      toast.success('Patient updated successfully!');
      handleClose();
      onPatientUpdated?.();
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || error.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} handler={handleClose} size="xl" className="max-h-screen overflow-auto">
      <DialogHeader className="flex justify-between items-center">
        <div>
          <Typography variant="h5">
            Update Patient: {patient.firstName || 'Unknown'} {patient.lastName || 'Patient'}
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            {currentStep === 1 ? 'Update Parent Information' : 'Update Patient Information'} - Step {currentStep} of 2
          </Typography>
        </div>
        <div className="flex gap-2">
          <div className={`w-8 h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-8 h-2 rounded-full ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
        </div>
      </DialogHeader>

      <DialogBody className="flex flex-col gap-4 max-h-96 overflow-y-auto">
        {currentStep === 1 ? (
          // Parent Information Step
          <div className="space-y-4">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Parent/Guardian Details
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Controller
                  name="fullName"
                  control={parentForm.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        label="Full Name *"
                        error={!!fieldState.error}
                        value={field.value || ''}
                      />
                      <FieldError error={fieldState.error} />
                    </div>
                  )}
                />
              </div>

              <div>
                <Controller
                  name="email"
                  control={parentForm.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        label="Email Address *"
                        type="email"
                        error={!!fieldState.error}
                        value={field.value || ''}
                      />
                      <FieldError error={fieldState.error} />
                    </div>
                  )}
                />
              </div>
            </div>

            <div>
              <Controller
                name="phoneNumber"
                control={parentForm.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      label="Phone Number *"
                      error={!!fieldState.error}
                      value={field.value || ''}
                    />
                    <FieldError error={fieldState.error} />
                  </div>
                )}
              />
            </div>
          </div>
        ) : (
          // Patient Information Step
          <div className="space-y-4">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Patient Details
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>

                 {/* <Controller
                 type="hidden"
                name="first Name"
                control={parentForm.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      label="First Name *"
                      error={!!fieldState.error}
                      value={field.value || ''}
                    />
                    <FieldError error={fieldState.error} />
                  </div>
                )}
                /> */}
                <input type="hidden" value={patientForm.watch('firstName') || ''} />
                <Controller
                  name="firstName"
                  control={patientForm.control}
                  render={({ field, fieldState }) => {
                    console.log('FirstName field render:', { 
                      fieldValue: field.value, 
                      fieldName: field.name,
                      formValues: patientForm.getValues()
                    });
                    return (
                      <div>
                        <Input
                          {...field}
                          label="First Name *"
                          error={!!fieldState.error}
                          value={field.value || ''}
                          onChange={(e) => {
                            console.log('FirstName onChange:', e.target.value);
                            field.onChange(e);
                          }}
                        />
                        <FieldError error={fieldState.error} />
                      </div>
                    );
                  }}
                />
              </div>

              <div>

                <input type="hidden" value={patientForm.watch('firstName') || ''} />
                <Controller
                  name="lastName"
                  control={patientForm.control}
                  render={({ field, fieldState }) => {
                    console.log('LastName field render:', { 
                      fieldValue: field.value, 
                      fieldName: field.name,
                      formValues: patientForm.getValues()
                    });
                    return (
                      <div>
                        <Input
                          {...field}
                          label="Last Name *"
                          error={!!fieldState.error}
                          value={field.value || ''}
                          onChange={(e) => {
                            console.log('LastName onChange:', e.target.value);
                            field.onChange(e);
                          }}
                        />
                        <FieldError error={fieldState.error} />
                      </div>
                    );
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Controller
                  name="birthDate"
                  control={patientForm.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        label="Birth Date *"
                        type="date"
                        error={!!fieldState.error}
                        value={field.value || ''}
                      />
                      <FieldError error={fieldState.error} />
                    </div>
                  )}
                />
              </div>

              <div>
                <Controller
                  name="gender"
                  control={patientForm.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <select
                        {...field}
                        value={field.value || ''}
                        className={`w-full p-3 border rounded-md focus:outline-none ${
                          fieldState.error
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                      >
                        <option value="">Select Gender *</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <FieldError error={fieldState.error} />
                    </div>
                  )}
                />
              </div>
            </div>

            <div>
              <Controller
                name="address"
                control={patientForm.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      label="Address"
                      error={!!fieldState.error}
                      value={field.value || ''}
                    />
                    <FieldError error={fieldState.error} />
                  </div>
                )}
              />
            </div>

            {/* Summary of Patient Info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Typography variant="small" color="gray" className="font-semibold mb-2">
                Updated Patient Information:
              </Typography>
              <div className="space-y-1">
                <Typography variant="small" color="gray">
                  <strong>First Name:</strong> {patientForm.watch('firstName') || 'Not provided'}
                </Typography>
                <Typography variant="small" color="gray">
                  <strong>Last Name:</strong> {patientForm.watch('lastName') || 'Not provided'}
                </Typography>
                <Typography variant="small" color="gray">
                  <strong>Birth Date:</strong> {patientForm.watch('birthDate') || 'Not provided'}
                </Typography>
                <Typography variant="small" color="gray">
                  <strong>Gender:</strong> {patientForm.watch('gender') ? 
                    patientForm.watch('gender').charAt(0).toUpperCase() + patientForm.watch('gender').slice(1) : 
                    'Not provided'}
                </Typography>
                <Typography variant="small" color="gray">
                  <strong>Address:</strong> {patientForm.watch('address') || 'Not provided'}
                </Typography>
              </div>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="flex justify-between">
        <Button
          variant="outlined"
          color="red"
          onClick={handleClose}
          type="button"
        >
          Cancel
        </Button>

        <div className="flex gap-2">
          {currentStep === 2 && (
            <Button
              variant="outlined"
              color="gray"
              onClick={handlePreviousStep}
              type="button"
            >
              Previous
            </Button>
          )}

          {currentStep === 1 ? (
            <Button
              variant="gradient"
              color="blue"
              onClick={handleNextStep}
              type="button"
            >
              Next
            </Button>
          ) : (
            <Button
              variant="gradient"
              color="green"
              onClick={patientForm.handleSubmit(handleUpdatePatient)}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? 'Updating...' : 'Update Patient'}
            </Button>
          )}
        </div>
      </DialogFooter>
    </Dialog>
  );
}

export default UpdatePatientModal;