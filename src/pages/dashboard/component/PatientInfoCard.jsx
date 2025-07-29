// Create: src/pages/dashboard/component/PatientInfoCard.jsx

import React from 'react';
import { Typography, Tooltip } from "@material-tailwind/react";
import { PencilIcon } from "@heroicons/react/24/solid";

export const PatientInfoCard = ({ patientData }) => (
  <div>
    <div className="mb-4 flex items-center justify-between">
      <Typography variant="h6" color="blue-gray">
        Patient Information
      </Typography>
      <Tooltip content="Edit Patient Info">
        <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500" />
      </Tooltip>
    </div>
    <Typography variant="small" className="mb-4 font-normal text-blue-gray-500">
      Medical records and contact information for {patientData.name}. Complete patient profile with emergency contacts and medical history.
    </Typography>
    
    <div className="space-y-4">
      {Object.entries({
        "full name": patientData.name,
        mobile: patientData.phoneNumber,
        email: patientData.email,
        location: patientData.address,
        "emergency contact": patientData.emergencyContact,
        allergies: patientData.allergies,
        "chronic conditions": patientData.chronicConditions,
      }).map(([key, value]) => (
        <div key={key} className="flex items-center gap-4">
          <Typography variant="small" className="w-48 font-semibold text-blue-gray-500">
            {key}:
          </Typography>
          <Typography variant="small" className="font-normal text-blue-gray-500">
            {value}
          </Typography>
        </div>
      ))}
    </div>
  </div>
);