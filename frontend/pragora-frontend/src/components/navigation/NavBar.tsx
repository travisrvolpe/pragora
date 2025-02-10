// src/components/navigation/NavBar.tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaChevronRight } from 'react-icons/fa'

export function NavBar() {
  const pathname = usePathname()

  const getBreadcrumbs = (path: string) => {
    const segments = path.split('/').filter(Boolean)
    return [
      { path: '/', label: 'Home' },
      ...segments.map((segment, index) => ({
        path: '/' + segments.slice(0, index + 1).join('/'),
        label: segment.charAt(0).toUpperCase() + segment.slice(1)
      }))
    ]
  }

  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <nav className="navbar">
      <div className="navbar-list">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <FaChevronRight className="text-gray-400 mx-2" />}
            <Link
              href={crumb.path}
              className={index === breadcrumbs.length - 1 ? 'navbar-link active' : 'navbar-link'}
            >
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </nav>
  )
}