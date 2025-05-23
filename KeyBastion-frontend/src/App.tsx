import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PasswordGenerator from './pages/PasswordGenerator'
import Passwords from './pages/Passwords'
import AddExistingPassword from './pages/AddExistingPassword'
import EditPassword from './pages/EditPassword'
import SharedCredentials from './pages/SharedCredentials'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminActivity from './pages/AdminActivity'
import AdminCategories from './pages/AdminCategories'
import NotFound from './pages/NotFound'
// Components
import Layout from './components/Layout'
import AdminRoute from './components/AdminRoute'
import UserRoute from './components/UserRoute'

function App() {
    const { isAuthenticated, hasRole } = useAuth()
    const isAdmin = hasRole('ADMIN')

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={isAdmin ? '/admin' : '/dashboard'} />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={isAdmin ? '/admin' : '/dashboard'} />} />

            {/* User routes - only accessible to authenticated non-admin users */}
            <Route element={<UserRoute />}>
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/password-generator" element={<PasswordGenerator />} />
                    <Route path="/generator" element={<PasswordGenerator />} /> {/* Keept this for backward compatibility */}
                    <Route path="/passwords" element={<Passwords />} />
                    <Route path="/passwords/add" element={<AddExistingPassword />} />
                    <Route path="/passwords/edit/:id" element={<EditPassword />} />
                    <Route path="/shared" element={<SharedCredentials />} />
                    <Route path="/shared-credentials" element={<SharedCredentials />} />
                </Route>
            </Route>

            {/* Admin routes - only accessible to authenticated admin users */}
            <Route element={<AdminRoute />}>
                <Route element={<Layout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/activity" element={<AdminActivity />} />
                    <Route path="/admin/categories" element={<AdminCategories />} />
                </Route>
            </Route>

            {/* Redirect root to appropriate dashboard based on auth status and role */}
            <Route path="/" element={
                isAuthenticated
                    ? (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)
                    : <Navigate to="/login" />
            } />

            {/* 404 handling */}
            <Route
                path="*"
                element={<NotFound />}
            />
        </Routes>
    )
}

export default App
