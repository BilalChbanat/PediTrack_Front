import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import ForgotPassword from "./pages/auth/forget-password";
import ResetPassword from "./pages/auth/reset-password";
import Patient from "./pages/dashboard/patient";
import PatientDetail from "./pages/dashboard/PatientDetail";
import Families from "./pages/dashboard/familes";
import { UsersIcon } from "@heroicons/react/24/solid";
import AppointmentsPage from "./pages/appointmentsPage";
import AppointmentManagement from "./pages/appointmentsPage";
import LogoUploadPage from "./pages/dashboard/sitting/LogoUploadModal";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import ProtectedRoute from "./gard";
import DocumentViewer from "./pages/dashboard/component/DocumentViewer";
import SettingsPage from "./pages/dashboard/sitting/SettingsPage";
import { CalendarDaysIcon } from "lucide-react";

// Helper to mark protected routes - now wraps with ProtectedRoute component
const protectedRoute = (route) => ({
  ...route,
  element: <ProtectedRoute>{route.element}</ProtectedRoute>,
  protected: true
});

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      protectedRoute({
        icon: <HomeIcon {...icon} />,
        name: "tableau de bord",
        path: "/home",
        element: <Home />,
        showInSidebar: true,
      }),
      protectedRoute({
        path: '/patients/details/:id',
        element: <PatientDetail />,
        showInSidebar: false,
      }),
      protectedRoute({
        path: '/documents/:id',
        element: <DocumentViewer />,
        showInSidebar: false,
      }),
      protectedRoute({
        icon: <TableCellsIcon {...icon} />,
        name: "patients",
        path: "/patients",
        element: <Patient />,
        showInSidebar: true,
      }),
      protectedRoute({
        icon: <UsersIcon {...icon} />,
        name: "familles",
        path: "/families",
        element: <Families />,
        showInSidebar: true,
      }),
      // protectedRoute({
      //   icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      //   showInSidebar: true,
      // }),
      protectedRoute({
        icon: <CalendarDaysIcon {...icon} />, // Use a calendar-related icon for appointments
        name: "rendez-vous",
        path: "/appointment-calendar",
        element: <AppointmentManagement />,
        showInSidebar: true,
      }),
      protectedRoute({
        icon: <Cog6ToothIcon {...icon} />,
        name: "paramètres",
        path: "/settings",
        element: <SettingsPage />,
        showInSidebar: true,
      }),

    ],
  },
  {
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "se connecter",
        path: "/sign-in",
        element: <SignIn />,
        showInSidebar: false,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "s'inscrire",
        path: "/sign-up",
        element: <SignUp />,
        showInSidebar: false,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "password oublié",
        path: "/forget-password",
        element: <ForgotPassword />,
        showInSidebar: false,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "réinitialiser password",
        path: "/reset-password",
        element: <ResetPassword />,
        showInSidebar: false,
      },
    ],
  },
];

export default routes;

// import {
//   HomeIcon,
//   UserCircleIcon,
//   TableCellsIcon,
//   InformationCircleIcon,
//   ServerStackIcon,
//   RectangleStackIcon,
// } from "@heroicons/react/24/solid";
// import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
// import { SignIn, SignUp } from "@/pages/auth";
// import ForgotPassword from "./pages/auth/forget-password";
// import ResetPassword from "./pages/auth/reset-password";
// import Patient from "./pages/dashboard/patient";
// import PatientDetail from "./pages/dashboard/PatientDetail";
// import Families from "./pages/dashboard/familes";
// import { UsersIcon } from "@heroicons/react/24/solid";
// import AppointmentsPage from "./pages/appointmentsPage";
// import AppointmentManagement from "./pages/appointmentsPage";
// import LogoUploadPage from "./pages/dashboard/componet/Patient/Prescriptions/LogoUploadModal";
// import { Cog6ToothIcon } from "@heroicons/react/24/outline";

// const icon = {
//   className: "w-5 h-5 text-inherit",
// };

// export const routes = [
//   {
//     layout: "dashboard",
//     pages: [
//       {
//         icon: <HomeIcon {...icon} />,
//         name: "tableau de bord",
//         path: "/home",
//         element: <Home />,
//       },
//       {
//         path: '/patients/details/:id',
//         element: <PatientDetail />,
//       },
//       // {
//       //   icon: <UserCircleIcon {...icon} />,
//       //   name: "profil",
//       //   path: "/profile",
//       //   element: <Profile />,
//       // },
//       {
//         icon: <TableCellsIcon {...icon} />,
//         name: "patients",
//         path: "/patients",
//         element: <Patient />,
//       },
//       {
//         icon: <UsersIcon {...icon} />,
//         name: "familles",
//         path: "/families",
//         element: <Families />,
//       },
//       {
//         icon: <InformationCircleIcon {...icon} />,
//         name: "notifications",
//         path: "/notifications",
//         element: <Notifications />,
//       },
//       {
//         icon: <TableCellsIcon {...icon} />,
//         name: "calendrier des rendez-vous",
//         path: "/appointment-calendar",
//         element: <AppointmentManagement />,
//       },
//       {
//         icon: <Cog6ToothIcon {...icon} />,
//         name: "paramètres",
//         path: "/settings",
//         element: <LogoUploadPage/>,
//       },
//     ],
//   },
//  {
//     layout: "auth",
//     pages: [
//       {
//         name: "se connecter",
//         path: "/sign-in",
//         element: <SignIn />,
//         hideFromSidebar: true, // Propriété ajoutée
//       },
//       {
//         name: "s'inscrire",
//         path: "/sign-up",
//         element: <SignUp />,
//         hideFromSidebar: true, // Propriété ajoutée
//       },
//       {
//         name: "password oublié",
//         path: "/forget-password",
//         element: <ForgotPassword />,
//         hideFromSidebar: true, // Propriété ajoutée
//       },
//       {
//         name: "réinitialiser password",
//         path: "/reset-password",
//         element: <ResetPassword />,
//         hideFromSidebar: true, // Propriété ajoutée
//       },
//     ],
//   },
// ];

// export default routes;



