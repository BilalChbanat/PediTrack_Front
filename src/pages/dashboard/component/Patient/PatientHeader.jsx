// 2. components/PatientHeader.jsx
import React from 'react';
import { Avatar, Typography, Tabs, TabsHeader, Tab } from "@material-tailwind/react";
import { HomeIcon, DocumentTextIcon, ShieldCheckIcon, ChartBarIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";

const PatientHeader = ({ patientData, activeTab, setActiveTab }) => {
  return (
    <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
      <div className="flex items-center gap-6">
        <Avatar
          src={patientData.avatar}
          alt={patientData.name}
          size="xl"
          variant="rounded"
          className="rounded-lg shadow-lg shadow-blue-gray-500/40"
        />
        <div>
          <Typography variant="h5" color="blue-gray" className="mb-1">
            {patientData.name}
          </Typography>
          <Typography variant="small" className="font-normal text-blue-gray-600">
            {patientData.age} • {patientData.gender} • Blood Type: {patientData.bloodType}
          </Typography>
        </div>
      </div>
      <div className="w-100 lg:w-1/3">
        <Tabs value={activeTab}>
          <TabsHeader>
            <Tab value="overview" onClick={() => setActiveTab("overview")}>
              <HomeIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
              Overview
            </Tab>
            <Tab value="documents" onClick={() => setActiveTab("documents")}>
              <DocumentTextIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
              Documents
            </Tab>
            <Tab value="vaccinations" onClick={() => setActiveTab("vaccinations")}>
              <ShieldCheckIcon className="-mt-0.5 mr-2 inline-block h-5 w-5" />
              Vaccinations
            </Tab>
            <Tab value="growth" onClick={() => setActiveTab("growth")}>
              <ChartBarIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
              Growth
            </Tab>
            <Tab value="appointments" onClick={() => setActiveTab("appointments")}>
              <CalendarDaysIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
              Appointments
            </Tab>
            <Tab value="prescriptions" onClick={() => setActiveTab("prescriptions")}>
              <DocumentTextIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
              Prescriptions
            </Tab>
          </TabsHeader>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientHeader;