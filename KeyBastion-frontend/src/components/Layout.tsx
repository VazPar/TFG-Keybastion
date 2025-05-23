import { Fragment, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  ChartBarIcon,
  ShareIcon,
  UserGroupIcon,
  ClockIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

// Navigation items for regular users
const userNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Password Generator', href: '/password-generator', icon: KeyIcon },
  { name: 'Passwords', href: '/passwords', icon: ShieldCheckIcon },
  { name: 'Shared Credentials', href: '/shared-credentials', icon: ShareIcon },
]

// Navigation items for admin users
const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'User Management', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Activity Logs', href: '/admin/activity', icon: ClockIcon },
  { name: 'Global Categories', href: '/admin/categories', icon: FolderIcon },
]

/**
 * Layout is the main shell component for the KeyBastion frontend.
 * - Provides a responsive sidebar with navigation links for both regular users and admins.
 * - Handles role-based navigation (admin vs. user) and logout logic.
 * - Displays user info and adapts UI for mobile/desktop.
 * - Renders nested routes via <Outlet />.
 */
export default function Layout() {
  // Sidebar open state for mobile view
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Auth context: user info, logout function, and role checker
  const { user, logout, hasRole } = useAuth()
  // Current route location
  const location = useLocation()
  // Navigation helper
  const navigate = useNavigate()

  // Determine if user is admin
  const isAdmin = hasRole('ADMIN')
  
  // Select navigation items based on user role
  const navigation = isAdmin ? adminNavigation : userNavigation

  /**
   * Logs out the user and redirects to login page.
   */
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/*
        =============================
        Sidebar Navigation (Mobile)
        =============================
        Uses Headless UI's Dialog and Transition for animated sidebar on mobile.
        Shows navigation links based on user role (admin/user).
      */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full" style={{ backgroundColor: '#0369a1' /* primary-700 */ }}>
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                  <span className="ml-2 text-white text-xl font-bold">KeyBastion</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        group flex items-center px-2 py-2 text-base font-medium rounded-md
                        ${location.pathname === item.href
                          ? 'text-white'
                          : 'text-sky-100 hover:text-white'
                        }
                      ${location.pathname === item.href ? 'bg-sky-800' : 'hover:bg-sky-600'}
                      `}
                    >
                      <item.icon
                        className="mr-4 h-6 w-6 text-sky-300"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-sky-800 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div>
                      <UserCircleIcon className="h-9 w-9 text-sky-300" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{user?.username}</p>
                      <p className="text-xs font-mono text-sky-200 break-all max-w-[150px]">
                        {user?.id || `User: ${user?.username}`}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-sky-200 hover:text-white flex items-center mt-1"
                      >
                        <ArrowRightStartOnRectangleIcon className="mr-1 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
        </Dialog>
      </Transition.Root>

      {/*
        =============================
        Sidebar Navigation (Desktop)
        =============================
        Static sidebar for desktop, always visible.
        Shows navigation links based on user role (admin/user).
      */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0" style={{ backgroundColor: '#0369a1' /* primary-700 */ }}>
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
                <span className="ml-2 text-white text-xl font-bold">KeyBastion</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${location.pathname === item.href
                        ? 'text-white'
                        : 'text-sky-100 hover:text-white'
                      }
                      ${location.pathname === item.href ? 'bg-sky-800' : 'hover:bg-sky-600'}
                    `}
                  >
                    <item.icon
                      className="mr-3 h-5 w-5 text-sky-300"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-sky-800 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <UserCircleIcon className="h-9 w-9 text-sky-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs font-mono text-sky-200 break-all max-w-[150px]">
                      {user?.id || `User: ${user?.username}`}
                    </p>
                    {isAdmin && (
                      <p className="text-xs font-medium text-green-300 mt-1">
                        Administrator
                      </p>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-xs font-medium text-sky-200 hover:text-white flex items-center mt-1"
                    >
                      <ArrowRightStartOnRectangleIcon className="mr-1 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*
        =============================
        Main Content Area
        =============================
        Contains the top bar (mobile menu button) and renders nested routes.
      */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
