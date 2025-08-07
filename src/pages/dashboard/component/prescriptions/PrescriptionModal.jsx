
// FILE 4: components/prescriptions/PrescriptionModal.jsx
import React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Select,
  Option,
  Typography
} from "@material-tailwind/react";
import { COMMON_MEDICATIONS, FREQUENCY_OPTIONS } from '../../../../constant/patientConstants';
import { setDurationDays } from '../../../../utils/prescriptionUtils';

export const PrescriptionModal = ({ 
  open, 
  onClose, 
  title, 
  formData, 
  updateField, 
  onSubmit, 
  isValid, 
  loading, 
  isEdit = false 
}) => (
  <Dialog open={open} handler={onClose} size="lg">
    <DialogHeader>{title}</DialogHeader>
    <DialogBody divider className="max-h-[70vh] overflow-y-auto">
      <div className="grid gap-6">
        {/* Medication Field */}
        <Select
          label="Medication"
          value={formData.medication}
          onChange={(val) => updateField('medication', val)}
        >
          {COMMON_MEDICATIONS.map((med) => (
            <Option key={med} value={med}>
              {med}
            </Option>
          ))}
        </Select>
        
        {/* Dosage and Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Dosage (e.g., 500mg)"
            value={formData.dosage}
            onChange={(e) => updateField('dosage', e.target.value)}
            required
          />
          
          <Select
            label="Frequency"
            value={formData.frequency}
            onChange={(val) => updateField('frequency', val)}
          >
            {FREQUENCY_OPTIONS.map((freq) => (
              <Option key={freq} value={freq}>
                {freq}
              </Option>
            ))}
          </Select>
        </div>
        
        {/* End Date */}
        <div>
          <Input
            label="End Date (optional)"
            type="date"
            value={formData.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
          />
        </div>
        
        {/* Duration Shortcuts */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <Typography variant="small" className="font-semibold text-blue-gray-500 mb-2">
            💡 Quick Duration
          </Typography>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outlined"
              onClick={() => setDurationDays(7, new Date().toISOString().split('T')[0], updateField)}
            >
              7 days
            </Button>
            <Button 
              size="sm" 
              variant="outlined"
              onClick={() => setDurationDays(14, new Date().toISOString().split('T')[0], updateField)}
            >
              14 days
            </Button>
            <Button 
              size="sm" 
              variant="outlined"
              onClick={() => setDurationDays(30, new Date().toISOString().split('T')[0], updateField)}
            >
              30 days
            </Button>
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <Typography variant="small" className="mb-2 font-semibold text-blue-gray-500">
            Instructions/Notes
          </Typography>
          <textarea
            className="w-full p-3 border border-blue-gray-200 rounded-md resize-none"
            rows="3"
            placeholder="e.g., Take with food, avoid alcohol..."
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </div>
      </div>
    </DialogBody>
    <DialogFooter>
      <Button
        variant="text"
        color="red"
        onClick={onClose}
        className="mr-1"
        disabled={loading}
      >
        Cancel
      </Button>
      <Button 
        variant="gradient" 
        color="green" 
        onClick={onSubmit}
        disabled={!isValid || loading}
      >
        {loading ? "Processing..." : (isEdit ? "Update Prescription" : "Add Prescription")}
      </Button>
    </DialogFooter>
  </Dialog>
);