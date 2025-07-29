import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  // Filter routes to only show dashboard pages with showInSidebar: true
  const filteredRoutes = routes
    .filter(routeGroup => routeGroup.layout === "dashboard")
    .map(routeGroup => ({
      ...routeGroup,
      pages: routeGroup.pages.filter(page => page.showInSidebar !== false)
    }));

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div className="relative">
        <Link to="/" className="py-6 px-8 text-center flex items-center gap-3 justify-center">
          <img src={brandImg} alt="brand" className="h-8 w-8 object-contain" />
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className="m-4">
        {filteredRoutes.length === 0 ? (
          <Typography
            variant="small"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
            className="opacity-70 text-center mt-8"
          >
            No navigation items available.
          </Typography>
        ) : (
          filteredRoutes.map(({ layout, title, pages }, key) => (
            <ul key={key} className="mb-8 flex flex-col gap-3">
              {title && (
                <li className="mx-3.5 mt-4 mb-2">
                  <Typography
                    variant="small"
                    color={sidenavType === "dark" ? "white" : "blue-gray"}
                    className="font-black uppercase opacity-75"
                  >
                    {title}
                  </Typography>
                </li>
              )}
              {pages.map(({ icon, name, path, description }) => (
                <li key={name}>
                  <NavLink to={`/${layout}${path}`}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={
                          isActive
                            ? sidenavColor
                            : sidenavType === "dark"
                            ? "white"
                            : "blue-gray"
                        }
                        className="flex items-center gap-4 px-4 capitalize"
                        fullWidth
                      >
                        {icon}
                        <div className="flex flex-col items-start">
                          <Typography
                            color="inherit"
                            className="font-medium capitalize"
                          >
                            {name}
                          </Typography>
                          {description && (
                            <Typography
                              variant="small"
                              color="inherit"
                              className="text-xs opacity-70"
                            >
                              {description}
                            </Typography>
                          )}
                        </div>
                      </Button>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          ))
        )}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "PediTrack",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;



// import PropTypes from "prop-types";
// import { Link, NavLink } from "react-router-dom";
// import { XMarkIcon } from "@heroicons/react/24/outline";
// import {
//   Avatar,
//   Button,
//   IconButton,
//   Typography,
// } from "@material-tailwind/react";
// import { useMaterialTailwindController, setOpenSidenav } from "@/context";

// export function Sidenav({ brandImg, brandName, routes }) {
//   const [controller, dispatch] = useMaterialTailwindController();
//   const { sidenavColor, sidenavType, openSidenav } = controller;
//   const sidenavTypes = {
//     dark: "bg-gradient-to-br from-gray-800 to-gray-900",
//     white: "bg-white shadow-sm",
//     transparent: "bg-transparent",
//   };

//   return (
//     <aside
//       className={`${sidenavTypes[sidenavType]} ${
//         openSidenav ? "translate-x-0" : "-translate-x-80"
//       } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
//     >
//       <div
//         className={`relative`}
//       >
//         <Link to="/" className="py-6 px-8 text-center">
//           <Typography
//             variant="h6"
//             color={sidenavType === "dark" ? "white" : "blue-gray"}
//           >
//             {brandName}
//           </Typography>
//         </Link>
//         <IconButton
//           variant="text"
//           color="white"
//           size="sm"
//           ripple={false}
//           className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
//           onClick={() => setOpenSidenav(dispatch, false)}
//         >
//           <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
//         </IconButton>
//       </div>
//       <div className="m-4">
//         {routes.map(({ layout, title, pages }, key) => (
//           <ul key={key} className="mb-4 flex flex-col gap-1">
//             {title && (
//               <li className="mx-3.5 mt-4 mb-2">
//                 <Typography
//                   variant="small"
//                   color={sidenavType === "dark" ? "white" : "blue-gray"}
//                   className="font-black uppercase opacity-75"
//                 >
//                   {title}
//                 </Typography>
//               </li>
//             )}
//             {pages.map(({ icon, name, path }) => (
//               <li key={name}>
//                 <NavLink to={`/${layout}${path}`}>
                
//                   {({ isActive }) => (
//                     <Button
//                       variant={isActive ? "gradient" : "text"}
//                       color={
//                         isActive
//                           ? sidenavColor
//                           : sidenavType === "dark"
//                           ? "white"
//                           : "blue-gray"
//                       }
//                       className="flex items-center gap-4 px-4 capitalize"
//                       fullWidth
//                     >
//                       {icon}
//                       <Typography
//                         color="inherit"
//                         className="font-medium capitalize"
//                       >
//                         {name}
//                       </Typography>
//                     </Button>
//                   )}
//                 </NavLink>
//               </li>
//             ))}
//           </ul>
//         ))}
//       </div>
//     </aside>
//   );
// }

// Sidenav.defaultProps = {
//   brandImg: "/img/logo-ct.png",
//   brandName: " PediTrack",
// };

// Sidenav.propTypes = {
//   brandImg: PropTypes.string,
//   brandName: PropTypes.string,
//   routes: PropTypes.arrayOf(PropTypes.object).isRequired,
// };

// Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

// export default Sidenav;
