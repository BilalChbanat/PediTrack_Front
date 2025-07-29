// FILE 6: components/prescriptions/PrescriptionsTab.jsx
import React, { useMemo } from 'react';
import { Typography, Button } from "@material-tailwind/react";
import { PlusIcon, BeakerIcon } from "@heroicons/react/24/solid";
import { PrescriptionCard } from './PrescriptionCard';
import { getPrescriptionStatus } from '../../utils/prescriptionUtils';

const PrescriptionSection = ({ title, prescriptions, onView, onEdit, onDelete }) => (
  <div>
    <Typography variant="h6" color="blue-gray" className="mb-4">
      {title}
    </Typography>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {prescriptions.map((prescription, index) => (
        <PrescriptionCard
          key={prescription._id || index}
          prescription={prescription}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  </div>
);

const EmptyPrescriptionsState = ({ onAddRecord }) => (
  <div className="text-center py-16">
    <BeakerIcon className="h-16 w-16 mx-auto text-blue-gray-300 mb-4" />
    <Typography variant="h5" color="blue-gray" className="mb-2">
      No Prescriptions Found
    </Typography>
    <Typography variant="small" className="text-blue-gray-500 mb-6">
      Start tracking medications by adding the first prescription
    </Typography>
    <Button variant="gradient" onClick={onAddRecord}>
      Add First Prescription
    </Button>
  </div>
);

export const PrescriptionsTab = ({ 
  prescriptions, 
  handleOpenCreate,
  handleOpenView,
  handleOpenEdit,
  handleOpenDelete,
  loading
}) => {
  const groupedPrescriptions = useMemo(() => {
    const groups = { active: [], expired: [], ending_soon: [] };
    
    prescriptions.forEach(prescription => {
      const status = getPrescriptionStatus(prescription);
      groups[status].push(prescription);
    });
    
    return groups;
  }, [prescriptions]);

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h4" color="blue-gray">
            Prescription Management
          </Typography>
          <Typography variant="small" className="text-blue-gray-500">
            Current medications and prescription history
          </Typography>
        </div>
        <Button variant="gradient" onClick={handleOpenCreate}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add New Prescription
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <Typography>Loading prescriptions...</Typography>
        </div>
      ) : prescriptions.length === 0 ? (
        <EmptyPrescriptionsState onAddRecord={handleOpenCreate} />
      ) : (
        <div className="space-y-8">
          {/* Active Prescriptions */}
          {groupedPrescriptions.active.length > 0 && (
            <PrescriptionSection
              title="🟢 Active Prescriptions"
              prescriptions={groupedPrescriptions.active}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          )}
          
          {/* Ending Soon */}
          {groupedPrescriptions.ending_soon.length > 0 && (
            <PrescriptionSection
              title="🟡 Ending Soon"
              prescriptions={groupedPrescriptions.ending_soon}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          )}
          
          {/* Expired */}
          {groupedPrescriptions.expired.length > 0 && (
            <PrescriptionSection
              title="⚫ Expired"
              prescriptions={groupedPrescriptions.expired}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          )}
        </div>
      )}
    </div>
  );
};
