import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'advertiser') {
    return <Navigate to="/advertiser/campaigns" replace />
  }

  if (user?.role === 'ambassador') {
    return <Navigate to="/ambassador/assignments" replace />
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <Navigate to="/login" replace />
}
