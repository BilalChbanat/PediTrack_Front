import PropTypes from "prop-types";
import { Typography } from "@material-tailwind/react";
import { HeartIcon } from "@heroicons/react/24/solid";

export function Footer({ brandName, brandLink, routes }) {
  const year = new Date().getFullYear();

  return (
    <footer className="py-2 mt-auto bg-gray-50 border-t border-gray-200">
      <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
        <Typography variant="small" className="font-normal text-inherit">
          &copy; {year}, créé par{" "}
          <a
            href={'https://www.pchalle.com/'}
            target="_blank"
            className="transition-colors hover:text-blue-500 font-bold"
          >
            PC HALLE
          </a>{" "}
          
        </Typography>
        <ul className="flex items-center gap-4">
          {routes.map(({ name, path }) => (
            <li key={name}>
              <Typography
                as="a"
                href={path}
                target="_blank"
                variant="small"
                className="py-0.5 px-1 font-normal text-inherit transition-colors hover:text-blue-500"
              >
                {name}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  brandName: "Centre de Soins Pédiatriques",
  brandLink: "https://www.pchalle.com/",
  routes: [
    { name: "À Propos", path: "https://www.pchalle.com/" },
    { name: "Blog", path: "https://www.pchalle.com/" },
    { name: "Licence", path: "https://www.pchalle.com/" },
  ],
};

Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
};

Footer.displayName = "/src/widgets/layout/footer.jsx";

export default Footer;