
// FILE 5: components/prescriptions/ViewPrescriptionModal.jsx
import React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Chip
} from "@material-tailwind/react";
import { PRESCRIPTION_STATUS } from '@/prescriptionConstants';
import { getPrescriptionStatus } from '@/utils/prescriptionUtils';


export const ViewPrescriptionModal = ({ open, onClose, prescription }) => (
  <Dialog open={open} handler={onClose}>
    <DialogHeader>Prescription Details</DialogHeader>
    <DialogBody divider>
      {prescription && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="blue-gray">
              {prescription.medication}
            </Typography>
            <Chip
              value={PRESCRIPTION_STATUS[getPrescriptionStatus(prescription)].label}
              color={PRESCRIPTION_STATUS[getPrescriptionStatus(prescription)].color}
              size="md"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                Dosage:
              </Typography>
              <Typography>{prescription.dosage}</Typography>
            </div>
            
            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                Frequency:
              </Typography>
              <Typography>{prescription.frequency}</Typography>
            </div>
            
            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                Start Date:
              </Typography>
              <Typography>{formatDate(prescription.startDate)}</Typography>
            </div>
            
            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                End Date:
              </Typography>
              <Typography>
                {prescription.endDate ? formatDate(prescription.endDate) : "Ongoing"}
              </Typography>
            </div>
          </div>
          
          {prescription.notes && (
            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                Notes:
              </Typography>
              <Typography>{prescription.notes}</Typography>
            </div>
          )}
        </div>
      )}
    </DialogBody>
    <DialogFooter>
      <Button variant="outlined" onClick={onClose}>
        Close
      </Button>
    </DialogFooter>
  </Dialog>
);