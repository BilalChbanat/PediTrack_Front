import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import { LogOut } from "lucide-react";
import { logout } from "@/data/logout";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");

  // Fonction pour traduire les noms de pages
  const getPageDisplayName = (pageName) => {
    const translations = {
      'dashboard': 'tableau de bord',
      'home': 'accueil',
      'patients': 'patients',
      'families': 'familles',
      'notifications': 'notifications',
      'appointment-calendar': 'calendrier des rendez-vous',
      'settings': 'paramètres',
      'profile': 'profil'
    };
    return translations[pageName] || pageName;
  };

  const getLayoutDisplayName = (layoutName) => {
    const translations = {
      'dashboard': 'tableau de bord',
      'auth': 'authentification'
    };
    return translations[layoutName] || layoutName;
  };

  const displayLayout = getLayoutDisplayName(layout);
  const displayPage = getPageDisplayName(page);

  // Fonction de déconnexion (à adapter selon votre logique d'authentification)
  const handleLogout = () => {

    logout()
    .then(() => {
      // Redirection ou action après la déconnexion
      window.location.href = '/auth/sign-in'; // Redirige vers la page de connexion
    })
    .catch((error) => {
      console.error("Erreur lors de la déconnexion :", error);
      
    });

  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {displayLayout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {displayPage}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray">
            {displayPage}
          </Typography>
        </div>
        <div className="flex items-center">
          {/* <div className="mr-auto md:mr-4 md:w-56">
            <Input label="Rechercher" />
          </div> */}
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
          <Button
            variant="text"
            color="blue-gray"
            className="hidden items-center gap-1 px-4 xl:flex normal-case"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 text-blue-gray-500" />
            Se Déconnecter
          </Button>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={handleLogout}
          >
            <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton>
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <BellIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0">
               
              <MenuItem className="flex items-center gap-3">
                Pas de notifications
              </MenuItem>
              * <MenuItem className="flex items-center gap-3">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/team-2.jpg"
                  alt="item-1"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>Nouveau message</strong> de Laur
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> il y a 13 minutes
                  </Typography>
                </div>
              </MenuItem> *
            </MenuList>
          </Menu>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;