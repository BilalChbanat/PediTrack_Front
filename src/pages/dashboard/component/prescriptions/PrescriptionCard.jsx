import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem
} from "@material-tailwind/react";
import {
  BeakerIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from "@heroicons/react/24/solid";
import { getPrescriptionStatus, getDaysRemaining, formatDate } from '../../utils/prescriptionUtils';
import { PRESCRIPTION_STATUS } from '../../constants/prescriptionConstants';

const statusIcons = {
  active: CheckCircleIcon,
  expired: XCircleIcon,
  ending_soon: ClockIcon
};

export const PrescriptionCard = ({ prescription, onView, onEdit, onDelete }) => {
  const status = getPrescriptionStatus(prescription);
  const statusConfig = PRESCRIPTION_STATUS[status];
  const IconComponent = statusIcons[status];

  return (
    <Card className="border border-blue-gray-50 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-blue-50 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <BeakerIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <Typography variant="h6" color="blue-gray">
              {prescription.medication}
            </Typography>
            <Typography variant="small" className="text-blue-gray-500">
              {prescription.dosage} • {prescription.frequency}
            </Typography>
          </div>
        </div>
        
        <Menu>
          <MenuHandler>
            <Button variant="text" size="sm">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </Button>
          </MenuHandler>
          <MenuList>
            <MenuItem onClick={() => onView(prescription)}>
              View Details
            </MenuItem>
            <MenuItem onClick={() => onEdit(prescription)}>
              Edit
            </MenuItem>
            <MenuItem 
              onClick={() => onDelete(prescription)}
              className="text-red-500"
            >
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      </CardHeader>
      
      <CardBody className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                Duration
              </Typography>
              <Typography variant="small">
                {formatDate(prescription.startDate)} - {prescription.endDate ? formatDate(prescription.endDate) : "Ongoing"}
              </Typography>
            </div>
            <Chip
              value={statusConfig.label}
              color={statusConfig.color}
              size="sm"
              icon={<IconComponent className="h-3 w-3" />}
            />
          </div>
          
          {prescription.notes && (
            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-500">
                Notes
              </Typography>
              <Typography variant="small" className="text-blue-gray-600">
                {prescription.notes}
              </Typography>
            </div>
          )}
          
          <div className="flex justify-between text-xs text-blue-gray-500">
            <span>
              {getDaysRemaining(prescription.endDate)} days remaining
            </span>
            <span>
              Created {formatDate(prescription.createdAt)}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};