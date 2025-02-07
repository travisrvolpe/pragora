import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import { NavBarProps } from '../../types/layout';

interface Breadcrumb {
  path: string;
  label: string;
}

const NavBar: React.FC<NavBarProps> = () => {
  const location = useLocation();

  const getBreadcrumbs = (path: string): Breadcrumb[] => {
    const segments = path.replace(/\/$/, '').split('/').filter(Boolean);
    const breadcrumbs: Breadcrumb[] = [{ path: '/', label: 'Home' }];

    let currentPath = '';

    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);

      switch (segment) {
        case 'dialectica':
          label = 'Dialectica';
          break;
        case 'tap':
          label = 'TAP';
          break;
        case 'pan':
          label = 'PAN';
          break;
        case 'post':
          label = 'Post Title';
          break;
        case 'profile':
          label = 'My Profile';
          break;
        default:
          break;
      }

      breadcrumbs.push({
        path: currentPath,
        label
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <nav className="navbar">
      <div className="navbar-list">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && (
              <FaChevronRight className="text-gray-400 mx-2" />
            )}
            <Link
              to={crumb.path}
              className={
                index === breadcrumbs.length - 1
                  ? 'navbar-link active'
                  : 'navbar-link'
              }
            >
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;