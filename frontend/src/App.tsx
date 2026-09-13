import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from './store/store'
import { checkAuth } from './store/authSlice'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FilesPage from './pages/FilesPage'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useSelector(
    (state: RootState) => state.auth.user,
  )

  const loading = useSelector(
    (state: RootState) => state.auth.loading,
  )

  if (loading) {
    return <p>Проверка авторизации...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AdminRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useSelector(
    (state: RootState) => state.auth.user,
  )

  const loading = useSelector(
    (state: RootState) => state.auth.loading,
  )

  if (loading) {
    return <p>Проверка авторизации...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.is_admin) {
    return <Navigate to="/files" replace />
  }

  return children
}

export default function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/files"
          element={
            <ProtectedRoute>
              <FilesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        <Route 
          path="/" element={<HomePage />} />

        <Route
          path="*"
          element={<Navigate to="/files" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
