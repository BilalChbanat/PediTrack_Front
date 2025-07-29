import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Avatar,
  Chip,
  Card,
  CardBody,
  CardHeader,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  ClockIcon,
  MapPinIcon,
  HeartIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

const PatientDetailsModal = ({ open, onClose, patient }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!patient) return null;

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get appointment status
  const getAppointmentStatus = () => {
    if (!patient.appointments || patient.appointments.length === 0) {
      return { status: "No appointments", color: "gray" };
    }
    
    const nextAppointment = patient.appointments[0];
    const appointmentDate = new Date(nextAppointment.date);
    const today = new Date();
    
    if (appointmentDate < today) {
      return { status: "Past appointment", color: "red" };
    } else if (appointmentDate.toDateString() === today.toDateString()) {
      return { status: "Today", color: "green" };
    } else {
      return { status: "Upcoming", color: "blue" };
    }
  };

  const appointmentStatus = getAppointmentStatus();

  return (
    <Dialog 
      open={open} 
      handler={onClose} 
      size="xl" 
      className="max-h-[90vh] overflow-hidden"
    >
      <DialogHeader className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-4">
          <Avatar 
            src={patient.img || "/api/placeholder/64/64"} 
            alt={`${patient.firstName} ${patient.lastName}`}
            size="lg"
            variant="rounded"
          />
          <div>
            <Typography variant="h4" color="blue-gray">
              {patient.firstName} {patient.lastName}
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              Patient ID: {patient._id}
            </Typography>
          </div>
        </div>
        <Chip
          value={appointmentStatus.status}
          color={appointmentStatus.color}
          variant="gradient"
        />
      </DialogHeader>

      <DialogBody className="overflow-y-auto max-h-[60vh] p-0">
        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "appointments"
                ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "contact"
                ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Contact & Family
          </button>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Patient Basic Info */}
              <Card>
                <CardHeader variant="gradient" color="blue-gray" className="mb-4 p-4">
                  <Typography variant="h6" color="white" className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Patient Information
                  </Typography>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 text-sm font-medium text-gray-600">Full Name:</div>
                        <div className="text-sm font-semibold text-blue-gray-800">
                          {patient.firstName} {patient.lastName}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 text-sm font-medium text-gray-600">Gender:</div>
                        <div className="text-sm text-blue-gray-700">
                          {patient.gender || "Not specified"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 text-sm font-medium text-gray-600">Age:</div>
                        <div className="text-sm text-blue-gray-700">
                          {calculateAge(patient.birthDate)} years old
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <div className="text-sm font-medium text-gray-600">Birth Date:</div>
                        <div className="text-sm text-blue-gray-700">
                          {formatDate(patient.birthDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                        <div className="text-sm font-medium text-gray-600">Address:</div>
                        <div className="text-sm text-blue-gray-700">
                          {patient.address || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Health Summary */}
              <Card>
                <CardHeader variant="gradient" color="green" className="mb-4 p-4">
                  <Typography variant="h6" color="white" className="flex items-center gap-2">
                    <HeartIcon className="h-5 w-5" />
                    Health Summary
                  </Typography>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Typography variant="small" color="gray" className="font-medium mb-2">
                        Medical History
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {patient.medicalHistory || "No medical history recorded"}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="gray" className="font-medium mb-2">
                        Current Medications
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {patient.medications || "No current medications"}
                      </Typography>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div className="space-y-4">
              <Card>
                <CardHeader variant="gradient" color="purple" className="mb-4 p-4">
                  <Typography variant="h6" color="white" className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    Appointment History
                  </Typography>
                </CardHeader>
                <CardBody className="pt-0">
                  {patient.appointments && patient.appointments.length > 0 ? (
                    <div className="space-y-4">
                      {patient.appointments.map((appointment, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                {formatDate(appointment.date)}
                              </Typography>
                              <Typography variant="small" color="gray">
                                Time: {appointment.time}
                              </Typography>
                              <Typography variant="small" color="gray">
                                Type: {appointment.type || "Consultation"}
                              </Typography>
                              {appointment.notes && (
                                <Typography variant="small" color="blue-gray" className="mt-1">
                                  Notes: {appointment.notes}
                                </Typography>
                              )}
                            </div>
                            <Chip
                              value={new Date(appointment.date) > new Date() ? "Upcoming" : "Completed"}
                              color={new Date(appointment.date) > new Date() ? "green" : "gray"}
                              size="sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <Typography variant="h6" color="gray" className="mb-2">
                        No Appointments
                      </Typography>
                      <Typography variant="small" color="gray">
                        This patient has no scheduled appointments.
                      </Typography>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}

          {/* Contact & Family Tab */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              {/* Patient Contact */}
              <Card>
                <CardHeader variant="gradient" color="orange" className="mb-4 p-4">
                  <Typography variant="h6" color="white" className="flex items-center gap-2">
                    <PhoneIcon className="h-5 w-5" />
                    Contact Information
                  </Typography>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                      <div>
                        <Typography variant="small" color="gray" className="font-medium">
                          Email Address
                        </Typography>
                        <Typography variant="small" color="blue-gray">
                          {patient.email || "Not provided"}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-gray-500" />
                      <div>
                        <Typography variant="small" color="gray" className="font-medium">
                          Phone Number
                        </Typography>
                        <Typography variant="small" color="blue-gray">
                          {patient.phoneNumber || "Not provided"}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Parent/Guardian Information */}
              {patient.parent && (
                <Card>
                  <CardHeader variant="gradient" color="teal" className="mb-4 p-4">
                    <Typography variant="h6" color="white" className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Parent/Guardian Information
                    </Typography>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <Typography variant="small" color="gray" className="font-medium mb-1">
                          Full Name
                        </Typography>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {patient.parent.fullName || "Not provided"}
                        </Typography>
                      </div>
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <Typography variant="small" color="gray" className="font-medium">
                            Email Address
                          </Typography>
                          <Typography variant="small" color="blue-gray">
                            {patient.parent.email || "Not provided"}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <Typography variant="small" color="gray" className="font-medium">
                            Phone Number
                          </Typography>
                          <Typography variant="small" color="blue-gray">
                            {patient.parent.phoneNumber || "Not provided"}
                          </Typography>
                        </div>
                      </div>
                      <div>
                        <Typography variant="small" color="gray" className="font-medium mb-1">
                          Relationship
                        </Typography>
                        <Typography variant="small" color="blue-gray">
                          {patient.parent.relationship || "Parent/Guardian"}
                        </Typography>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <DocumentTextIcon className="h-4 w-4" />
          <span>Last updated: {formatDate(patient.updatedAt || patient.createdAt)}</span>
        </div>
        <Button variant="gradient" color="blue" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default PatientDetailsModal;