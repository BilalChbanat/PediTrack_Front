import React, { useState } from 'react';
import {
  Typography,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from "@material-tailwind/react";
import {
  CurrencyDollarIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import AppointmentPricing from './AppointmentPricing';
import LogoUpload from './LogoUploadModal';
import BMICategoryEditor from '../component/BMICategoryEditor';
import { ScaleIcon } from 'lucide-react';

const SettingsPage = ({
  title = "Gestion des Paramètres",
  description = "Gérez vos logos et tarifs de rendez-vous"
}) => {
  const [activeTab, setActiveTab] = useState("logo");

  const handleLogoSubmit = (result) => {
    // Gérer la soumission du logo
    console.log('Logo uploaded successfully:', result);
    // Vous pouvez ajouter ici la logique pour mettre à jour l'état global ou faire des actions supplémentaires
  };

  const handleAppointmentChange = (updatedAppointments) => {
    // Gérer les changements des tarifs de rendez-vous
    console.log('Appointments updated:', updatedAppointments);
    // Vous pouvez ajouter ici la logique pour sauvegarder dans la base de données ou l'état global
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <div>
        <Typography variant="h3" color="blue-gray" className="mb-2">
          {title}
        </Typography>
        <Typography variant="small" className="text-blue-gray-500 font-normal mb-6">
          {description}
        </Typography>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsHeader className="rounded-none border-b border-blue-gray-50 bg-transparent p-0">
          <Tab
            value="logo"
            onClick={() => setActiveTab("logo")}
            className={activeTab === "logo" ? "text-gray-900" : ""}
          >
            <div className="flex items-center gap-2">
              <CogIcon className="h-5 w-5" />
              Gestion du Logo
            </div>
          </Tab>
          <Tab
            value="pricing"
            onClick={() => setActiveTab("pricing")}
            className={activeTab === "pricing" ? "text-gray-900" : ""}
          >
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5" />
              Tarifs des Rendez-vous
            </div>
          </Tab>
          <Tab
  value="BMI"
  onClick={() => setActiveTab("BMI")}
  className={activeTab === "BMI" ? "text-gray-900" : ""}
>
  <div className="flex items-center gap-2">
    <ScaleIcon className="h-5 w-5" />
    Catégories IMC
  </div>
</Tab>
        </TabsHeader>

        <TabsBody>
          <TabPanel value="logo" className="p-0">
            <div className="mt-6">
              <LogoUpload onSubmit={handleLogoSubmit} />
            </div>
          </TabPanel>

          <TabPanel value="pricing" className="p-0">
            <div className="mt-6">
              <AppointmentPricing onAppointmentChange={handleAppointmentChange} />
            </div>
          </TabPanel>
            <TabPanel value="BMI" className="p-0">
            <div className="mt-6">
              <BMICategoryEditor />
            </div>
          </TabPanel>
        </TabsBody>
      </Tabs>
    </div>
  );
};

export default SettingsPage;