// Create: src/pages/dashboard/component/RecentActivitiesCard.jsx

import React from 'react';
import { Typography, Card, CardBody } from "@material-tailwind/react";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

export const RecentActivitiesCard = ({ processedAppointments }) => (
  <div>
    <Typography variant="h6" color="blue-gray" className="mb-3">
      Recent Activities
    </Typography>
    <ul className="flex flex-col gap-4">
      {processedAppointments.length > 0 ? (
        processedAppointments.map((props, index) => (
          <Card key={index} className="border border-blue-gray-50">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-2 rounded-full">
                  <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    {props.name}
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500">
                    {props.message}
                  </Typography>
                </div>
                <div className="ml-auto text-right">
                  <Typography variant="small" className="text-blue-gray-500">
                    {props.time}
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-500">
                    {props.hour}
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      ) : (
        <Typography variant="small" className="text-blue-gray-500">
          No recent activities
        </Typography>
      )}
    </ul>
  </div>
);