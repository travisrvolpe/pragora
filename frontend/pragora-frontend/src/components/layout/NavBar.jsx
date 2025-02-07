import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

const NavBar = () => {
  const location = useLocation();

  const getBreadcrumbs = (path) => {
    // Remove trailing slash and split path into segments
    const segments = path.replace(/\/$/, '').split('/').filter(Boolean);
    
    // Always start with Home
    const breadcrumbs = [{ path: '/', label: 'Home' }];
    
    let currentPath = '';
    
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      
      // Convert path segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Handle special cases
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
          // This would need to be replaced with actual post title
          label = 'Post Title';
          break;
        case 'profile':
          label = 'My Profile';
          break;
        default:
          // Keep the capitalized version
          break;
      }
      
      breadcrumbs.push({
        path: currentPath,
        label: label
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